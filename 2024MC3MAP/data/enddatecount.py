import json
from collections import defaultdict, Counter
from datetime import datetime
import matplotlib.pyplot as plt

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return None

with open('/Users/idvl/2024MC3MAP/data/dataa.json', 'r') as file:
    data = json.load(file)

links = data.get('links', [])

end_dates_per_node = defaultdict(list)

for link in links:
    end_date = parse_date(link.get('end_date'))
    if end_date:
        end_dates_per_node[link['source']].append(end_date)
        end_dates_per_node[link['target']].append(end_date)

max_end_dates_count = {}
for node, dates in end_dates_per_node.items():
    date_counts = Counter(dates)
    max_count = max(date_counts.values())
    if max_count > 1:
        max_end_dates_count[node] = max_count

nodes, counts = zip(*sorted(max_end_dates_count.items(), key=lambda item: item[1], reverse=True))
print(counts)

plt.figure(figsize=(10, 6))
plt.bar(nodes, counts)
plt.xlabel('Nodes')
plt.ylabel('Maximum Number of Links Ending on the Same Day')
plt.title('Nodes with Multiple Links Ending on the Same Day')
plt.xticks(rotation=90)
plt.tight_layout()
plt.show()
