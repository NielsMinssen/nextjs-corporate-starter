import pandas as pd
import requests
import json

# Load the CSV file with Amazon links
df_links = pd.read_csv('cpu_list.csv')

# Convert to a dictionary for easier lookup
amazon_links = dict(zip(df_links['cpu_name'], df_links['amazon_link']))

# Strapi API URL for CPUs
api_url = 'http://localhost:1337/api/cpus'  # Adjust the URL according to your Strapi instance

# Function to get all CPU entries from Strapi
def get_all_cpus():
    all_cpus = []
    page = 1
    while True:
        response = requests.get(f"{api_url}?pagination[page]={page}&pagination[pageSize]=100")
        if response.status_code == 200:
            data = response.json()
            all_cpus.extend(data['data'])
            if len(data['data']) < 100:  # Last page
                break
            page += 1
        else:
            print(f"Failed to fetch CPUs: {response.content}")
            return None
    return all_cpus

# Function to handle NaN values in JSON
def nan_to_none(obj):
    if isinstance(obj, float) and pd.isna(obj):
        return None
    elif isinstance(obj, dict):
        return {k: nan_to_none(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [nan_to_none(v) for v in obj]
    return obj

# Function to update a CPU entry with Amazon link
# Function to update a CPU entry with Amazon link
# Function to update a CPU entry with Amazon link inside the 'CPU' JSON object
# Function to update a CPU entry with Amazon link while keeping existing fields intact
def update_cpu_with_amazon_link(cpu_id, amazon_link):
    # Fetch the current CPU entry first
    response = requests.get(f"{api_url}/{cpu_id}")
    
    if response.status_code == 200:
        cpu_data = response.json()['data']['attributes']['CPU']  # Get the existing CPU data
        
        # Add the amazonLink to the existing CPU data (preserving other fields)
        cpu_data['amazonLink'] = amazon_link

        # Prepare the payload with the updated CPU data
        payload = {
            "data": {
                "CPU": cpu_data  # Update the entire CPU object with the new amazonLink
            }
        }

        # Convert NaN to None in the payload (just in case)
        payload = nan_to_none(payload)
        
        # Send the update request
        update_response = requests.put(f"{api_url}/{cpu_id}", json=payload)
        if update_response.status_code == 200:
            print(f"Successfully updated CPU {cpu_id} with Amazon link")
        else:
            print(f"Failed to update CPU {cpu_id}: {update_response.content}")
    else:
        print(f"Failed to fetch CPU {cpu_id}: {response.content}")




def update_all_cpus_with_amazon_links():
    cpus = get_all_cpus()
    if cpus is None:
        return

    for cpu in cpus:
        # Access the nested 'cpu_name' inside the 'CPU' object
        try:
            cpu_name = cpu['attributes']['CPU']['cpu_name']
        except KeyError:
            continue  # Skip to the next CPU if 'cpu_name' is not found

        if cpu_name in amazon_links and amazon_links[cpu_name]:
            update_cpu_with_amazon_link(cpu['id'], amazon_links[cpu_name])

# Run the update process
update_all_cpus_with_amazon_links()

