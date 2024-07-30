import json
import networkx as nx


with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])


G = nx.Graph()


for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])


node_degrees = dict(G.degree())


sorted_node_degrees = sorted(node_degrees.items(), key=lambda x: x[1])

for node, degree in sorted_node_degrees:
    print(f"Node ID: {node}, Degree: {degree}")
