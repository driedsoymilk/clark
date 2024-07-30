import pandas as pd

edges_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/edges.csv')

def replace_empty_dates(date):
    if pd.isna(date) or date == '':
        return '9999-12-31T00:00:00'
    return date

edges_df['end_date'] = edges_df['end_date'].apply(replace_empty_dates)

edges_df['time_interval'] = '[' + edges_df['start_date'] + ',' + edges_df['end_date'] + ']'

edges_df.to_csv('/Users/idvl/2024MC3MAP/data/edges_with_time_interval.csv', index=False)
