import json
import networkx as nx
import numpy as np
import pandas as pd

# Load JSON data
with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

# Create a graph
G = nx.Graph()

# Add nodes and edges to the graph
for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

# Function to calculate the spread metric
def calculate_spread_metric(graph):
    degrees = [degree for node, degree in graph.degree()]
    return np.std(degrees)  # Standard deviation of degrees

# Find the correct node ID for Southseafood Express Corp
southseafood_id = None
for node in nodes:
    if node.get('id', '').lower() == 'southseafood express corp':
        southseafood_id = node['id']
        break

if southseafood_id is None:
    raise ValueError("Southseafood Express Corp not found in the nodes.")

# Find Southseafood Express Corp's connected component
southseafood_component = nx.node_connected_component(G, southseafood_id)
southseafood_subgraph = G.subgraph(southseafood_component)
southseafood_metric = calculate_spread_metric(southseafood_subgraph)
southseafood_size = len(southseafood_component)

# Calculate spread metric for all connected components
connected_components = list(nx.connected_components(G))
metrics = []
for component in connected_components:
    if southseafood_id not in component:  # Exclude Southseafood component from general metrics
        subgraph = G.subgraph(component)
        metric = calculate_spread_metric(subgraph)
        size = len(component)
        # Add a random node from the component for identification
        random_node = next(iter(component))
        metrics.append((random_node, metric, size))

# Sort metrics by closeness to Southseafood's metric
metrics_sorted = sorted(metrics, key=lambda x: abs(x[1] - southseafood_metric))

# Prepare data for the CSV file
data = {
    'Node ID': [southseafood_id] + [metric[0] for metric in metrics_sorted],
    'Spread Metric': [southseafood_metric] + [metric[1] for metric in metrics_sorted],
    'Component Size': [southseafood_size] + [metric[2] for metric in metrics_sorted]
}

# Create a DataFrame
df = pd.DataFrame(data)

# Save the DataFrame to a CSV file
df.to_csv('/Users/idvl/2024MC3MAP/data/connected_components_metrics.csv', index=False)

print(f"CSV file 'connected_components_metrics.csv' created successfully.")
