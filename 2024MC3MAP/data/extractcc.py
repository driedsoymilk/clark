import json
import networkx as nx

def extract_connected_component(node_id):
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
    component_links = [link for link in links if G.has_edge(link['source'], link['target']) and link['source'] in connected_component and link['target'] in connected_component]


    component_data = {'nodes': component_nodes, 'links': component_links}
    output_file = f'/Users/idvl/2024MC3MAP/data/component_{node_id}.json'
    with open(output_file, 'w') as file:
        json.dump(component_data, file, indent=4)



    print(f"Connected component saved as '{output_file}'")

extract_connected_component(node_id="SouthSeafood Express Corp")
