import pandas as pd
import requests

# Load the CSV file for CPUs
df = pd.read_csv('cpus.csv')

# Function to clean and transform the DataFrame
def transform_data(df):
    # Drop rows where essential data is missing
    df.dropna(subset=['cpu_name', 'cpu_mark', 'thread_mark'], inplace=True)

    # Clean and convert numeric fields, handling commas in numbers
    df['price'] = pd.to_numeric(df['price'].replace(',', '', regex=True), errors='coerce')
    df['cpu_mark'] = pd.to_numeric(df['cpu_mark'].replace(',', '', regex=True), errors='coerce')
    df['thread_mark'] = pd.to_numeric(df['thread_mark'].replace(',', '', regex=True), errors='coerce')
    df['tdp'] = pd.to_numeric(df['tdp'], errors='coerce')
    df['cores'] = pd.to_numeric(df['cores'], errors='coerce')

    # Format date field
    df['test_date'] = pd.to_datetime(df['test_date'], errors='coerce').dt.strftime('%Y-%m-%d')

    return df.to_dict(orient='records')

# Transform the data
cpu_entries = transform_data(df)

# Strapi API URL for CPUs
api_url = 'http://localhost:1337/api/cpus'  # Adjust the URL according to your Strapi instance

# Function to post data to Strapi
def post_to_strapi(cpu_entries):
    for entry in cpu_entries:
        # Prepare the JSON data, wrapping it in a 'data' key and nested under 'CPU'
        entry_cleaned = {k: (v if pd.notna(v) else None) for k, v in entry.items()}  # Replace NaN with None
        
        # Create the payload for Strapi
        payload = {"data": {"CPU": entry_cleaned}}
        
        # Debug log to see the payload being sent
        print(f"Sending payload: {payload}")
        
        # Send POST request to Strapi
        response = requests.post(api_url, json=payload)
        if response.status_code == 201:
            print(f"Successfully added: {entry['cpu_name']}")
        else:
            print(f"Failed to add {entry['cpu_name']}: {response.content}")

# Post the CPU entries to Strapi
post_to_strapi(cpu_entries)
