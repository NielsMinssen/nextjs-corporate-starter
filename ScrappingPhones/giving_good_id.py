import os
import json
import re

def extract_specs(filename):
    """Extract storage and RAM values from filename."""
    # Look for storage (GB not followed by RAM)
    storage_match = re.search(r'(\d+)GB(?!\s*RAM)', filename)
    # Look for RAM (GB followed by RAM)
    ram_match = re.search(r'(\d+)GB\s*RAM', filename)
    
    storage = int(storage_match.group(1)) if storage_match else 0
    ram = int(ram_match.group(1)) if ram_match else 0
    
    return storage, ram

def get_base_name(filename):
    """Remove storage and RAM information from the name."""
    # Remove patterns like "256GB" and "12GB RAM"
    base_name = re.sub(r'\s+\d+GB(?!\s*RAM)', '', filename)  # Remove storage GB
    base_name = re.sub(r'\s+\d+GB\s*RAM', '', base_name)     # Remove RAM
    return base_name.replace('.json', '')

def process_smartphone_files(folder_path):
    # Group files by base phone model
    phone_variants = {}
    
    # First pass: group all variants of the same phone
    for filename in os.listdir(folder_path):
        if not filename.endswith('.json'):
            continue
            
        base_name = get_base_name(filename)
        if base_name not in phone_variants:
            phone_variants[base_name] = []
            
        storage, ram = extract_specs(filename)
        phone_variants[base_name].append({
            'filename': filename,
            'storage': storage,
            'ram': ram,
            'full_path': os.path.join(folder_path, filename)
        })
    
    # Second pass: process each group
    for base_name, variants in phone_variants.items():
        # Sort variants by storage and RAM
        variants.sort(key=lambda x: (x['storage'], x['ram']), reverse=True)
        
        # Check if variants only differ by storage
        ram_values = set(v['ram'] for v in variants)
        only_storage_differs = len(ram_values) == 1
        
        for i, variant in enumerate(variants):
            with open(variant['full_path'], 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if i == 0:  # Best variant (canonical)
                data['brand_and_full_name'] = base_name
            else:
                if only_storage_differs:
                    # Only include storage in non-canonical versions
                    data['brand_and_full_name'] = f"{base_name} {variant['storage']}GB"
                else:
                    # Include both storage and RAM
                    data['brand_and_full_name'] = f"{base_name} {variant['storage']}GB {variant['ram']}GB RAM"
            
            # Write updated data back to file
            with open(variant['full_path'], 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"Processed: {variant['filename']}")
            print(f"  Storage: {variant['storage']}GB")
            print(f"  RAM: {variant['ram']}GB")
            print(f"  New name: {data['brand_and_full_name']}")
            print("---")

# Example usage
folder_path = 'resultsWeb'
process_smartphone_files(folder_path)