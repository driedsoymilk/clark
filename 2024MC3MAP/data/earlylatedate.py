import json
from datetime import datetime
import heapq

def parse_date(date_str):
    if not date_str or date_str == '':
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return None

with open('/Users/idvl/2024MC3MAP/data/mc3.json', 'r') as file:
    data = json.load(file)

links = data.get('links', [])

earliest_dates = []
latest_dates = []

for link in links:
    start_date = parse_date(link.get('start_date'))
    end_date = parse_date(link.get('end_date'))
    
    if start_date:
        heapq.heappush(earliest_dates, start_date)
        if len(earliest_dates) > 2:
            heapq.heappop(earliest_dates)
        heapq.heappush(latest_dates, (-start_date.timestamp(), start_date))
        if len(latest_dates) > 2:
            heapq.heappop(latest_dates)
    
    if end_date:
        heapq.heappush(earliest_dates, end_date)
        if len(earliest_dates) > 2:
            heapq.heappop(earliest_dates)
        heapq.heappush(latest_dates, (-end_date.timestamp(), end_date))
        if len(latest_dates) > 2:
            heapq.heappop(latest_dates)

earliest_dates = sorted(earliest_dates)
latest_dates = sorted([date for _, date in latest_dates])

if earliest_dates:
    print("Two earliest dates:")
    for date in earliest_dates:
        print(date.strftime('%Y-%m-%dT%H:%M:%S'))
else:
    print("No valid earliest dates found.")

if latest_dates:
    print("Two latest dates:")
    for date in latest_dates:
        print(date.strftime('%Y-%m-%dT%H:%M:%S'))
else:
    print("No valid latest dates found.")



