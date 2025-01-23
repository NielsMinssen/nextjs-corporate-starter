import os
import numpy as np
from PIL import Image

def trim_whitespace(image):
    """
    Rogne complètement les zones blanches/vides de tous les côtés.
    
    Args:
        image (PIL.Image): Image à traiter
    
    Returns:
        PIL.Image: Image rognée
    """
    # Convertir l'image en tableau numpy pour un traitement plus rapide
    img_array = np.array(image)
    
    # Trouver les bordures non blanches
    rows = np.any(img_array[:, :, :3] < 240, axis=(1, 2))
    cols = np.any(img_array[:, :, :3] < 240, axis=(0, 2))
    
    # Trouver les indices des bordures non blanches
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Rogner l'image
    return image.crop((cmin, rmin, cmax + 1, rmax + 1))

def trim_blackspace(image):
    """
    Rogne complètement les zones noires/vides de tous les côtés.

    Args:
        image (PIL.Image): Image à traiter

    Returns:
        PIL.Image: Image rognée
    """
    # Convertir l'image en tableau numpy pour un traitement plus rapide
    img_array = np.array(image)

    # Trouver les bordures non noires (pixels qui ne sont pas proches du noir)
    rows = np.any(img_array[:, :, :3] > 15, axis=(1, 2))
    cols = np.any(img_array[:, :, :3] > 15, axis=(0, 2))

    # Vérifier si des bordures non noires existent
    if not rows.any() or not cols.any():
        return image

    # Trouver les indices des bordures non noires
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]

    # Rogner l'image
    return image.crop((cmin, rmin, cmax + 1, rmax + 1))



def process_images(input_folder, output_folder):
    """
    Traite les images BMP dans le dossier d'entrée :
    1. Rogne complètement les zones blanches/vides
    2. Redimensionne à hauteur fixe de 600px en préservant le ratio
    3. Convertit en WebP
    4. Sauvegarde dans le dossier de sortie
    """
    # Créer le dossier de sortie s'il n'existe pas
    os.makedirs(output_folder, exist_ok=True)
    
    # Parcourir tous les fichiers du dossier d'entrée
    for filename in os.listdir(input_folder):
        if filename.lower().endswith('.bmp'):
            # Chemin complet du fichier source
            input_path = os.path.join(input_folder, filename)
            
            try:
                # Ouvrir l'image
                with Image.open(input_path) as img:
                    # Rogner les zones blanches/vides
                    trimmed_img = trim_whitespace(img)
                    trimmed_img = trim_blackspace(trimmed_img)
                    
                    # Calculer le nouveau redimensionnement
                    target_height = 600
                    img_width, img_height = trimmed_img.size
                    
                    # Calculer la nouvelle largeur en préservant le ratio
                    new_width = int(img_width * (target_height / img_height))
                    
                    # Redimensionner l'image
                    resized_img = trimmed_img.resize((new_width, target_height), Image.LANCZOS)
                    
                    # Nom de fichier de sortie (changer l'extension en .webp)
                    output_filename = os.path.splitext(filename)[0] + '.webp'
                    output_path = os.path.join(output_folder, output_filename)
                    
                    # Sauvegarder en WebP
                    resized_img.save(output_path, 'WEBP', quality=80)
                    print(f"Traité : {filename} -> {output_filename}")
                    
                    # Optionnel : Afficher les dimensions originales et finales
                    print(f"Dimensions originales: {img_width}x{img_height}")
                    print(f"Dimensions finales: {new_width}x{target_height}")
            
            except Exception as e:
                print(f"Erreur lors du traitement de {filename}: {e}")


# Utilisation du script
if __name__ == "__main__":
    # Spécifiez vos chemins de dossiers ici
    INPUT_FOLDER = 'photosbrutes'   # Dossier contenant les images BMP
    OUTPUT_FOLDER = 'photosSmartphones' # Dossier de destination des images WebP
    
    process_images(INPUT_FOLDER, OUTPUT_FOLDER)