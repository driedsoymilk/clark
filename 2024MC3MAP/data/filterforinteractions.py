import json
from datetime import datetime

def are_dates_equal(date1, date2):
    if not date1 or not date2 or date1 == '' or date2 == '':
        return False
    try:
        dt1 = datetime.strptime(date1, '%Y-%m-%dT%H:%M:%S')
        dt2 = datetime.strptime(date2, '%Y-%m-%dT%H:%M:%S')
        return dt1 == dt2
    except ValueError:
        return False

with open('/Users/idvl/2024MC3MAP/data/finaldata.json', 'r') as file:
    data = json.load(file)

links = data.get('links', [])
interactions = []

for i in range(len(links)):
    link1 = links[i]
    if link1.get('end_date') and link1['end_date'] != '':
        for j in range(len(links)):
            if i != j:
                link2 = links[j]
                if link2.get('start_date') and link2['start_date'] != '' and link1['type'] == link2['type']:
                    if are_dates_equal(link1['end_date'], link2['start_date']):
                        if link1['target'] == link2['target']:
                            interaction = {
                                'date': link1['end_date'],
                                'type': f"Transfer of {link1['type']}",
                                'of' : link1['target'],
                                'from': link1['source'],
                                'to': link2['source'] 
                            }
                            interactions.append(interaction)

with open('/Users/idvl/2024MC3MAP/data/interactions.json', 'w') as file:
    json.dump(interactions, file, indent=4)

print(f"Found {len(interactions)} interactions.")
