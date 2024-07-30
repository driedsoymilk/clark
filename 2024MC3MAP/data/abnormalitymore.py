import json
import networkx as nx
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

G = nx.Graph()

for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

start_date = datetime(2034, 1, 1)
end_date = datetime(2036, 1, 1)

time_windows = []
current_date = start_date

while current_date <= end_date:
    time_windows.append(current_date)
    current_date += relativedelta(months=1)

print(f"Number of snapshots: {len(time_windows)}")
print(f"First snapshot: {time_windows[0].strftime('%Y-%m-%dT%H:%M:%S')}")
print(f"Last snapshot: {time_windows[-1].strftime('%Y-%m-%dT%H:%M:%S')}")

def create_snapshot(time):
    snapshot = nx.Graph()
    for node in nodes:
        snapshot.add_node(node['id'])
    for link in links:
        start_date = parse_date(link.get('start_date'))
        end_date = parse_date(link.get('end_date'))
        if start_date and start_date <= time and (not end_date or end_date >= time):
            snapshot.add_edge(link['source'], link['target'])
    return snapshot

snapshots = [create_snapshot(time) for time in time_windows]

def calculate_centralities(snapshot):
    local_closeness = nx.closeness_centrality(snapshot)
    global_pagerank = nx.pagerank(snapshot, tol=1e-2) 
    meso_betweenness = nx.betweenness_centrality(snapshot, k=100)
    return local_closeness, global_pagerank, meso_betweenness

centralities = {node['id']: {'local': [], 'global': [], 'meso': []} for node in nodes}

for snapshot in snapshots:
    local_closeness, global_pagerank, meso_betweenness = calculate_centralities(snapshot)
    for node in snapshot.nodes():
        centralities[node]['local'].append(local_closeness[node])
        centralities[node]['global'].append(global_pagerank[node])
        centralities[node]['meso'].append(meso_betweenness[node])

import community as community_louvain

partition = community_louvain.best_partition(G)

holes = nx.constraint(G)

features = []

for node in G.nodes():
    local_variance = np.var(centralities[node]['local'])
    global_variance = np.var(centralities[node]['global'])
    meso_variance = np.var(centralities[node]['meso'])
    structural_hole_score = holes.get(node, 0)
    community = partition[node]

    features.append([
        local_variance, global_variance, meso_variance, structural_hole_score, community
    ])

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
                'local_variance': feature[0],
                'global_variance': feature[1],
                'meso_variance': feature[2],
                'structural_hole_score': feature[3],
                'community': feature[4]
            }
        }
        suspicious_nodes.append(node_info)

with open('/Users/idvl/2024MC3MAP/data/suspicious_nodes.json', 'w') as f:
    json.dump(suspicious_nodes, f, indent=4)

print("Suspicious nodes have been saved to 'suspicious_nodes.json'.")
