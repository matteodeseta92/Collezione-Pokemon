import pandas as pd
import json

# --- File Excel ---
SETS_FILE = 'sets_template.xlsx'
CARDS_FILE = 'cards_template.xlsx'

# --- File JSON di destinazione ---
SETS_JSON = 'sets.json'
CARDS_JSON = 'cards.json'

# --- 1. Leggi Sets ---
df_sets = pd.read_excel(SETS_FILE)

# Assicuriamoci che ID e Totale_Carte siano numeri
df_sets['ID'] = df_sets['ID'].astype(int)
df_sets['Totale_Carte'] = df_sets['Totale_Carte'].astype(int)

# Converti DataFrame in lista di dizionari
sets_list = df_sets.to_dict(orient='records')

# Scrivi sets.json
with open(SETS_JSON, 'w', encoding='utf-8') as f:
    json.dump(sets_list, f, ensure_ascii=False, indent=2)

print(f"Generato {SETS_JSON} con {len(sets_list)} set.")

# --- 2. Leggi Cards ---
df_cards = pd.read_excel(CARDS_FILE)

# Assicuriamoci che ID_Set e Numero_Carta siano numeri
df_cards['ID_Set'] = df_cards['ID_Set'].astype(int)
df_cards['Numero_Carta'] = df_cards['Numero_Carta'].astype(int)

# Converte Posseduta in booleano corretto
def convert_boolean(val):
    if str(val).strip().upper() in ['TRUE', '1', 'YES']:
        return True
    else:
        return False

df_cards['Posseduta'] = df_cards['Posseduta'].apply(convert_boolean)

# Converti DataFrame in lista di dizionari
cards_list = df_cards.to_dict(orient='records')

# Scrivi cards.json
with open(CARDS_JSON, 'w', encoding='utf-8') as f:
    json.dump(cards_list, f, ensure_ascii=False, indent=2)

print(f"Generato {CARDS_JSON} con {len(cards_list)} carte.")
