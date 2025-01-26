import os
import xml.etree.ElementTree as ET
from typing import List, Dict, Callable
import requests
import re
from datetime import datetime
# import gzip
from difflib import SequenceMatcher

# Constants
BASE_URL = 'localhost:3001'  # Base URL of the website
MAX_URLS_PER_FILE = 45000  # Maximum number of URLs per file
OUTPUT_DIR = '../frontend/public/sitemaps'  # Output directory
LANGUAGES = ['en', 'fr', 'es']  # Supported languages

# API endpoints for data
ENDPOINTS = {
    'phone': 'http://localhost:1337/api/phones',
    'cpu': 'http://localhost:1337/api/cpus',
    'gpu': 'http://localhost:1337/api/gpus',
}

def is_similar(item: str, reference_list: List[str], threshold: float) -> bool:
    """
    Check if the item is similar to any element in the reference list based on a similarity threshold.
    """
    for ref in reference_list:
        similarity = SequenceMatcher(None, item, ref).ratio()
        if similarity >= threshold:
            return True
    return False

def transform_phones(phones: List[Dict]) -> List[str]:
    """Transform phone data into URL-friendly names."""
    def process_phone(phone):
        brand_and_full_name = phone.get('attributes', {}).get('phone', {}).get('brand_and_full_name')
        if not brand_and_full_name:
            print(f"Warning: Missing brand_and_full_name for phone: {phone}")
            return None
        
        processed_name = re.split(r'\s+(?:\d+GB|\d+\s*GB\s*RAM)', brand_and_full_name)[0]
        return re.sub(r'\s+', '-', processed_name.strip())
    
    processed_phones = list(set(filter(None, map(process_phone, phones))))
    return processed_phones

def transform_cpus(cpus: List[Dict], reference_list: List[str]) -> List[str]:
    """Transform and filter CPU data."""
    def process_cpu(cpu):
        cpu_name = cpu.get('attributes', {}).get('CPU', {}).get('cpu_name')
        if not cpu_name:
            print(f"Warning: Missing cpu_name for cpu: {cpu}")
            return None
        
        formatted_name = re.sub(r'\s+', '-', cpu_name.strip())
        return formatted_name if is_similar(formatted_name, reference_list, 0.8) else None
    
    processed_cpus = list(set(filter(None, map(process_cpu, cpus))))
    return processed_cpus

def transform_gpus(gpus: List[Dict], reference_list: List[str]) -> List[str]:
    """Transform and filter GPU data."""
    def process_gpu(gpu):
        gpu_name = gpu.get('attributes', {}).get('GPU', {}).get('videocard_name')
        if not gpu_name:
            print(f"Warning: Missing videocard_name for gpu: {gpu}")
            return None
        
        formatted_name = re.sub(r'\s+', '-', gpu_name.strip())
        return formatted_name if is_similar(formatted_name, reference_list, 0.65) else None
    
    processed_gpus = list(set(filter(None, map(process_gpu, gpus))))
    return processed_gpus

def generate_combinations(items: List[str]) -> List[str]:
    """Generate comparison combinations."""
    combinations = []
    for i, item1 in enumerate(items):
        for item2 in items[i+1:]:
            sorted_items = sorted([item1, item2])
            combinations.append(f"{sorted_items[0]}-vs-{sorted_items[1]}")
    return combinations

