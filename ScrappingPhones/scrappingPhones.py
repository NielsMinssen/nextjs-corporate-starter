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
    },
    "Performance": {
        "storage_options_gb": None,
        "RAM_gb": None,
        "AnTuTu_benchmark_score": None,
        "GPU_name": None,
        "processor_speed_ghz": None,
        "RAM_speed_mhz": None,
        "semiconductor_size_nm": None,
        "supports_64_bit": None,
        "uses_big_LITTLE_technology": None,
        "processor_threads": None,
        "supports_ECC_memory": None,
        "uses_multithreading": None
    },
    "Cameras": {
        "main_camera_megapixels": None,
        "front_camera_megapixels": None,
        "built_in_optical_image_stabilization": None,
        "video_recording": None,
        "largest_aperture_f": None,
        "continuous_autofocus_during_video_recording": None,
        "can_record_slow_motion_videos": None,
        "IGD_mode": None,
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
        "screen_sharing": None,
        "direct_OS_updates": None,
        "quick_start": None
    },
    "Battery": {
        "battery_capacity_mAh": None,
        "wireless_charging": None,
        "fast_charging": None,
        "charging_speed_w": None,
        "wireless_charging_speed_w": None,
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

    
    # Find all property containers
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
            specs["Performance"]["processor_speed_ghz"] = value_text
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
        elif label_text == "Supporte la mémoire ECC":
            specs["Performance"]["supports_ECC_memory"] = value_text
        elif label_text == "utilise le multithreading":
            specs["Performance"]["uses_multithreading"] = value_text
            
        # Cameras section
        elif label_text == "mégapixels (appareil photo principal)":
            specs["Cameras"]["main_camera_megapixels"] = extract_number(value_text)
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
        elif label_text == "dispose de la fonctionnalité partage d'écran":
            specs["Operating_System"]["screen_sharing"] = value_text
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