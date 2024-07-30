import json

with open('/Users/idvl/2024MC3MAP/data/data_with_family_relationship_start_dates.json', 'r') as file:
    data = json.load(file)

metadata_attributes = ["_last_edited_by", "_last_edited_date", "_date_added", "_raw_source", "_algorithm"]

def remove_metadata(item):
    for attr in metadata_attributes:
        if attr in item:
            del item[attr]

for node in data.get('nodes', []):
    remove_metadata(node)

for link in data.get('links', []):
    remove_metadata(link)

with open('/Users/idvl/2024MC3MAP/data/cleaned_data.json', 'w') as file:
    json.dump(data, file, indent=4)

print("Cleaned nodes:")
for node in data.get('nodes', []):
    print(node)

print("Cleaned links:")
for link in data.get('links', []):
    print(link)