def generate_sitemaps_for_category(
    category: str, 
    transform_func: Callable[[List[Dict], List[str]], List[str]],
    reference_list: List[str] = None
) -> List[str]:
    """Generate sitemaps for a specific category."""
    print(f"Fetching {category} data from API...")
    response = requests.get(ENDPOINTS[category])
    if reference_list:
        items = transform_func(response.json()['data'], reference_list)
    else:
        items = transform_func(response.json()['data'])
    print(f"Found {len(items)} {category} items")

    print("Generating combinations...")
    combinations = generate_combinations(items)
    print(f"Generated {len(combinations)} combinations")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    sitemapfiles = []
    urlcount = 0
    
    for lang in LANGUAGES:
        print(f"Processing language: {lang}")
        sitemapindex = 1
        current_sitemap = None
        current_sitemap_filename = None
        
        for combination in combinations:
            if urlcount == 0:
                current_sitemap_filename = f"{category}-sitemap-{lang}-{sitemapindex}.xml"
                current_sitemap = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
                sitemapfiles.append(current_sitemap_filename)
            
            url_elem = ET.SubElement(current_sitemap, 'url')
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = f"{BASE_URL}/{lang}/{category}/compare/{combination}"
            
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = datetime.now().strftime('%Y-%m-%d')
            
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = '0.5'
            
            urlcount += 1
            
            if urlcount >= MAX_URLS_PER_FILE:
                tree = ET.ElementTree(current_sitemap)
                with open(os.path.join(OUTPUT_DIR, current_sitemap_filename), 'wb') as f:
                    tree.write(f, encoding='utf-8', xml_declaration=True)
                urlcount = 0
                sitemapindex += 1
        
        if urlcount > 0:
            tree = ET.ElementTree(current_sitemap)
            with open(os.path.join(OUTPUT_DIR, current_sitemap_filename), 'wb') as f:
                tree.write(f, encoding='utf-8', xml_declaration=True)
            urlcount = 0
            sitemapindex += 1
    
    print(f"Generated {len(sitemapfiles)} sitemap files for {category}")
    return sitemapfiles

