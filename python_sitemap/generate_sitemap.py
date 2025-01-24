import os
import xml.etree.ElementTree as ET
from typing import List, Dict, Callable
import requests
import re
from datetime import datetime

# Constants
BASE_URL = 'http://localhost:3001'  # Base URL of the website
MAX_URLS_PER_FILE = 45000  # Maximum number of URLs per file
OUTPUT_DIR = '../frontend/public/sitemaps'  # Output directory
LANGUAGES = ['en', 'fr', 'es']  # Supported languages

# API endpoints for data
ENDPOINTS = {
    'phone': 'http://localhost:1337/api/phones',
    'cpu': 'http://localhost:1337/api/cpus',
    'gpu': 'http://localhost:1337/api/gpus',
}

def transform_phones(phones: List[Dict]) -> List[str]:
    """Transform phone data into URL-friendly names."""
    def process_phone(phone):
        brand_and_full_name = phone.get('attributes', {}).get('phone', {}).get('brand_and_full_name')
        if not brand_and_full_name:
            print(f"Warning: Missing brand_and_full_name for phone: {phone}")
            return None
        
        # Split at GB or RAM specification and take first part
        processed_name = re.split(r'\s+(?:\d+GB|\d+\s*GB\s*RAM)', brand_and_full_name)[0]
        return re.sub(r'\s+', '-', processed_name.strip())
    
    # Process phones, remove None values, and get unique values
    processed_phones = list(set(filter(None, map(process_phone, phones))))
    return processed_phones

def transform_cpus(cpus: List[Dict]) -> List[str]:
    """Transform CPU data into URL-friendly names."""
    def process_cpu(cpu):
        cpu_name = cpu.get('attributes', {}).get('CPU', {}).get('cpu_name')
        if not cpu_name:
            print(f"Warning: Missing cpu_name for cpu: {cpu}")
            return None
        
        return re.sub(r'\s+', '-', cpu_name.strip())
    
    # Process CPUs, remove None values, and get unique values
    processed_cpus = list(set(filter(None, map(process_cpu, cpus))))
    return processed_cpus

def transform_gpus(gpus: List[Dict]) -> List[str]:
    """Transform GPU data into URL-friendly names."""
    def process_gpu(gpu):
        gpu_name = gpu.get('attributes', {}).get('GPU', {}).get('videocard_name')
        if not gpu_name:
            print(f"Warning: Missing videocard_name for gpu: {gpu}")
            return None
        
        return re.sub(r'\s+', '-', gpu_name.strip())
    
    # Process GPUs, remove None values, and get unique values
    processed_gpus = list(set(filter(None, map(process_gpu, gpus))))
    return processed_gpus

def generate_combinations(items: List[str]) -> List[str]:
    """Generate comparison combinations."""
    combinations = []
    for i, item1 in enumerate(items):
        for item2 in items[i+1:]:
            # Sort to ensure consistent naming
            sorted_items = sorted([item1, item2])
            combinations.append(f"{sorted_items[0]}-vs-{sorted_items[1]}")
    return combinations

def generate_sitemaps_for_category(
    category: str, 
    transform_func: Callable[[List[Dict]], List[str]]
) -> List[str]:
    """Generate sitemaps for a specific category."""
    print(f"Fetching {category} data from API...")
    response = requests.get(ENDPOINTS[category])
    items = transform_func(response.json()['data'])
    print(f"Found {len(items)} {category}")

    print("Generating combinations...")
    combinations = generate_combinations(items)
    print(f"Generated {len(combinations)} combinations")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    sitemapfiles = []
    urlcount = 0
    
    for lang in LANGUAGES:
        print(f"Processing language: {lang}")
        sitemapindex = 1  # Reset index for each language
        current_sitemap = None
        current_sitemap_filename = None
        
        for combination in combinations:
            if urlcount == 0:
                # Create new sitemap file
                current_sitemap_filename = f"{category}-sitemap-{lang}-{sitemapindex}.xml"
                current_sitemap = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
                sitemapfiles.append(current_sitemap_filename)
            
            # Create URL element
            url_elem = ET.SubElement(current_sitemap, 'url')
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = f"{BASE_URL}/{lang}/{category}/compare/{combination}"
            
            # Add lastmod element
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = datetime.now().strftime('%Y-%m-%d')
            
            # Add priority element
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = '0.5'
            
            urlcount += 1
            
            # Check if we've reached max URLs
            if urlcount >= MAX_URLS_PER_FILE:
                print(f"Reached max URLs ({MAX_URLS_PER_FILE}), closing file")
                tree = ET.ElementTree(current_sitemap)
                tree.write(os.path.join(OUTPUT_DIR, current_sitemap_filename), encoding='utf-8', xml_declaration=True)
                urlcount = 0
                sitemapindex += 1
        
        # Write final sitemap if URLs remain
        if urlcount > 0:
            print("Closing final sitemap file")
            tree = ET.ElementTree(current_sitemap)
            tree.write(os.path.join(OUTPUT_DIR, current_sitemap_filename), encoding='utf-8', xml_declaration=True)
            urlcount = 0
            sitemapindex += 1
    
    print(f"Generated {len(sitemapfiles)} sitemap files for {category}")
    return sitemapfiles

def generate_sitemap_index(sitemap_files: Dict[str, List[str]]) -> None:
    """Generate the sitemap index file."""
    print("Generating sitemap index...")
    
    # Create sitemap index root
    sitemapindex = ET.Element('sitemapindex', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    # Add each sitemap file
    for category_files in sitemap_files.values():
        for file in category_files:
            sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
            loc_elem = ET.SubElement(sitemap_elem, 'loc')
            loc_elem.text = f"{BASE_URL}/sitemaps/{file}"
            
            lastmod_elem = ET.SubElement(sitemap_elem, 'lastmod')
            lastmod_elem.text = datetime.now().strftime('%Y-%m-%d')
    
    # Write sitemap index
    tree = ET.ElementTree(sitemapindex)
    tree.write('../frontend/public/sitemap-index.xml', encoding='utf-8', xml_declaration=True)
    print("Sitemap index written successfully")

def generate_all_sitemaps():
    """Main function to generate all sitemaps."""
    sitemapfiles = {}

    # # Uncomment as needed
    print('Generating phone sitemaps...')
    sitemapfiles['phone'] = generate_sitemaps_for_category('phone', transform_phones)

    print('Generating GPU sitemaps...')
    sitemapfiles['gpu'] = generate_sitemaps_for_category('gpu', transform_gpus)

    print('Generating CPU sitemaps...')
    sitemapfiles['cpu'] = generate_sitemaps_for_category('cpu', transform_cpus)

    # Generate the sitemap index
    print('Generating sitemap index...')
    generate_sitemap_index(sitemapfiles)

    print('Sitemap generation complete!')

def main():
    try:
        generate_all_sitemaps()
    except Exception as error:
        print(f"Error generating sitemaps: {error}")

if __name__ == "__main__":
    main()