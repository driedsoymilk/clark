import json
from datetime import datetime

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])

nodes_dict = {node['id']: node for node in nodes}
links_set = {(link['source'], link['target']) for link in links}

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return datetime.strptime(date_str, '%Y-%m-%d')

missing_nodes = []
added_links = []

for node in nodes:
    company_id = node['id']
    head_of_org_id = node.get('HeadOfOrg')
    point_of_contact_id = node.get('PointOfContact')
    
    company_links = [link for link in links if link['source'] == company_id or link['target'] == company_id]
    if company_links:
        earliest_start_date = min(parse_date(link['start_date']) for link in company_links if parse_date(link['start_date']) is not None)
        start_date_str = earliest_start_date.strftime('%Y-%m-%dT%H:%M:%S')
    else:
        start_date_str = None
    
    if head_of_org_id:
        if head_of_org_id not in nodes_dict:
            missing_nodes.append((company_id, 'HeadOfOrg', head_of_org_id))
        elif (company_id, head_of_org_id) not in links_set and (head_of_org_id, company_id) not in links_set:
            new_link = {'source': company_id, 'target': head_of_org_id, 'type': 'HeadOfOrg', 'start_date': start_date_str}
            links.append(new_link)
            links_set.add((company_id, head_of_org_id))
            added_links.append(new_link)
    
    if point_of_contact_id:
        if point_of_contact_id not in nodes_dict:
            missing_nodes.append((company_id, 'PointOfContact', point_of_contact_id))
        elif (company_id, point_of_contact_id) not in links_set and (point_of_contact_id, company_id) not in links_set:
            new_link = {'source': company_id, 'target': point_of_contact_id, 'type': 'PointOfContact', 'start_date': start_date_str}
            links.append(new_link)
            links_set.add((company_id, point_of_contact_id))
            added_links.append(new_link)

updated_data = {'nodes': nodes, 'links': links}
with open('/Users/idvl/2024MC3MAP/data/updated_data_with_family_relationship_start_dates.json', 'w') as file:
    json.dump(updated_data, file, indent=4)

with open('/Users/idvl/2024MC3MAP/data/missing_nodes.txt', 'w') as file:
    for company_id, attr_type, person_id in missing_nodes:
        file.write(f"Company ID {company_id} has missing {attr_type}: {person_id}\n")

for link in added_links:
    print(f"Added link: {link}")

print("Missing nodes have been written to 'missing_nodes.txt'")
