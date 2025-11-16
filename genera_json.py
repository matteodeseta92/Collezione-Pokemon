import pandas as pd
import json
import os

# Percorsi dei file Excel (si trovano nella cartella principale)
SET_FILE = "sets_template.xlsx"
CARD_FILE = "cards_template.xlsx"

# Output JSON
SETS_JSON = "sets.json"
CARDS_JSON = "cards.json"

def genera_sets_json():
    try:
        df = pd.read_excel(SET_FILE)

        # Verifica colonne attese
        colonne_attese = ["ID", "Nome_Set", "Totale_Carte", "Era", "Tipo", "Nome_Logo"]
        for col in colonne_attese:
            if col not in df.columns:
                raise ValueError(f"Colonna mancante nel file sets_template.xlsx: {col}")

        data = df.to_dict(orient="records")

        with open(SETS_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"[OK] File {SETS_JSON} generato.")

    except Exception as e:
        print(f"Errore durante la generazione di {SETS_JSON}: {e}")


def genera_cards_json():
    try:
        df = pd.read_excel(CARD_FILE)

        # Verifica colonne attese
        colonne_attese = ["ID_Set", "Numero_Carta", "Nome_Carta", "Rarita", "Lingua", "Posseduta"]
        for col in colonne_attese:
            if col not in df.columns:
                raise ValueError(f"Colonna mancante nel file cards_template.xlsx: {col}")

        # Converte TRUE/FALSE in booleani Python
        df["Posseduta"] = df["Posseduta"].astype(bool)

        data = df.to_dict(orient="records")

        with open(CARDS_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"[OK] File {CARDS_JSON} generato.")

    except Exception as e:
        print(f"Errore durante la generazione di {CARDS_JSON}: {e}")



if __name__ == "__main__":
    print("Generazione JSON in corso...\n")
    genera_sets_json()
    genera_cards_json()
    print("\nCompletato!")
