import json

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

nodes = data.get('nodes', [])
links = data.get('links', [])



existing_links = set((link['source'], link['target']) for link in links)
existing_links.update((link['target'], link['source']) for link in links)

count = 0

for node in nodes:
    node_id = node['id']
    if 'HeadOfOrg' in node or 'PointOfContact' in node:
        head_of_org_id = node.get('HeadOfOrg')
        point_of_contact_id = node.get('PointOfContact')
        
        if head_of_org_id:
            if (node_id, head_of_org_id) not in existing_links and (head_of_org_id, node_id) not in existing_links:
                print(f"Company ID {node_id} has HeadOfOrg {head_of_org_id} but no link exists between them.")
                count += 1
        
        if point_of_contact_id:
            if (node_id, point_of_contact_id) not in existing_links and (point_of_contact_id, node_id) not in existing_links:
                print(f"Company ID {node_id} has PointOfContact {point_of_contact_id} but no link exists between them.")
                count += 1

print(count)
