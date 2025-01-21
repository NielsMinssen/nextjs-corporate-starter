from bs4 import BeautifulSoup
import json
import re
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

def setup_driver():
    """Setup and return a Chrome webdriver with appropriate options"""
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    # Add more convincing user agent and browser properties
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    # Disable automation flags
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    driver = webdriver.Chrome(options=options)
    # Additional stealth settings
    driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

def expand_all_sections(driver):
    """Click all 'Voir plus' buttons on the page, up to 11 times"""
    try:
        print("Starting to expand sections...")
        time.sleep(0.2)
        
        for attempt in range(11):  # Loop 11 times maximum
            print(f"Expansion attempt {attempt + 1}/11")
            
            # Find all 'Voir plus' buttons
            more_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), '+ Voir plus +')]")
            
            if not more_buttons:
                print("No more 'Voir plus' buttons found")
                break
                
            print(f"Found {len(more_buttons)} buttons")
            
            for i, button in enumerate(more_buttons, 1):
                try:
                    print(f"Attempting to click button {i} of {len(more_buttons)}")
                    driver.execute_script("arguments[0].scrollIntoView(true);", button)
                    time.sleep(0.2)
                    driver.execute_script("arguments[0].click();", button)
                    print(f"Successfully clicked button {i}")
                    time.sleep(0.2)
                except Exception as e:
                    print(f"Error clicking button {i}: {str(e)}")
                    continue
                    
    except Exception as e:
        print(f"Fatal error expanding sections: {str(e)}")

def scrape_phones_from_urls(urls, output_folder="resultsWeb"):
    """
    Scrape phone specifications from a list of URLs
    """
    # Create output folder if it doesn't exist
    output_path = Path(output_folder)
    output_path.mkdir(exist_ok=True)
    
    # Setup the webdriver
    driver = setup_driver()
    
    try:
        for url in urls:
            try:
                print(f"Processing URL: {url}")
                
                # Load the page
                driver.get(url)
                
                # Wait for the main content to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "summaryName"))
                )
                
                # Expand all sections
                expand_all_sections(driver)
                
                # Get the page source after all expansions
                html_content = driver.page_source
                
                # Parse specifications using existing function
                specs = parse_phone_specs(html_content)
                
                if not specs["brand_and_full_name"]:
                    print(f"Warning: Could not extract name from {url}")
                    # Use part of URL as filename
                    output_filename = re.sub(r'[^a-zA-Z0-9]', '_', url.split('/')[-1]) + ".json"
                else:
                    # Create safe filename from brand_and_full_name
                    safe_name = re.sub(r'[<>:"/\\|?*]', '_', specs["brand_and_full_name"])
                    output_filename = f"{safe_name}.json"
                
                # Save to output folder
                output_file = output_path / output_filename
                save_specs_to_json(specs, output_file)
                print(f"Processed: {url} -> {output_filename}")
                
            except Exception as e:
                print(f"Error processing URL {url}: {str(e)}")
                continue
                
    finally:
        driver.quit()

def process_megapixels(value_text):
    """
    Process megapixel string like "50 MP & 50 MP & 8 MP"
    Returns a tuple of (original_text, sum_of_megapixels)
    """
    if not value_text:
        return None, None
        
    # Keep original text
    original_text = value_text
    
    # Split by & and process each part
    total_mp = 0
    parts = value_text.split('&')
    for part in parts:
        # Extract number before 'MP'
        mp_value = float(part.strip().split('MP')[0].strip())
        total_mp += mp_value
        
    return original_text, total_mp

