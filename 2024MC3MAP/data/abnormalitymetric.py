import json
import networkx as nx
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

with open('/Users/idvl/2024MC3MAP/data/nodes_links.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

G = nx.Graph()

for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

def calculate_centralities(graph):
    local_closeness = nx.closeness_centrality(graph)
    global_pagerank = nx.pagerank(graph, tol=1e-2)
    meso_betweenness = nx.betweenness_centrality(graph, k=100)
    return local_closeness, global_pagerank, meso_betweenness

local_closeness, global_pagerank, meso_betweenness = calculate_centralities(G)

import community as community_louvain
partition = community_louvain.best_partition(G)

holes = nx.constraint(G)

features = []

for node in G.nodes():
    feature = [
        local_closeness[node],
        global_pagerank[node],
        meso_betweenness[node],
        holes.get(node, 0),
        partition[node]
    ]
    features.append(feature)

features_array = np.array(features)

isolation_forest = IsolationForest()
isolation_forest.fit(features_array)
anomaly_scores_if = isolation_forest.decision_function(features_array)

lof = LocalOutlierFactor(n_neighbors=20)
lof.fit(features_array)
lof_scores = lof.negative_outlier_factor_

q1_if, q3_if = np.percentile(anomaly_scores_if, [25, 75])
iqr_if = q3_if - q1_if
cutoff_if_upper = q3_if + 1.5 * iqr_if
cutoff_if_lower = q1_if - 1.5 * iqr_if

q1_lof, q3_lof = np.percentile(lof_scores, [25, 75])
iqr_lof = q3_lof - q1_lof
cutoff_lof_upper = q3_lof + 1.5 * iqr_lof
cutoff_lof_lower = q1_lof - 1.5 * iqr_lof

anomalies_if_upper = anomaly_scores_if > cutoff_if_upper
anomalies_if_lower = anomaly_scores_if < cutoff_if_lower
anomalies_lof_upper = lof_scores > cutoff_lof_upper
anomalies_lof_lower = lof_scores < cutoff_lof_lower

anomalies = anomalies_if_upper | anomalies_if_lower | anomalies_lof_upper | anomalies_lof_lower

suspicious_nodes = []
for node, anomaly, if_score, lof_score, feature in zip(G.nodes, anomalies, anomaly_scores_if, lof_scores, features):
    if anomaly:
        node_info = {
            'id': node,
            'anomaly_score_if': if_score,
            'anomaly_score_lof': lof_score,
            'features': {
                'local_closeness': feature[0],
                'global_pagerank': feature[1],
                'meso_betweenness': feature[2],
                'structural_hole_score': feature[3],
                'community': feature[4]
            }
        }
        suspicious_nodes.append(node_info)

with open('/Users/idvl/2024MC3MAP/data/suspicious_nodes_small.json', 'w') as f:
    json.dump(suspicious_nodes, f, indent=4)

print("Suspicious nodes have been saved to 'suspicious_nodes.json'.")
