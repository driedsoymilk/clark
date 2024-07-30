
import json
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# Load JSON file
with open('/Users/idvl/2024MC3MAP/data/component_SouthSeafood Express Corp.json', 'r') as file:
    data = json.load(file)

# Extract nodes and links
nodes = data['nodes']
links = data['links']

# Create a DataFrame for links with time intervals
links_df = pd.DataFrame(links)
links_df['start_date'] = pd.to_datetime(links_df['start_date'])
links_df['end_date'] = pd.to_datetime(links_df['end_date'], errors='coerce')

# If end_date is NaN, set it to a future date
links_df['end_date'] = links_df['end_date'].fillna(datetime.now() + timedelta(days=365*10))

# Function to calculate PageRank without scipy
def simple_pagerank(G, alpha=0.85, max_iter=100, tol=1.0e-6):
    nodes = list(G.nodes())
    N = len(nodes)
    if N == 0:
        return {}

    # Initialize the PageRank dict with each node having a rank of 1/N
    pagerank = {node: 1.0 / N for node in nodes}
    
    for _ in range(max_iter):
        prev_pagerank = pagerank.copy()
        for node in nodes:
            rank_sum = 0
            for pred in G.predecessors(node):
                rank_sum += prev_pagerank[pred] / len(list(G.successors(pred)))
            pagerank[node] = (1 - alpha) / N + alpha * rank_sum
        
        # Check for convergence
        err = sum(abs(pagerank[node] - prev_pagerank[node]) for node in nodes)
        if err < tol:
            break

    return pagerank

# Define the time range for the analysis
time_range = pd.date_range(start=links_df['start_date'].min(), end=links_df['end_date'].max(), freq='M')

# Dictionary to store PageRank scores over time
pagerank_scores = {node['id']: [] for node in nodes}

# Calculate PageRank for each time period
for current_time in time_range:
    # Create a directed graph for the current time period
    G = nx.DiGraph()
    G.add_nodes_from([node['id'] for node in nodes])
    
    # Add edges that are active in the current time period
    active_links = links_df[(links_df['start_date'] <= current_time) & (links_df['end_date'] >= current_time)]
    for _, link in active_links.iterrows():
        G.add_edge(link['source'], link['target'])
    
    # Calculate PageRank
    pagerank = simple_pagerank(G)
    
    # Store the PageRank scores
    for node_id in pagerank_scores:
        pagerank_scores[node_id].append(pagerank.get(node_id, 0))

# Convert the dictionary to a DataFrame for plotting
pagerank_df = pd.DataFrame(pagerank_scores, index=time_range)

import ipywidgets as widgets
from IPython.display import display

# Function to update the plot based on the selected node
def update_plot(node_id):
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.plot(pagerank_df.index, pagerank_df[node_id], label=node_id)
    ax.set_title(f'PageRank Scores Over Time for Node {node_id}')
    ax.set_xlabel('Time')
    ax.set_ylabel('PageRank Score')
    ax.legend(title='Node')
    plt.tight_layout()
    plt.show()

# Create a dropdown widget for node selection
node_dropdown = widgets.Dropdown(
    options=pagerank_df.columns,
    description='Node:',
    disabled=False,
)

# Set up the interaction
widgets.interact(update_plot, node_id=node_dropdown)
