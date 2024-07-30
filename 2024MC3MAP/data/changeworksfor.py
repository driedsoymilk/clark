import json
from datetime import datetime


def convert_date_format(date_str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%Y-%m-%dT00:00:00')
    except ValueError:
        return date_str

with open('/Users/idvl/2024MC3MAP/data/cleaned_data.json', 'r') as file:
    data = json.load(file)


for link in data.get('links',[]):
    if link.get('type') == 'Event.WorksFor':
        link['start_date'] = convert_date_format(link['start_date'])


with open('/Users/idvl/2024MC3MAP/data/finaldata.json', 'w') as file:
    json.dump(data, file, indent = 4)