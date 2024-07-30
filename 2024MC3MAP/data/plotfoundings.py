import json
import networkx as nx
import matplotlib.pyplot as plt
import random

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)


nodes = data.get('nodes', [])
links = data.get('links', [])

with open('/Users/idvl/2024MC3MAP/data/matching_links.json', 'r') as file:
    matching_links = json.load(file)

G = nx.Graph()

for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

connected_components = list(nx.connected_components(G))

component_founding_counts = {}

for component in connected_components:
    component_id = random.choice(list(component))
    founding_count = sum(1 for link in matching_links if link['source'] in component or link['target'] in component)
    if founding_count >= 2:
        component_founding_counts[component_id] = founding_count

sorted_components = sorted(component_founding_counts.items(), key=lambda x: x[1], reverse=True)

component_ids = [item[0] for item in sorted_components]
founding_counts = [item[1] for item in sorted_components]

plt.figure(figsize=(12, 6))
plt.bar(component_ids, founding_counts, color='skyblue')
plt.xlabel('Connected Component (Random Node ID)')
plt.ylabel('Number of Founding Links')
plt.title('Number of Founding Links per Connected Component')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
