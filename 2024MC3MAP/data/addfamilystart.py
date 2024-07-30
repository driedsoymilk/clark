import pandas as pd
from datetime import datetime

edges_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/edges.csv')

earliest_start_date = None

for date in edges_df['start_date']:
    if pd.notna(date) and date != '':
        date_obj = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S')
        if earliest_start_date is None or date_obj < earliest_start_date:
            earliest_start_date = date_obj

earliest_start_date_str = earliest_start_date.strftime('%Y-%m-%dT00:00:00')

print(f"Earliest start date found: {earliest_start_date_str}")

for i, row in edges_df.iterrows():
    if row['type'] == 'Relationship.FamilyRelationship' and (pd.isna(row['start_date']) or row['start_date'] == ''):
        edges_df.at[i, 'start_date'] = earliest_start_date_str

edges_df['time_interval'] = '[' + edges_df['start_date'] + ',' + edges_df['end_date'] + ']'

edges_df.to_csv('/Users/idvl/2024MC3MAP/data/edges_with_time_interval.csv', index=False)

print(edges_df[edges_df['type'] == 'Relationship.FamilyRelationship'])
