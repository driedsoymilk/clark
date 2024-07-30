import json

# Load JSON data
with open('/Users/idvl/2024MC3MAP/data/data.json', 'r') as file:
    data = json.load(file)

# Extract nodes and links
nodes = data.get('nodes', [])
links = data.get('links', [])

# Save nodes to a new JSON file
with open('/Users/idvl/2024MC3MAP/data/nodes.json', 'w') as file:
    json.dump(nodes, file, indent=4)

# Save links to a new JSON file
with open('/Users/idvl/2024MC3MAP/data/links.json', 'w') as file:
    json.dump(links, file, indent=4)

# Debug: Print the nodes and links to verify
print("Nodes:")
for node in nodes:
    print(node)

print("Links:")
for link in links:
    print(link)
