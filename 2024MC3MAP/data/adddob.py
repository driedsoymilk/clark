import json

with open('/Users/idvl/2024MC3MAP/data/data.json', 'r') as file:
    data = json.load(file)


for node in data['nodes']:
    if 'dob' not in node:
        node['dob'] = None 


with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'w') as file:
    json.dump(data, file, indent = 4)