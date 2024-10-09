import itertools
import urllib.parse
import os
from datetime import datetime

def load_gpu_list(gpu_list_file):
    """
    Load the list of GPUs from a text file.
    Each line in the file should be a GPU name.
    """
    with open(gpu_list_file, 'r', encoding='utf-8') as file:
        gpu_list = [line.strip() for line in file if line.strip()]
    return gpu_list

def sanitize_gpu_name(gpu_name):
    """
    Replace spaces and other unwanted characters with dashes.
    """
    sanitized = gpu_name.replace(' ', '-')
    while '--' in sanitized:
        sanitized = sanitized.replace('--', '-')
    sanitized = urllib.parse.quote(sanitized, safe='-')
    return sanitized

def generate_combinations(gpu_names):
    """
    Generate all unique combinations of two GPUs, ordered alphabetically.
    """
    sorted_gpus = sorted(gpu_names)
    combinations = list(itertools.combinations(sorted_gpus, 2))
    return combinations

def create_sitemap(combinations, base_url, output_file):
    """
    Create a sitemap XML file from the list of GPU combinations.
    """
    sitemap_header = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
'''
    sitemap_footer = '</urlset>'
    url_entries = []

    languages = ['en', 'es', 'fr']  # Language variants

    for gpu1, gpu2 in combinations:
        gpu1_sanitized = sanitize_gpu_name(gpu1)
        gpu2_sanitized = sanitize_gpu_name(gpu2)
        
        # Create the base URL for this combination
        relative_url = f"{gpu1_sanitized}-vs-{gpu2_sanitized}"
        
        # Collecting alternate URLs
        alternate_links = []
        for lang in languages:
            full_url = f"{base_url}/{lang}/gpu/compare/{relative_url}"
            alternate_links.append(f'<xhtml:link rel="alternate" hreflang="{lang}" href="{full_url}" />')

        # Construct the XML entry for the current URL
        lastmod_date = datetime.now().strftime("%Y-%m-%d")  # Set last modified date to today
        url_entry = f"""  <url>
    <loc>{base_url}/{languages[0]}/gpu/compare/{relative_url}</loc>
    {"\n    ".join(alternate_links)}
    <lastmod>{lastmod_date}</lastmod>
    <priority>1.0</priority>
  </url>"""
        
        url_entries.append(url_entry)

    sitemap_content = sitemap_header + "\n".join(url_entries) + "\n" + sitemap_footer

    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(sitemap_content)
    print(f"Sitemap successfully created with {len(url_entries)} URLs at '{output_file}'.")

def main():
    # Configuration
    gpu_list_file = 'gpu_list.txt'     # Path to your GPU list file
    base_url = 'https://specompare.com'  # Base URL of your site
    output_sitemap = 'gpu_sitemap.xml'  # Output sitemap file name

    # Check if GPU list file exists
    if not os.path.isfile(gpu_list_file):
        print(f"Error: GPU list file '{gpu_list_file}' not found.")
        return

    # Load GPU list
    gpu_list = load_gpu_list(gpu_list_file)
    print(f"Loaded {len(gpu_list)} GPUs from '{gpu_list_file}'.")

    if len(gpu_list) < 2:
        print("Error: Need at least two GPUs to generate combinations.")
        return

    # Generate combinations
    combinations = generate_combinations(gpu_list)
    print(f"Generated {len(combinations)} unique GPU combinations.")

    # Create sitemap
    create_sitemap(combinations, base_url, output_sitemap)

if __name__ == "__main__":
    main()
