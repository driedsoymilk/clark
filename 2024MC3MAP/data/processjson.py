import json

with open('/Users/idvl/2024MC3MAP/data/finaldata.json', 'r') as file:
    data = json.load(file)


for link in data['links']:
    if 'end_date' not in link:
        link['end_date'] = None 


with open('/Users/idvl/2024MC3MAP/data/data.json', 'w') as file:
    json.dump(data, file, indent = 4)