import json
from datetime import datetime, timedelta

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

def is_valid_interaction(end_date, start_date):
    return end_date <= start_date and (start_date - end_date).days <= 7

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

interactions_nodes = set()
interactions_links = []

for i in range(len(links)):
    link1 = links[i]
    end_date1 = parse_date(link1.get('end_date'))
    
    if end_date1:
        for j in range(len(links)):
            if i != j:
                link2 = links[j]
                start_date2 = parse_date(link2.get('start_date'))
                
                if start_date2 and link1['type'] == link2['type'] and link1['target'] == link2['target']:
                    if is_valid_interaction(end_date1, start_date2):
                        interactions_nodes.add(link1['source'])
                        interactions_nodes.add(link1['target'])
                        interactions_nodes.add(link2['source'])
                        interactions_links.append(link1)
                        interactions_links.append(link2)

filtered_nodes = [node for node in nodes if node['id'] in interactions_nodes]
filtered_links = list({(link['source'], link['target']): link for link in interactions_links}.values())

filtered_data = {'nodes': filtered_nodes, 'links': filtered_links}
with open('/Users/idvl/2024MC3MAP/data/interactionswithof.json', 'w') as file:
    json.dump(filtered_data, file, indent=4)

