import pandas as pd
import requests
import json

# Load the CSV file with Amazon links
df_links = pd.read_csv('gpu_list.csv')

# Convert to a dictionary for easier lookup
amazon_links = dict(zip(df_links['videocard_name'], df_links['amazon_link']))

# Strapi API URL for gpus
api_url = 'http://localhost:1337/api/gpus'  # Adjust the URL according to your Strapi instance

# Function to get all gpu entries from Strapi
def get_all_gpus():
    all_gpus = []
    page = 1
    while True:
        response = requests.get(f"{api_url}?pagination[page]={page}&pagination[pageSize]=100")
        if response.status_code == 200:
            data = response.json()
            all_gpus.extend(data['data'])
            if len(data['data']) < 100:  # Last page
                break
            page += 1
        else:
            print(f"Failed to fetch gpus: {response.content}")
            return None
    return all_gpus

# Function to handle NaN values in JSON
def nan_to_none(obj):
    if isinstance(obj, float) and pd.isna(obj):
        return None
    elif isinstance(obj, dict):
        return {k: nan_to_none(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [nan_to_none(v) for v in obj]
    return obj

# Function to update a gpu entry with Amazon link
# Function to update a gpu entry with Amazon link
# Function to update a gpu entry with Amazon link inside the 'gpu' JSON object
# Function to update a gpu entry with Amazon link while keeping existing fields intact
def update_gpu_with_amazon_link(gpu_id, amazon_link):
    # Fetch the current gpu entry first
    response = requests.get(f"{api_url}/{gpu_id}")
    
    if response.status_code == 200:
        gpu_data = response.json()['data']['attributes']['GPU']  # Get the existing gpu data
        
        # Add the amazonLink to the existing gpu data (preserving other fields)
        gpu_data['amazonLink'] = amazon_link

        # Prepare the payload with the updated gpu data
        payload = {
            "data": {
                "GPU": gpu_data  # Update the entire gpu object with the new amazonLink
            }
        }

        # Convert NaN to None in the payload (just in case)
        payload = nan_to_none(payload)
        
        # Send the update request
        update_response = requests.put(f"{api_url}/{gpu_id}", json=payload)
        if update_response.status_code == 200:
            print(f"Successfully updated gpu {gpu_id} with Amazon link")
        else:
            print(f"Failed to update gpu {gpu_id}: {update_response.content}")
    else:
        print(f"Failed to fetch gpu {gpu_id}: {response.content}")




def update_all_gpus_with_amazon_links():
    gpus = get_all_gpus()
    if gpus is None:
        return

    for gpu in gpus:
        # Access the nested 'videocard_name' inside the 'gpu' object
        try:
            videocard_name = gpu['attributes']['GPU']['videocard_name']
        except KeyError:
            continue  # Skip to the next gpu if 'videocard_name' is not found

        if videocard_name in amazon_links and amazon_links[videocard_name]:
            update_gpu_with_amazon_link(gpu['id'], amazon_links[videocard_name])

# Run the update process
update_all_gpus_with_amazon_links()

