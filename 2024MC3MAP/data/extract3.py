import json
import networkx as nx

with open('/Users/idvl/2024MC3MAP/data/datas.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

G = nx.Graph()

for node in nodes:
    G.add_node(node['id'])

for link in links:
    G.add_edge(link['source'], link['target'])

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

def extract_within_degrees(node_id, degrees):
    if node_id not in G:
        raise ValueError(f"Node {node_id} not found in the graph.")
    
    nodes_within_degrees = nx.single_source_shortest_path_length(G, node_id, cutoff=degrees).keys()

    subgraph_nodes = [node for node in nodes if node['id'] in nodes_within_degrees]
    subgraph_links = [link for link in links if link['source'] in nodes_within_degrees and link['target'] in nodes_within_degrees]

    modified_links = []
    for link in subgraph_links:
        modified_links.append(link) 

        end_date = parse_date(link.get('end_date'))
        if end_date:
            new_link = link.copy()
            new_link['start_date'] = end_date.strftime('%Y-%m-%dT%H:%M:%S')
            new_link['type'] = "Endof." + link['type']
            modified_links.append(new_link)

    subgraph_data = {'nodes': subgraph_nodes, 'links': modified_links}
    output_file = f'/Users/idvl/2024MC3MAP/data/subgraph_{node_id}_{degrees}_degrees.json'
    with open(output_file, 'w') as file:
        json.dump(subgraph_data, file, indent=4)

    print(f"Subgraph within {degrees} degrees of node {node_id} saved as '{output_file}'")

extract_within_degrees(node_id='SouthSeafood Express Corp', degrees=3)
