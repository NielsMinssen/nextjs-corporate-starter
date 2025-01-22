import os
import json
import requests
from time import sleep

def upload_to_strapi(folder_path, api_endpoint):
    """
    Upload complete smartphone JSON data to Strapi database
    """
    headers = {
        'Content-Type': 'application/json'
    }

    for filename in os.listdir(folder_path):
        if not filename.endswith('.json'):
            continue

        file_path = os.path.join(folder_path, filename)
        
        try:
            # Read the JSON data
            with open(file_path, 'r', encoding='utf-8') as f:
                phone_data = json.load(f)

            # Structure for Strapi's API
            strapi_data = {
                "data": {
                    "phone": phone_data  # Put the phone data as attributes
                }
            }

            # Send POST request to Strapi
            response = requests.post(
                api_endpoint,
                headers=headers,
                json=strapi_data
            )

            if response.status_code in [200, 201]:
                print(f"Successfully uploaded: {filename}")
                print(f"Response: {response.json()}")
            else:
                print(f"Failed to upload {filename}: Status code {response.status_code}")
                print(f"Response: {response.text}")

            # Small delay between requests
            sleep(0.5)

        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")

# Usage
folder_path = 'resultsWeb'
api_endpoint = 'http://localhost:1337/api/phones'

upload_to_strapi(folder_path, api_endpoint)