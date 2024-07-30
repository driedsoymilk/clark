import json
import networkx as nx
import matplotlib.pyplot as plt

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

# Find all connected components
connected_components = list(nx.connected_components(G))

# Calculate the size of each connected component
component_sizes = [len(component) for component in connected_components]

# Sort the component sizes from biggest to smallest
component_sizes_sorted = sorted(component_sizes, reverse=True)

component_sizes_sortedright = sorted(component_sizes)
print(component_sizes_sortedright)
# Plot the sizes of the connected components
plt.figure(figsize=(10, 6))
plt.plot(component_sizes_sorted, marker='o')
plt.xlabel('Connected Component Index')
plt.ylabel('Size of Connected Component')
plt.title('Size of Connected Components from Biggest to Smallest')
plt.grid(True)
plt.tight_layout()
plt.show()