def generate_sitemap_index(sitemap_files: Dict[str, List[str]]) -> None:
    """Generate the sitemap index file."""
    print("Generating sitemap index...")
    sitemapindex = ET.Element('sitemapindex', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    for category_files in sitemap_files.values():
        for file in category_files:
            sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
            loc_elem = ET.SubElement(sitemap_elem, 'loc')
            loc_elem.text = f"{BASE_URL}/sitemaps/{file}"
            
            lastmod_elem = ET.SubElement(sitemap_elem, 'lastmod')
            lastmod_elem.text = datetime.now().strftime('%Y-%m-%d')
    
    tree = ET.ElementTree(sitemapindex)
    with open('../frontend/public/sitemap-index.xml', 'wb') as f:
        tree.write(f, encoding='utf-8', xml_declaration=True)
    print("Sitemap index written successfully")

def generate_all_sitemaps():
    """Main function to generate all sitemaps."""
    sitemapfiles = {}

    reference_cpus = [
    'Intel Core i5-1235U',
    'AMD Ryzen 5 5600G',
    'AMD Ryzen 5 5600X',
    'Intel Core Ultra 7 155H',
    'AMD Ryzen 5 7520U',
    'Intel Core i5-12450H',
    'Intel Core i3-1215U',
    'AMD Ryzen 7 5700X',
    'Intel Core i5-12400',
    'Intel Core i5-1135G7',
    'Intel Core Ultra 5 125H',
    'AMD Ryzen 5 5500',
    'AMD Ryzen 5 3600',
    'AMD Ryzen 5 5500U',
    'Intel Core i7-13700H',
    'Intel N100',
    'AMD Ryzen 7 8845HS',
    'AMD Ryzen 7 5700U',
    'AMD Ryzen 5 5600',
    'AMD Ryzen 7 5700G',
    'AMD Ryzen 5 7535HS',
    'AMD Ryzen 5 7600X',
    'Intel Core i5-1335U',
    'Intel Core i7-13620H',
    'Intel Core i5-13420H',
    'AMD Ryzen 7 7730U',
    'Intel Core i5-10400',
    'AMD Ryzen 7 5700X3D',
    'Intel Core i7-1355U',
    'AMD Ryzen 7 5800X',
    'Intel Core i5-8250U',
    'AMD Ryzen 3 7320U',
    'Intel Core i5-12500H',
    'AMD Ryzen 3 3200G',
    'Intel Core Ultra 9 185H',
    'Intel Core i3-N305',
    'AMD Ryzen 7 7735HS',
    'AMD Ryzen 5 7500F',
    'Intel Core i7-1255U',
    'Intel Core i7-3770',
    'AMD Ryzen 7 7800X3D',
    'AMD Ryzen 7 7700X',
    'AMD Ryzen 5 8500G',
    'Intel Core i9-14900K',
    'Intel Core i7-12700H',
    'AMD Ryzen 5 7530U',
    'AMD Ryzen 5 8600G',
    'AMD Ryzen 5 7600',
    'Intel Core i5-12450HX',
    'Apple M1',
    'Apple M2',
    'Intel Core i5-10210U',
    'AMD Ryzen 7 7435HS',
    'Intel Core i3-12100',
    'Intel Core i5-3470',
    'AMD Ryzen 7 7700',
    'AMD Ryzen 5 3500U',
    'Intel Core i5-12600K',
    'Intel Core i7-14700K',
    'Intel Core i5-13500H',
    'Intel Core 5 120U',
    'Intel Core i5-9400F',
    'Intel Core i3-1115G4',
    'Intel Core i5-7400',
    'Intel Core i5-14400',
    'Intel Core i7-13650HX',
    'Intel Core i7-7700K',
    'AMD Ryzen 5 4600G',
    'AMD Ryzen 5 5600H',
    'AMD Ryzen 7 3700X',
    'Intel Celeron N4020',
    'Intel Core Ultra 5 125U',
    'Intel Core i7-1165G7',
    'Intel Core i9-13900H',
    'Intel Core i5-6500',
    'Intel Core i7-12700K',
    'AMD Ryzen 7 8700G',
    'Intel Core i7-7700',
    'Intel Core i3-1315U',
    'Intel N95',
    'AMD Ryzen 9 5900X',
    'AMD Ryzen 5 8645HS',
    'AMD Ryzen 5 3400G',
    'Intel Core 7 150U',
    'AMD Ryzen 5 5600GT',
    'Intel Core i5-1334U',
    'Intel Core i9-14900HX',
    'Intel Core Ultra 7 155U',
    'AMD Ryzen 7 7840HS',
    'Intel Core i5-8400',
    'Intel Core i5-13450HX',
    'Intel Core i5-13400',
    'Intel Core i7-13700K',
    'Intel Core i5-13600K',
    'Intel Core i5-14600K',
    'AMD Ryzen 9 8945HS',
    'Intel Core i7-8700K',
    'AMD Ryzen 5 5625U',
    'Intel Core i3-10100',
    'AMD Ryzen 5 2600',
    'Intel Core i7-6700',
    'Intel Celeron N4500',
    'Intel Core i7-12700',
    'Intel Core i7-8700',
    'Intel Core i5-7200U',
    'AMD Ryzen 5 6600H',
    'Apple M3',
    'Intel Core i7-14700',
    'AMD Ryzen 7 5800H',
    'AMD Ryzen 5 7430U',
    'AMD Ryzen 9 7900X',
    'Intel Core i7-4790K',
    'Intel Core i3-8100',
    'Intel Core i3-7100',
    'Intel Core i7-8550U',
    'AMD Ryzen 7 5800X3D',
    'AMD Ryzen 5 4500',
    'AMD Ryzen 7 5825U',
    'Intel Core i7-4770',
    'Intel Core i9-9900K',
    'Intel Core i7-12650H',
    'Intel Core i5-11400',
    'Intel Core i5-4570',
    'AMD Ryzen 3 2200G',
    'Intel Core i3-1005G1',
    'Intel Core i5-7500',
    'AMD Ryzen 5 1600',
    'Intel Core i5-8500',
    'Intel Core i7-9700K',
    'Intel Core i5-6200U',
    'AMD Ryzen 5 3600X',
    'Intel Core i7-10700K',
    'AMD Ryzen 7 2700X',
    'Intel Core i3-9100F',
    'Intel Core i7-10700',
    'Intel Core i7-14700HX',
    'AMD Ryzen 7 3700U',
    'AMD Ryzen 9 5950X',
    'AMD Ryzen 5 9600X',
    'AMD Ryzen 7 8840HS',
    'Intel Core i5-8350U',
    'Intel Celeron N5095',
    'AMD Ryzen 3 3250U',
    'Intel Core i7-11800H',
    'AMD Ryzen 5 4500U',
    'AMD Ryzen 7 4800H',
    'Intel N200',
    'Intel Core i9-12900K',
    'Intel Core i7-14650HX',
    'Intel Core i5-2400',
    'Intel Core i5-8265U',
    'Intel Core i3-14100',
    'Intel Core i3-6100',
    'Intel Core i7-2600',
    'AMD Ryzen 5 Pro 4650U',
    'AMD Ryzen 5 2400G',
    'Intel Core i3-10110U',
    'Intel Core i7-7500U',
    'Intel Core i7-9700',
    'AMD Ryzen 9 7950X3D',
    'Intel Core i5-1035G1',
    'Intel Core i5-9400',
    'Intel Core i9-13900K',
    'AMD Ryzen 5 3500X',
    'AMD Ryzen 5 8400F',
    'Intel Core i7-10510U',
    'AMD Ryzen 9 7940HS',
    'Intel Core i7-13700HX',
    'AMD Ryzen 7 9700X',
    'AMD Ryzen AI 9 HX 370',
    'AMD Ryzen 9 3900X',
    'Intel Core i7-13700',
    'Intel U300',
    'AMD Ryzen 7 6800H',
    'Intel Core i5-13500',
    'AMD Ryzen 7 8840U',
    'Intel Core i5-9600K',
    'Intel Core i5-3570',
    'Intel Core i3-13100',
    'Intel Celeron N4000',
    'Intel Core i7-3770K',
    'Intel Core i7-10750H',
    'AMD Ryzen 3 5300U',
    'Intel Core i7-1360P',
    'Intel Core i3-3220',
    'AMD Ryzen 9 6900HX',
    'Intel Core i7-6500U',
    'Intel Core i5-11400H',
    'Intel Core i7-9750H',
    'Apple M1 Pro (10-core)',
    'Intel Core i3-10100F',
    'AMD Ryzen 9 7945HX',
    'Intel Core i3-7020U',
    'Apple M4 (10-core CPU)',
    'AMD FX-8350',
    'AMD Ryzen 9 7950X',
    'Intel Core i3-1305U',
    'Intel Core i7-11700K',
    'AMD Ryzen 7 Pro 7730U',
    'Intel Core i5-6400',
]
    reference_gpus = [
    'Nvidia GeForce RTX 4060',
    'Nvidia GeForce RTX 3060',
    'AMD Radeon RX 580',
    'Nvidia GeForce RTX 3050',
    'AMD Radeon RX 6600',
    'Nvidia GeForce RTX 3050 Laptop',
    'Nvidia GeForce RTX 2060',
    'Nvidia GeForce GTX 1650',
    'Nvidia GeForce RTX 2050 Laptop',
    'Nvidia GeForce GTX 1060',
    'Nvidia Geforce GTX 1660 Super',
    'Nvidia GeForce RTX 4070',
    'Nvidia GeForce RTX 4050 Laptop',
    'AMD Radeon RX 7600',
    'Nvidia GeForce RTX 3060 Ti',
    'Nvidia GeForce RTX 3070',
    'Nvidia GeForce RTX 4060 Ti 8GB',
    'AMD Radeon RX 7800 XT',
    'Nvidia GeForce GTX 1050',
    'Nvidia GeForce RTX 4070 Super',
    'AMD Radeon RX 6750 XT',
    'Nvidia GeForce RTX 2060 Super',
    'Nvidia GeForce RTX 4060 Laptop',
    'Nvidia GeForce RTX 4060 Ti 16GB',
    'Nvidia GeForce RTX 3080',
    'AMD Radeon RX 6650 XT',
    'AMD Radeon RX 7600 XT',
    'AMD Radeon RX 7700 XT',
    'AMD Radeon RX 5700 XT',
    'Nvidia GeForce GTX 1660 Ti',
    'AMD Radeon RX 570',
    'Nvidia GeForce GTX 1660',
    'Nvidia GeForce RTX 3070 Ti',
    'Nvidia GeForce GTX 1070',
    'Nvidia GeForce GTX 1080',
    'AMD Radeon RX 550',
    'Nvidia GeForce RTX 3050 6GB',
    'AMD Radeon RX 6700 XT',
    'Nvidia GeForce GTX 750 Ti',
    'Nvidia GeForce GTX 1080 Ti',
    'AMD Radeon RX 7900 XT',
    'Nvidia GeForce RTX 4070 Ti',
    'Nvidia GeForce RTX 4070 Ti Super',
    'AMD Radeon RX 6500 XT',
    'AMD Radeon RX 6600 XT',
    'Nvidia GeForce RTX 2070 Super',
    'Nvidia GeForce RTX 4090',
    'Nvidia GeForce GTX 970',
    'Nvidia GeForce RTX 4070 Laptop',
    'AMD Radeon Vega 8',
    'Intel Arc A770 16GB',
    'AMD Radeon RX 7900 XTX',
    'Nvidia GeForce RTX 3090',
    'AMD Radeon RX 5500 XT',
    'Nvidia GeForce GTX 960',
    'Nvidia GeForce RTX 3060 Laptop',
    'AMD Radeon RX 5600 XT',
    'Nvidia GeForce RTX 4080 Super',
    'Nvidia GeForce RTX 3050 Ti Laptop',
    'AMD Radeon RX Vega 8',
    'MSI GeForce GTX 1050 Ti',
    'AMD Radeon RX 590',
    'Nvidia GeForce RTX 3080 Ti',
    'Nvidia GeForce RTX 4080 16GB',
    'AMD Radeon RX 7900 GRE',
    'Intel Arc A380',
    'Nvidia GeForce GT 1030 DDR4',
    'Intel Arc A750',
    'Nvidia GeForce GTX 1650 Ti Laptop',
    'AMD Radeon RX 6800 XT',
    'Nvidia GeForce RTX 2080 Super',
    'Nvidia GeForce GTX 1650 Laptop',
    'Nvidia GeForce GTX 1650 Super',
    'AMD Radeon RX 6500M',
    'ASRock Radeon RX 6600 Challenger D',
    'Asus Dual GeForce RTX 4060',
    'AMD Radeon RX 560',
    'Nvidia GeForce GTX 1070 Ti',
    'AMD Radeon RX 6400',
    'MSI GeForce RTX 4060 Gaming',
    'AMD Radeon RX 6800',
    'Gigabyte GeForce RTX 4060 Eagle OC',
    'AMD Radeon RX 470',
    'Gigabyte GeForce RTX 4060 Gaming OC',
    'Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB',
    'Intel Arc A350M',
    'Gigabyte GeForce RTX 4070 WindForce OC',
    'Nvidia Quadro T1000',
    'Gigabyte GeForce GTX 1050 Ti D5 4G',
    'Gigabyte Radeon RX 6600 Eagle',
    'MSI GeForce RTX 4060 Ventus 2X Black OC',
    'Gigabyte Radeon RX 7800 XT Gaming OC',
    'Nvidia GeForce RTX 3060 12GB',
    'Intel Arc B580',
    'Nvidia GeForce GTX 750',
    'Nvidia GeForce GT 730',
    'Nvidia RTX 2000 Ada Laptop',
    'Gigabyte GeForce RTX 4060 WindForce OC',
    'AMD Radeon RX 7600S',
    'Nvidia GeForce RTX 3070 Laptop',
    'MSI GeForce RTX 4060 Ventus 2X Black',
    'AMD Radeon RX 480',
    'Nvidia GeForce 940MX',
    'AMD Radeon RX 6900 XT',
    'Gigabyte GeForce RTX 3060 Gaming OC',
    'Nvidia GeForce RTX 2060 12GB',
    'MSI Radeon RX 6700 XT',
    'MSI GeForce RTX 4060 Gaming X',
    'Nvidia GeForce RTX 4090 Laptop',
    'Gigabyte Radeon RX 7600 XT Gaming OC',
    'Nvidia GeForce GTX 660',
    'MSI Radeon RX 580',
    'MSI GeForce GT 710 2GB',
    'MSI GeForce GTX 1660 Super Gaming X',
    'Nvidia GeForce RTX 4090 Ti',
    'Asus Dual GeForce RTX 4060 OC Edition',
    'MSI GeForce RTX 4070 Super Gaming X Slim',
    'Sapphire Nitro+ Radeon RX 580 8GB',
    'Gigabyte GeForce RTX 4070 Super WindForce OC',
    'Nvidia GeForce MX150',
    'Manli GeForce GTX 1650',
    'MSI GeForce RTX 3060 Ventus 2X OC',
    'Asus Dual Radeon RX 6600',
    'Nvidia GeForce MX330',
    'MSI GeForce RTX 3060 Ventus 2X',
    'MSI GeForce GTX 1050 Ti Gaming',
    'Nvidia RTX A500 Laptop',
    'Nvidia RTX A2000 Laptop',
    'PowerColor Fighter Radeon RX 6600',
    'Nvidia GeForce GTX 760',
    'Gigabyte Radeon RX 7600 Gaming OC',
    'AMD Radeon RX 7700S',
    'MSI GeForce RTX 4060 Ti Gaming Trio 8GB',
    'Nvidia RTX A1000 Laptop',
    'Nvidia GeForce MX130',
    'Gigabyte Radeon RX 6600 XT Eagle',
    'MSI Radeon RX 6600 XT Gaming',
    'Gigabyte GeForce RTX 4070 Super Gaming OC',
    'Intel Arc A580',
    'Nvidia GeForce RTX 4080 12GB',
    'Sapphire Nitro+ Radeon RX 7800 XT',
    'Nvidia GeForce RTX 3090 Ti',
    'Asus Dual GeForce RTX 4060 Ti 8GB',
    'Nvidia GeForce RTX 3080 12GB',
    'Nvidia GeForce MX450 Laptop',
    'Sapphire Pulse Radeon RX 6600',
    'Nvidia Quadro T2000',
    'AMD Radeon RX 6950 XT',
    'MSI Radeon RX 580 Armor 8GB',
    'Nvidia GeForce GTX 770',
    'AMD Radeon R5',
    'Nvidia GeForce MX550 Laptop',
    'MSI GeForce RTX 3060 Gaming',
    'Gigabyte GeForce RTX 4060 Aero OC',
    'MSI Radeon RX 6600 XT Gaming X',
    'MSI GeForce RTX 4060 Ti Gaming X 16GB',
    'Nvidia GeForce RTX 4080 Laptop',
    'Intel Arc A370M',
    'AMD Radeon RX Vega 56',
    'Nvidia GeForce MX110',
    'Intel Arc A310',
    'Gigabyte GeForce RTX 4060 Ti Gaming OC 16GB',
    'Asus Dual GeForce RTX 3060 OC Edition V2',
    'Nvidia GeForce GTX 1650 GDDR6',
    'AMD Radeon RX 560X',
    'Nvidia GeForce RTX 2060 Laptop',
    'Gigabyte Radeon RX 7700 XT Gaming OC',
    'Nvidia GeForce MX250',
    'Nvidia GeForce GTX 1050 Ti Laptop',
    'Asus Dual GeForce RTX 4060 Ti OC Edition 8GB',
    'Gigabyte Radeon RX 6700 XT',
    'Nvidia GeForce GTX 550 Ti',
    'Zotac GeForce GT 730',
    'Nvidia GeForce GTX 980',
    'Sapphire Pulse Radeon RX 7800 XT',
    'Nvidia Tesla T4',
    'EVGA GeForce GTX 1060',
    'Nvidia GeForce GTX 1660 Ti Laptop',
    'Gigabyte GeForce RTX 4070 Super Eagle OC',
    'AMD Radeon R7 250',
    'Gigabyte GeForce RTX 3050 Eagle OC 6GB',
    'MSI GeForce RTX 3050 Ventus 2X OC',
    'Sapphire Nitro+ Radeon RX 5700 XT',
    'AMD Radeon R9 270X',
    'AMD Radeon RX 5500M',
    'Asus Radeon RX 550 4GB',
    'Asus Dual Radeon RX 7600 XT OC Edition',
    'Nvidia GeForce MX350 Laptop',
    'MSI GeForce RTX 4070 Ventus 2X OC',
    'Zotac Gaming GeForce RTX 4060 Ti Twin Edge 8GB',
    'Nvidia Quadro P4000',
    'AMD Radeon RX 7600M XT',
    'Asus ROG Strix GeForce RTX 4090',
    'Sapphire Pulse Radeon RX 580 8GB',
    'XFX Speedster SWFT 210 Radeon RX 6600 Core',
    'AMD Radeon RX 460',
    'Asus Radeon RX 5700',
    'Gigabyte GeForce GTX 950',
    'Gigabyte GeForce GTX 1060',
    'Asus Dual GeForce RTX 3060',
]

    print('Generating phone sitemaps...')
    sitemapfiles['phone'] = generate_sitemaps_for_category('phone', transform_phones)

    print('Generating CPU sitemaps...')
    sitemapfiles['cpu'] = generate_sitemaps_for_category('cpu', transform_cpus, reference_cpus)

    print('Generating GPU sitemaps...')
    sitemapfiles['gpu'] = generate_sitemaps_for_category('gpu', transform_gpus, reference_gpus)

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
