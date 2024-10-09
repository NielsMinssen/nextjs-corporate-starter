import itertools
import urllib.parse
import os
from datetime import datetime

def load_cpu_list(cpu_list_file):
    """
    Load the list of CPUs from a text file.
    Each line in the file should be a CPU name.
    """
    with open(cpu_list_file, 'r', encoding='utf-8') as file:
        cpu_list = [line.strip() for line in file if line.strip()]
    return cpu_list

def sanitize_cpu_name(cpu_name):
    """
    Replace spaces and other unwanted characters with dashes.
    """
    sanitized = cpu_name.replace(' ', '-')
    while '--' in sanitized:
        sanitized = sanitized.replace('--', '-')
    sanitized = urllib.parse.quote(sanitized, safe='-')
    return sanitized

def generate_combinations(cpu_names):
    """
    Generate all unique combinations of two CPUs, ordered alphabetically.
    """
    sorted_cpus = sorted(cpu_names)
    combinations = list(itertools.combinations(sorted_cpus, 2))
    return combinations

def create_sitemap(combinations, base_url, output_file):
    """
    Create a sitemap XML file from the list of CPU combinations.
    """
    sitemap_header = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
'''
    sitemap_footer = '</urlset>'
    url_entries = []

    languages = ['en', 'es', 'fr']  # Language variants

    for cpu1, cpu2 in combinations:
        cpu1_sanitized = sanitize_cpu_name(cpu1)
        cpu2_sanitized = sanitize_cpu_name(cpu2)
        
        # Create the base URL for this combination
        relative_url = f"{cpu1_sanitized}-vs-{cpu2_sanitized}"
        
        # Collecting alternate URLs
        alternate_links = []
        for lang in languages:
            full_url = f"{base_url}/{lang}/cpu/compare/{relative_url}"
            alternate_links.append(f'<xhtml:link rel="alternate" hreflang="{lang}" href="{full_url}" />')

        # Construct the XML entry for the current URL
        lastmod_date = datetime.now().strftime("%Y-%m-%d")  # Set last modified date to today
        url_entry = f"""  <url>
    <loc>{base_url}/{languages[0]}/cpu/compare/{relative_url}</loc>
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
    cpu_list_file = 'cpu_list.txt'     # Path to your CPU list file
    base_url = 'https://specompare.com'  # Base URL of your site
    output_sitemap = 'sitemap.xml'     # Output sitemap file name

    # Check if CPU list file exists
    if not os.path.isfile(cpu_list_file):
        print(f"Error: CPU list file '{cpu_list_file}' not found.")
        return

    # Load CPU list
    cpu_list = load_cpu_list(cpu_list_file)
    print(f"Loaded {len(cpu_list)} CPUs from '{cpu_list_file}'.")

    if len(cpu_list) < 2:
        print("Error: Need at least two CPUs to generate combinations.")
        return

    # Generate combinations
    combinations = generate_combinations(cpu_list)
    print(f"Generated {len(combinations)} unique CPU combinations.")

    # Create sitemap
    create_sitemap(combinations, base_url, output_sitemap)

if __name__ == "__main__":
    main()
