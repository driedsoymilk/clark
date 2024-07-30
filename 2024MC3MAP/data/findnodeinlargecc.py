import json
import networkx as nx
from datetime import datetime
import matplotlib.pyplot as plt

# Load the original JSON data
with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

# Load the matching links JSON data
with open('/Users/idvl/2024MC3MAP/data/matching_links.json', 'r') as file:
    matching_links = json.load(file)

# Create a graph
G = nx.Graph()

# Add nodes and edges to the graph
for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

# Find all connected components
connected_components = list(nx.connected_components(G))

# Identify the largest connected component
largest_component = max(connected_components, key=len)

# Create a subgraph of the largest component
largest_subgraph = G.subgraph(largest_component)

# Create a dictionary to store the number of founding links for each node's 1-degree sphere of influence
sphere_founding_counts = {}

# Function to parse date
def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

# Function to count founding links in the 1-degree sphere of influence
def count_foundings_within_1_degree(node, subgraph, matching_links):
    neighbors = list(subgraph.neighbors(node))
    nodes_within_1_degree = set(neighbors).union({node})
    count = sum(1 for link in matching_links if link['source'] in nodes_within_1_degree or link['target'] in nodes_within_1_degree)
    return count

# Iterate through each node in the largest component and count the founding links in its 1-degree sphere of influence
for node in largest_subgraph.nodes:
    founding_count = count_foundings_within_1_degree(node, largest_subgraph, matching_links)
    sphere_founding_counts[node] = founding_count

# Find the node with the maximum number of founding links in its 1-degree sphere of influence
max_node = max(sphere_founding_counts, key=sphere_founding_counts.get)
max_foundings = sphere_founding_counts[max_node]

# Output the node with the most founding links in its 1-degree sphere
print(f"Node with most foundings in its 1-degree sphere: {max_node} with {max_foundings} founding links")

# Prepare data for plotting
nodes_with_foundings = [node for node, count in sphere_founding_counts.items() if count > 0]
founding_counts = [sphere_founding_counts[node] for node in nodes_with_foundings]

# Plot the founding link counts for nodes in the largest component with at least one founding
plt.figure(figsize=(12, 6))
plt.bar(nodes_with_foundings, founding_counts, color='skyblue')
plt.xlabel('Node ID')
plt.ylabel('Number of Founding Links in 1-Degree Sphere')
plt.title('Number of Founding Links in 1-Degree Sphere for Nodes in Largest Component')
plt.xticks(rotation=90)
plt.tight_layout()
plt.show()
