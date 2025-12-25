import requests
import json
from collections import defaultdict

# Configuration de l'API Strapi
API_BASE_URL = 'https://api.siliconcompare.com/api'
CPUS_ENDPOINT = f'{API_BASE_URL}/cpus'

def get_all_cpus():
    """Récupère tous les CPUs de la base de données"""
    all_cpus = []
    page = 1
    page_size = 100  # Ajustez selon vos besoins
    
    while True:
        params = {
            'pagination[page]': page,
            'pagination[pageSize]': page_size
        }
        
        response = requests.get(CPUS_ENDPOINT, params=params)
        
        if response.status_code != 200:
            print(f"❌ Erreur lors de la récupération des données: {response.status_code}")
            break
            
        data = response.json()
        cpus = data.get('data', [])
        
        if not cpus:
            break
            
        all_cpus.extend(cpus)
        page += 1
        
        print(f"📥 Récupéré {len(cpus)} CPUs (page {page-1})")
        
        # Si on a moins d'éléments que la taille de page, on a tout récupéré
        if len(cpus) < page_size:
            break
    
    print(f"📊 Total récupéré: {len(all_cpus)} CPUs")
    return all_cpus

def find_duplicates(cpus):
    """Trouve les doublons basés sur le nom de la carte graphique"""
    duplicates = defaultdict(list)
    
    for cpu in cpus:
        cpu_data = cpu.get('attributes', {}).get('CPU', {})
        videocard_name = cpu_data.get('videocard_name')
        
        if videocard_name:
            duplicates[videocard_name].append({
                'id': cpu['id'],
                'name': videocard_name,
                'created_at': cpu.get('attributes', {}).get('createdAt'),
                'full_data': cpu_data
            })
    
    # Garder seulement les entrées qui ont des doublons
    actual_duplicates = {name: entries for name, entries in duplicates.items() if len(entries) > 1}
    
    return actual_duplicates

def delete_cpu(cpu_id):
    """Supprime un CPU par son ID"""
    delete_url = f'{CPUS_ENDPOINT}/{cpu_id}'
    response = requests.delete(delete_url)
    
    if response.status_code == 200:
        return True
    else:
        print(f"❌ Erreur lors de la suppression du CPU {cpu_id}: {response.status_code}")
        return False

def remove_duplicates_interactive(duplicates):
    """Supprime les doublons de manière interactive"""
    print(f"\n🔍 Trouvé {len(duplicates)} groupes de doublons")
    
    total_deleted = 0
    
    for name, entries in duplicates.items():
        print(f"\n📋 Doublons pour '{name}' ({len(entries)} entrées):")
        
        # Trier par date de création (garder le plus ancien)
        entries.sort(key=lambda x: x['created_at'])
        
        for i, entry in enumerate(entries):
            status = "🟢 [GARDER]" if i == 0 else "🔴 [SUPPRIMER]"
            print(f"  {status} ID: {entry['id']}, Créé: {entry['created_at']}")
        
        # Demander confirmation
        response = input(f"Supprimer {len(entries)-1} doublons pour '{name}'? (y/N): ")
        
        if response.lower() == 'y':
            # Supprimer tous sauf le premier (le plus ancien)
            for entry in entries[1:]:
                if delete_cpu(entry['id']):
                    print(f"✅ Supprimé: {entry['name']} (ID: {entry['id']})")
                    total_deleted += 1
                else:
                    print(f"❌ Échec suppression: {entry['name']} (ID: {entry['id']})")
        else:
            print(f"⏭️  Ignoré: {name}")
    
    print(f"\n🎉 Suppression terminée. Total supprimé: {total_deleted} entrées")

def remove_duplicates_auto(duplicates, keep_strategy='oldest'):
    """Supprime les doublons automatiquement"""
    print(f"\n🤖 Suppression automatique des doublons (stratégie: {keep_strategy})")
    
    total_deleted = 0
    
    for name, entries in duplicates.items():
        if keep_strategy == 'oldest':
            # Trier par date de création (garder le plus ancien)
            entries.sort(key=lambda x: x['created_at'])
        elif keep_strategy == 'newest':
            # Trier par date de création (garder le plus récent)
            entries.sort(key=lambda x: x['created_at'], reverse=True)
        
        print(f"\n📋 Traitement '{name}' ({len(entries)} entrées)")
        print(f"🟢 Garder: ID {entries[0]['id']} (créé: {entries[0]['created_at']})")
        
        # Supprimer tous sauf le premier
        for entry in entries[1:]:
            if delete_cpu(entry['id']):
                print(f"✅ Supprimé: ID {entry['id']} (créé: {entry['created_at']})")
                total_deleted += 1
            else:
                print(f"❌ Échec suppression: ID {entry['id']}")
    
    print(f"\n🎉 Suppression automatique terminée. Total supprimé: {total_deleted} entrées")

def main():
    print("🚀 Démarrage du nettoyage des doublons...")
    
    # Récupérer tous les CPUs
    all_cpus = get_all_cpus()
    
    if not all_cpus:
        print("❌ Aucun CPU trouvé ou erreur de récupération")
        return
    
    # Trouver les doublons
    duplicates = find_duplicates(all_cpus)
    
    if not duplicates:
        print("🎉 Aucun doublon trouvé!")
        return
    
    # Afficher un résumé
    total_duplicates = sum(len(entries) - 1 for entries in duplicates.values())
    print(f"\n📊 Résumé:")
    print(f"  - {len(duplicates)} noms de cartes avec doublons")
    print(f"  - {total_duplicates} entrées à supprimer")
    
    # Choisir le mode de suppression
    print("\n🛠️  Options de suppression:")
    print("1. Mode interactif (confirmer chaque groupe)")
    print("2. Mode automatique (garder le plus ancien)")
    print("3. Mode automatique (garder le plus récent)")
    print("4. Juste afficher les doublons (pas de suppression)")
    
    choice = input("Choisissez une option (1-4): ")
    
    if choice == '1':
        remove_duplicates_interactive(duplicates)
    elif choice == '2':
        remove_duplicates_auto(duplicates, 'oldest')
    elif choice == '3':
        remove_duplicates_auto(duplicates, 'newest')
    elif choice == '4':
        for name, entries in duplicates.items():
            print(f"\n📋 '{name}' ({len(entries)} entrées):")
            for entry in entries:
                print(f"  - ID: {entry['id']}, Créé: {entry['created_at']}")
    else:
        print("❌ Option invalide")

if __name__ == "__main__":
    main()