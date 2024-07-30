import pandas as pd

nodes_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/nodes.csv')
edges_df = pd.read_csv('/Users/idvl/2024MC3MAP/data/edges.csv')

source_nodes = edges_df['source'].unique()
target_nodes = edges_df['target'].unique()

source_nodes_df = nodes_df[nodes_df['id'].isin(source_nodes)]
target_nodes_df = nodes_df[nodes_df['id'].isin(target_nodes)]


source_nodes_df.to_csv('/Users/idvl/2024MC3MAP/data/source_nodes.csv', index = False)
target_nodes_df.to_csv('/Users/idvl/2024MC3MAP/data/target_nodes.csv', index = False)