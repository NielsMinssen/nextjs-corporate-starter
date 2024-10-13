import requests

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

# Function to delete a CPU entry
def delete_cpu(cpu_id):
    delete_url = f"{api_url}/{cpu_id}"
    response = requests.delete(delete_url)
    if response.status_code == 200:
        print(f"Successfully deleted CPU {cpu_id}")
    else:
        print(f"Failed to delete CPU {cpu_id}: {response.content}")

# Main function to delete all CPUs
def delete_all_cpus():
    cpus = get_all_cpus()
    if cpus is None:
        return

    for cpu in cpus:
        delete_cpu(cpu['id'])

# Run the delete process
delete_all_cpus()
