import os
from bs4 import BeautifulSoup

def extract_CPU_names(html_file_path):
    """
    Extract CPU names from an HTML file using the specified class name.
    
    :param html_file_path: Path to the HTML file
    :return: List of CPU names
    """
    # Check if the file exists
    if not os.path.exists(html_file_path):
        print(f"Error: File {html_file_path} not found.")
        return []
    
    # Read the HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Parse the HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all elements with the specified class
    CPU_name_elements = soup.find_all('p', class_='Item__name___QfnBy')
    
    # Extract the text from these elements
    CPU_names = [element.get_text(strip=True) for element in CPU_name_elements]
    
    return CPU_names

def main():
    # Specify the path to your HTML file
    html_file_path = 'CPUs.html'  # Replace with your actual file path
    
    # Extract CPU names
    CPU_names = extract_CPU_names(html_file_path)
    
    # Print the list of CPU names in a format that can be used in Python code
    print("CPU Names = [")
    for name in CPU_names:
        print(f"    '{name}',")
    print("]")

if __name__ == '__main__':
    main()