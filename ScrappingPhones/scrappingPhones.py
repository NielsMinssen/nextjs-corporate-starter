from bs4 import BeautifulSoup
import json
import re

def extract_number(text):
    """Extract number from text string"""
    if not text:
        return None
    match = re.search(r'(\d+\.?\d*)', text)
    return float(match.group(1)) if match else None

def extract_resolution(text):
    """Extract resolution numbers from text like '1272 x 2800 px'"""
    if not text:
        return None
    match = re.search(r'(\d+)\s*x\s*(\d+)', text)
    return text if match else None

def check_boolean_value(element):
    """Check if boolean value is true (✔) or false (✖)"""
    if not element:
        return None
    return "✔" in element.text

def parse_phone_specs(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Initialize the structure with None/default values
    specs = {
        "brand_and_full_name": "Realme 14 Pro Plus",
        "Design": {
            "weight_g": None,
            "thickness_mm": None,
            "width_mm": None,
            "height_mm": None,
            "IP_rating": None,
            "volume_cm3": None
        },
        "Screen": {
            "screen_size_in": None,
            "screen_type": None,
            "pixel_density_ppi": None,
            "resolution": None,
            "refresh_rate_hz": None,
            "typical_brightness_nits": None,
            "HDR10_compatible": None,
            "Dolby_Vision_compatible": None
        }
    }
    
    # Find all property containers
    properties = soup.find_all(class_="Property__property___pNjSI")
    
    for prop in properties:
        label = prop.find(class_="Property__label___zWFei")
        if not label:
            continue
            
        label_text = label.text.strip()
        value_elem = prop.find(class_="Number__number___G9V3S")
        boolean_elem = prop.find(class_="Boolean__boolean___i1Pee")
        ranked_elem = prop.find(class_="ranked")
        
        # Get the value based on the type of element
        if value_elem and "suggestion" not in value_elem.get("class", []):
            value_text = value_elem.text.strip()
        elif boolean_elem:
            value_text = check_boolean_value(boolean_elem)
        elif ranked_elem:
            value_text = ranked_elem.find("p").text.strip()
        else:
            continue

        # Map the found properties to our structure
        # Design section
        if label_text == "poids":
            specs["Design"]["weight_g"] = extract_number(value_text)
        elif label_text == "épaisseur":
            specs["Design"]["thickness_mm"] = extract_number(value_text)
        elif label_text == "largeur":
            specs["Design"]["width_mm"] = extract_number(value_text)
        elif label_text == "hauteur":
            specs["Design"]["height_mm"] = extract_number(value_text)
        elif label_text == "indice de protection (IP)":
            specs["Design"]["IP_rating"] = value_text
        elif label_text == "volume":
            specs["Design"]["volume_cm3"] = extract_number(value_text)
        
        # Screen section
        elif label_text == "taille d'écran":
            specs["Screen"]["screen_size_in"] = extract_number(value_text)
        elif label_text == "type d'écran":
            specs["Screen"]["screen_type"] = value_text
        elif label_text == "densité de pixels":
            specs["Screen"]["pixel_density_ppi"] = extract_number(value_text)
        elif label_text == "résolution":
            specs["Screen"]["resolution"] = value_text
        elif label_text == "Taux de rafraîchissement":
            specs["Screen"]["refresh_rate_hz"] = extract_number(value_text)
        elif label_text == "luminosité (typique)":
            specs["Screen"]["typical_brightness_nits"] = extract_number(value_text)
        elif label_text == "compatible HDR10":
            specs["Screen"]["HDR10_compatible"] = value_text if isinstance(value_text, bool) else None
        elif label_text == "compatible Dolby Vision":
            specs["Screen"]["Dolby_Vision_compatible"] = value_text if isinstance(value_text, bool) else None
    
    return specs

def save_specs_to_json(specs, filename="phone_specs.json"):
    """Save the extracted specifications to a JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(specs, f, ensure_ascii=False, indent=2)

# Example usage
def main(html_content):
    specs = parse_phone_specs(html_content)
    save_specs_to_json(specs)
    return specs

if __name__ == "__main__":
    with open("path_to_your_html_file.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    main(html_content)