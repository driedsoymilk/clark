import pandas as pd

nodes_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/nodes.csv')
links_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/links.csv')

node_columns = nodes_df.columns
link_columns = links_df.columns

missing_node_columns = set(link_columns) - set(node_columns)
missing_link_columns = set(node_columns) - set(link_columns)

for col in missing_node_columns:
    nodes_df[col] = None

for col in missing_link_columns:
    links_df[col] = None

combined_df = pd.concat([nodes_df, links_df], ignore_index=True)

combined_df.to_csv('/Users/idvl/2024MC3MAP/data/combined.csv', index=False)

print("Combined CSV saved as 'combined.csv'")