def process_processor_speed(value_text):
    """
    Process processor speed string like "1 x 2.5 GHz & 3 x 2.4 GHz & 4 x 1.8 GHz"
    Returns a tuple of (original_text, total_ghz)
    """
    if not value_text:
        return None, None
        
    # Keep original text (remove any text in parentheses)
    original_text = value_text.split('(')[0].strip()
    
    # Split by & and process each part
    total_ghz = 0
    parts = value_text.split('&')
    for part in parts:
        # Remove any text in parentheses
        part = part.split('(')[0].strip()
        # Extract numbers: cores x speed
        nums = part.split('x')
        cores = float(nums[0].strip())
        # Extract GHz value
        ghz = float(nums[1].split('GHz')[0].strip())
        total_ghz += cores * ghz
        
    return original_text, total_ghz

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
    "brand_and_full_name": "",
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
    },
    "Performance": {
        "storage_options_gb": None,
        "RAM_gb": None,
        "AnTuTu_benchmark_score": None,
        "GPU_name": None,
        "processor_speed_ghz": {
            "text": None,
            "value": None
        },
        "RAM_speed_mhz": None,
        "semiconductor_size_nm": None,
        "supports_64_bit": None,
        "uses_big_LITTLE_technology": None,
        "processor_threads": None,
        "uses_multithreading": None
    },
    "Cameras": {
         "main_camera_megapixels": {
            "text": None,
            "value": None
        },
        "front_camera_megapixels": None,
        "built_in_optical_image_stabilization": None,
        "video_recording": None,
        "largest_aperture_f": None,
        "continuous_autofocus_during_video_recording": None,
        "can_record_slow_motion_videos": None,
        "HDR_mode": None,
        "optical_zoom_x": None,
        "CMOS_sensor": None,
        "manual_ISO": None,
        "burst_mode": None,
        "manual_focus": None,
        "manual_white_balance": None,
        "takes_raw_images": None,
        "AF_touch": None,
        "manual_shutter_speed": None,
        "large_aperture_front_camera_f": None,
        "Dolby_Vision_recording": None
    },
    "Operating_System": {
        "version": None,
        "location_privacy_options": None,
        "camera_and_microphone_privacy_options": None,
        "theme_customization": None,
        "dark_mode": None,
        "WiFi_password_sharing": None,
        "battery_health_check": None,
        "extra_dim_mode": None,
        "Focus_mode": None,
        "dynamic_theming": None,
        "offload_apps": None,
        "customizable_notifications": None,
        "live_text": None,
        "direct_OS_updates": None,
        "quick_start": None
    },
    "Battery": {
        "battery_capacity_mAh": None,
        "wireless_charging": None,
        "fast_charging": None,
        "charging_speed_w": None,
        "battery_life_h": None
    },
    "Audio": {
        "built_in_stereo_speaker": None,
        "aptX": None,
        "LDAC": None,
        "aptX_HD": None
    },
    "Features": {
        "supports_5G": None,
        "WiFi_version": None,
        "download_speed_mbps": None,
        "upload_speed_mbps": None,
        "USB_Type_C_ports": None,
        "USB_version": None,
        "NFC_device": None,
        "SIM_cards": None,
        "fingerprint_reader": None,
        "emergency_communication_via_satellite": None,
        "detects_car_accidents": None,
        "Bluetooth_version": None,
        "gyroscope": None,
        "GPS": None,
        "compass": None,
        "WiFi_compatible": None,
        "infrared_sensor": None,
        "accelerometer": None,
        "barometer": None,
        "supports_Galileo": None
    }
}

    summary_name = soup.find(class_="summaryName selected")
    if summary_name:
        full_name = summary_name.text.strip()
        print(full_name)
        # Remove anything in parentheses
        full_name = re.sub(r'\([^)]*\)', '', full_name).strip()
        specs["brand_and_full_name"] = full_name

    
    properties = soup.find_all(class_="Property__property___pNjSI")

    for prop in properties:
        label = prop.find(class_="Property__label___zWFei")
        if not label:
            continue
            
        label_text = label.text.strip()
        value_elem = prop.find(class_="Number__number___G9V3S") or prop.find(class_="String__string___sxJBL")
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
    
         # Performance section
        elif label_text == "espace de stockage":
            specs["Performance"]["storage_options_gb"] = extract_number(value_text)
        elif label_text == "mémoire vive (RAM)":
            specs["Performance"]["RAM_gb"] = extract_number(value_text)
        elif label_text == "Score du benchmark AnTuTu":
            specs["Performance"]["AnTuTu_benchmark_score"] = extract_number(value_text)
        elif label_text == "nom du GPU":
            specs["Performance"]["GPU_name"] = value_text
        elif label_text == "vitesse du processeur":
            text, value = process_processor_speed(value_text)
            specs["Performance"]["processor_speed_ghz"] = {
                "text": text,
                "value": value
            }
        elif label_text == "vitesse RAM":
            specs["Performance"]["RAM_speed_mhz"] = extract_number(value_text)
        elif label_text == "taille des semi-conducteurs":
            specs["Performance"]["semiconductor_size_nm"] = extract_number(value_text)
        elif label_text == "Supporte 64-bit":
            specs["Performance"]["supports_64_bit"] = value_text
        elif label_text == "Utilise la technologie big.LITTLE":
            specs["Performance"]["uses_big_LITTLE_technology"] = value_text
        elif label_text == "threads de processeur":
            specs["Performance"]["processor_threads"] = extract_number(value_text)
        elif label_text == "utilise le multithreading":
            specs["Performance"]["uses_multithreading"] = value_text
            
    # Cameras section
        elif label_text == "mégapixels (appareil photo principal)":
            text, value = process_megapixels(value_text)
            specs["Cameras"]["main_camera_megapixels"] = {
                "text": text,
                "value": value
            }
        elif label_text == "mégapixels (caméra frontale)":
            specs["Cameras"]["front_camera_megapixels"] = extract_number(value_text)
        elif label_text == "doté(e) d'une stabilisation optique d'images intégrée":
            specs["Cameras"]["built_in_optical_image_stabilization"] = value_text
        elif label_text == "enregistrement de vidéo":
            specs["Cameras"]["video_recording"] = value_text
        elif label_text == "plus grande ouverture":
            specs["Cameras"]["largest_aperture_f"] = extract_number(value_text)
        elif label_text == "doté(e) d'un autofocus en continu lors de l'enregistrement des vidéos":
            specs["Cameras"]["continuous_autofocus_during_video_recording"] = value_text
        elif label_text == "peut enregistrer des vidéos au ralenti":
            specs["Cameras"]["can_record_slow_motion_videos"] = value_text
        elif label_text == "doté(e) d'un mode IGD":
            specs["Cameras"]["HDR_mode"] = value_text
        elif label_text == "zoom optique":
            specs["Cameras"]["optical_zoom_x"] = extract_number(value_text)
        elif label_text == "possède un capteur CMOS":
            specs["Cameras"]["CMOS_sensor"] = value_text
        elif label_text == "doté(e) d'un ISO manuel":
            specs["Cameras"]["manual_ISO"] = value_text
        elif label_text == "doté(e) d'un mode rafale":
            specs["Cameras"]["burst_mode"] = value_text
        elif label_text == "doté(e) d'une focalisation manuelle":
            specs["Cameras"]["manual_focus"] = value_text
        elif label_text == "doté(e) d'une balance des blancs manuelle":
            specs["Cameras"]["manual_white_balance"] = value_text
        elif label_text == "prend des images brutes":
            specs["Cameras"]["takes_raw_images"] = value_text
        elif label_text == "doté(e) d'une touche AF":
            specs["Cameras"]["AF_touch"] = value_text
        elif label_text == "doté(e) d'une vitesse d'obturation manuelle":
            specs["Cameras"]["manual_shutter_speed"] = value_text
        elif label_text == "grande ouverture (caméra frontale)":
            specs["Cameras"]["large_aperture_front_camera_f"] = extract_number(value_text)
        elif label_text == "supporte l'enregistrement Dolby Vision":
            specs["Cameras"]["Dolby_Vision_recording"] = value_text
            
        # Operating System section
        elif label_text == "version Android":
            specs["Operating_System"]["version"] = value_text
        elif label_text == "dispose d'options de confidentialité relatif à la localisation":
            specs["Operating_System"]["location_privacy_options"] = value_text
        elif label_text == "dispose d'options de confidentialité pour la caméra et le microphone":
            specs["Operating_System"]["camera_and_microphone_privacy_options"] = value_text
        elif label_text == "dispose de la fonctionnalité personnalisation du thème":
            specs["Operating_System"]["theme_customization"] = value_text
        elif label_text == "dispose de la fonctionnalité mode sombre":
            specs["Operating_System"]["dark_mode"] = value_text
        elif label_text == "dispose de la fonctionnalité partage du mot de passe Wi-Fi":
            specs["Operating_System"]["WiFi_password_sharing"] = value_text
        elif label_text == "dispose de la fonctionnalité contrôle de l'état de la batterie":
            specs["Operating_System"]["battery_health_check"] = value_text
        elif label_text == "dispose de la fonctionnalité mode extra dim":
            specs["Operating_System"]["extra_dim_mode"] = value_text
        elif label_text == "dispose de la fonctionnalité mode Concentration":
            specs["Operating_System"]["Focus_mode"] = value_text
        elif label_text == "dispose de la fonctionnalité thématisation dynamique":
            specs["Operating_System"]["dynamic_theming"] = value_text
        elif label_text == "pouvez décharger des applications":
            specs["Operating_System"]["offload_apps"] = value_text
        elif label_text == "Notifications personnalisables":
            specs["Operating_System"]["customizable_notifications"] = value_text
        elif label_text == "dispose de la fonctionnalité Texte en direct":
            specs["Operating_System"]["live_text"] = value_text
        elif label_text == "obtient des mises à jour directes de l'OS":
            specs["Operating_System"]["direct_OS_updates"] = value_text
        elif label_text == "dispose de la fonctionnalité démarrage rapide":
            specs["Operating_System"]["quick_start"] = value_text

            
        # Battery section
        elif label_text == "capacité de la batterie":
            specs["Battery"]["battery_capacity_mAh"] = extract_number(value_text)
        elif label_text == "chargement sans fil":
            specs["Battery"]["wireless_charging"] = value_text
        elif label_text == "Prend en charge le chargement rapide":
            specs["Battery"]["fast_charging"] = value_text
        elif label_text == "vitesse de chargement":
            specs["Battery"]["charging_speed_w"] = extract_number(value_text)
        elif label_text == "autonomie":
            specs["Battery"]["battery_life_h"] = extract_number(value_text)
            
        # Audio section
        elif label_text == "équipé d'un connecteur pour brancher un micro-casque 3,5 mm":
            specs["Audio"]["mini_jack"] = value_text
        elif label_text == "doté(e) d'un haut-parleur stéréo intégré":
            specs["Audio"]["built_in_stereo_speaker"] = value_text
        elif label_text == "possède aptX":
            specs["Audio"]["aptX"] = value_text
        elif label_text == "possède LDAC":
            specs["Audio"]["LDAC"] = value_text
        elif label_text == "possède aptX HD":
            specs["Audio"]["aptX_HD"] = value_text
            
        # Features section
        elif label_text == "Prend en charge la 5G":
            specs["Features"]["supports_5G"] = value_text
        elif label_text == "version Wi-Fi":
            specs["Features"]["WiFi_version"] = value_text
        elif label_text == "vitesse de téléchargement":
            specs["Features"]["download_speed_mbps"] = extract_number(value_text)
        elif label_text == "vitesse de téléchargement (upload)":
            specs["Features"]["upload_speed_mbps"] = extract_number(value_text)
        elif label_text == "Dispose de ports USB de Type-C":
            specs["Features"]["USB_Type_C_ports"] = value_text
        elif label_text == "version USB":
            specs["Features"]["USB_version"] = value_text
        elif label_text == "doté(e) d'un périphérique NFC":
            specs["Features"]["NFC_device"] = value_text
        elif label_text == "cartes SIM":
            specs["Features"]["SIM_cards"] = value_text
        elif label_text == "Contient d'un lecteur d'empreintes digitales":
            specs["Features"]["fingerprint_reader"] = value_text
        elif label_text == "permet communication d'urgence via satellite":
            specs["Features"]["emergency_communication_via_satellite"] = value_text
        elif label_text == "détecte les accidents de la route":
            specs["Features"]["detects_car_accidents"] = value_text
        elif label_text == "version Bluetooth":
            specs["Features"]["Bluetooth_version"] = value_text
        elif label_text == "doté(e) d'un gyroscope":
            specs["Features"]["gyroscope"] = value_text
        elif label_text == "doté(e) d'un GPS":
            specs["Features"]["GPS"] = value_text
        elif label_text == "doté(e) d'une boussole":
            specs["Features"]["compass"] = value_text
        elif label_text == "compatible avec le WiFi":
            specs["Features"]["WiFi_compatible"] = value_text
        elif label_text == "Possède un détecteur infrarouge":
            specs["Features"]["infrared_sensor"] = value_text
        elif label_text == "dispose d'un accéléromètre":
            specs["Features"]["accelerometer"] = value_text
        elif label_text == "A un baromètre":
            specs["Features"]["barometer"] = value_text
        elif label_text == "supporte Galileo":
            specs["Features"]["supports_Galileo"] = value_text

        # After all properties are parsed, append storage and RAM to brand_and_full_name
    if specs["Performance"]["storage_options_gb"] is not None and specs["Performance"]["RAM_gb"] is not None:
        storage = int(specs["Performance"]["storage_options_gb"])
        ram = int(specs["Performance"]["RAM_gb"])
        specs["brand_and_full_name"] = f"{specs['brand_and_full_name']} {storage}GB {ram}GB RAM"

    return specs

def save_specs_to_json(specs, output_path):
    """Save the extracted specifications to a JSON file"""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(specs, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # Example usage
    urls = [
        "https://versus.com/fr/oneplus-7-pro-256gb-8gb-ram",
        "https://versus.com/fr/oneplus-7-pro-128gb-6gb-ram"
    ]
    scrape_phones_from_urls(urls)