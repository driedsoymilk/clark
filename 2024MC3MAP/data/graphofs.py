import json
from collections import Counter
import matplotlib.pyplot as plt

with open('/Users/idvl/2024MC3MAP/data/interactions_within_week.json', 'r') as file:
    interactions_data = json.load(file)

company_counter = Counter()
for interaction in interactions_data:
    company = interaction.get('of')
    if company:
        company_counter[company] += 1

companies, counts = zip(*company_counter.most_common())

plt.figure(figsize=(10, 6))
plt.bar(companies, counts)
plt.xlabel('Companies')
plt.ylabel('Number of Occurrences')
plt.title('Number of Times Each Company Shows Up in "of" Interactions')
plt.xticks(rotation=90)
plt.tight_layout()
plt.show()
