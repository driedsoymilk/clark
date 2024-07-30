import json
import networkx as nx
import numpy as np
import matplotlib.pyplot as plt

# Load the original JSON data
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

# Function to calculate the Gini coefficient
def gini_coefficient(array):
    array = np.array(array, dtype=float)  # Ensure all values are floats
    array = array.flatten()
    if np.amin(array) < 0:
        array -= np.amin(array)  # Values cannot be negative
    array += 0.0000001  # Values cannot be 0
    array = np.sort(array)  # Sort values
    index = np.arange(1, array.shape[0] + 1)  # Index per array element
    n = array.shape[0]
    gini = (np.sum((2 * index - n - 1) * array)) / (n * np.sum(array))
    return gini

# Categorize components
categories = {'Centralized': 0, 'Decentralized': 0, 'Distributed': 0}
for component in connected_components:
    subgraph = G.subgraph(component)
    degrees = [degree for node, degree in subgraph.degree()]
    gini = gini_coefficient(degrees)
    
    if gini > 0.6:
        categories['Centralized'] += 1
    elif gini > 0.3:
        categories['Decentralized'] += 1
    else:
        categories['Distributed'] += 1

# Plot the number of each type of component
plt.figure(figsize=(8, 6))
plt.bar(categories.keys(), categories.values(), color=['red', 'blue', 'green'])
plt.xlabel('Component Type')
plt.ylabel('Number of Components')
plt.title('Number of Each Type of Connected Component')
plt.tight_layout()
plt.show()
