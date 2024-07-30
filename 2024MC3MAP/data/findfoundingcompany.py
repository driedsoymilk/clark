import json
import random
import networkx as nx
from datetime import datetime

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

# Function to parse date
def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

# Dictionary to store founding links by connected component
founding_links_by_component = {}

# Iterate through each connected component
for component in connected_components:
    component_id = random.choice(list(component))
    founding_links = []
    for link in matching_links:
        if link['source'] in component or link['target'] in component:
            founding_links.append(link)
    if founding_links:
        founding_links_by_component[component_id] = founding_links

# Save the grouped founding links to a new JSON file
with open('/Users/idvl/2024MC3MAP/data/grouped_founding_links.json', 'w') as file:
    json.dump(founding_links_by_component, file, indent=4)

print(f"Founding links have been grouped by connected component and saved to 'grouped_founding_links.json'.")
