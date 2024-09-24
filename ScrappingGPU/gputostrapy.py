import pandas as pd
import requests

# Load the CSV file
df = pd.read_csv('graphics_cards.csv')

# Function to clean and transform the DataFrame
def transform_data(df):
    # Drop rows where essential data is missing
    df.dropna(subset=['videocard_name', 'g3d_mark', 'g2d_mark'], inplace=True)

    # Clean and convert numeric fields, handling commas in numbers
    df['price'] = pd.to_numeric(df['price'].replace(',', '', regex=True), errors='coerce')
    df['g3d_mark'] = pd.to_numeric(df['g3d_mark'].replace(',', '', regex=True), errors='coerce')
    df['g2d_mark'] = pd.to_numeric(df['g2d_mark'].replace(',', '', regex=True), errors='coerce')
    df['tdp'] = pd.to_numeric(df['tdp'], errors='coerce')
    df['vram'] = pd.to_numeric(df['vram'], errors='coerce')

    # Format date field
    df['test_date'] = pd.to_datetime(df['test_date'], errors='coerce').dt.strftime('%Y-%m-%d')

    return df.to_dict(orient='records')

# Transform the data
gpu_entries = transform_data(df)

# Strapi API URL
api_url = 'http://localhost:1337/api/gpus'  # Adjust the URL according to your Strapi instance

# Function to post data to Strapi
def post_to_strapi(gpu_entries):
    for entry in gpu_entries:
        # Prepare the JSON data, wrapping it in a 'data' key and nested under 'GPU'
        entry_cleaned = {k: (v if pd.notna(v) else None) for k, v in entry.items()}  # Replace NaN with None
        
        # Create the payload for Strapi
        payload = {"data": {"GPU": entry_cleaned}}
        
        # Debug log to see the payload being sent
        print(f"Sending payload: {payload}")
        
        response = requests.post(api_url, json=payload)
        if response.status_code == 201:
            print(f"Successfully added: {entry['videocard_name']}")
        else:
            print(f"Failed to add {entry['videocard_name']}: {response.content}")

# Post the GPU entries to Strapi
post_to_strapi(gpu_entries)
