import json

def extract_nodes_and_create_json(interactions_file, original_file, output_file):
    with open(interactions_file, 'r') as file:
        interactions_data = json.load(file)

    with open(original_file, 'r') as file:
        original_data = json.load(file)



    original_nodes = original_data.get('nodes', [])
    interactions_links = interactions_data

    node_ids = set()
    for link in interactions_links:
        node_ids.add(link['from'])
        node_ids.add(link['to'])

    interaction_nodes = [node for node in original_nodes if node['id'] in node_ids]

    transformed_links = []
    for link in interactions_links:
        transformed_link = {
            'source': link['from'],
            'target': link['to'],
            'type': link['type'],
            'start_date': link['date_start'],
            'end_date': link['date_end'],
            'of' : link['of']
        }
        transformed_links.append(transformed_link)


    complete_data = {'nodes': interaction_nodes, 'links': transformed_links}


    with open(output_file, 'w') as file:
        json.dump(complete_data, file, indent=4)

    print(f"Complete JSON with interactions and nodes saved as '{output_file}'")


interactions_file = '/Users/idvl/2024MC3MAP/data/interactions_within_week.json'
original_file = '/Users/idvl/2024MC3MAP/data/dataa.json'
output_file = '/Users/idvl/2024MC3MAP/data/complete_interactions_with_nodes.json'
extract_nodes_and_create_json(interactions_file, original_file, output_file)
