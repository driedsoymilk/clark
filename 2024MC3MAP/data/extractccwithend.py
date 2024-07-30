import json
import networkx as nx
from datetime import datetime

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return None

def extract_and_modify_connected_component(node_id):
    with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
        data = json.load(file)

    nodes = data.get('nodes', [])
    links = data.get('links', [])

    G = nx.Graph()

    for node in nodes:
        G.add_node(node['id'])

    for link in links:
        G.add_edge(link['source'], link['target'])

    if node_id not in G:
        print(f"Node {node_id} not found in the graph.")
        return

    connected_component = nx.node_connected_component(G, node_id)


    component_nodes = [node for node in nodes if node['id'] in connected_component]
    component_links = [link for link in links if link['source'] in connected_component and link['target'] in connected_component]


    modified_links = []
    for link in component_links:
        modified_links.append(link) 
        end_date = parse_date(link.get('end_date'))
        if end_date:
            new_link = link.copy()
            new_link['start_date'] = end_date.strftime('%Y-%m-%dT%H:%M:%S')
            new_link['type'] = "Endof." + link['type']
            modified_links.append(new_link)

    component_data = {'nodes': component_nodes, 'links': modified_links}
    output_file = f'/Users/idvl/2024MC3MAP/data/componentend_{node_id}.json'
    with open(output_file, 'w') as file:
        json.dump(component_data, file, indent=4)

    print(f"Connected component saved as '{output_file}'")


extract_and_modify_connected_component(node_id="Patrick Mueller")
