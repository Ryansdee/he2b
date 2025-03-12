import pdfplumber
import json
import time  # Pour ajouter des pauses

def extract_data_from_pdf(pdf_path):
    emails_campuses = []  # Stocke les emails et campus
    students_info = []  # Stocke les matricules, noms, prénoms

    with pdfplumber.open(pdf_path) as pdf:
        first_page_text = pdf.pages[0].extract_text()
        last_page_text = pdf.pages[-1].extract_text()
        print("Texte de la première page:")
        print(first_page_text)
        print("\nTexte de la dernière page:")
        print(last_page_text)

        total_pages = len(pdf.pages)
        print(f"📄 Nombre total de pages dans le PDF : {total_pages}")

        for page_num, page in enumerate(pdf.pages):
            print(f"📑 Traitement de la page {page_num + 1}/{total_pages}")
            text = page.extract_text()

            if text:
                lines = text.split("\n")

                for line in lines:
                    parts = line.split()  # Découper par espace

                    # Vérifier si la ligne contient un email étudiant
                    if "@etu.he2b.be" in line:
                        email = parts[0].strip()
                        campus = parts[1].strip() if len(parts) > 1 else "Inconnu"
                        emails_campuses.append((email, campus))
                    
                    # Vérifier si la ligne contient un dossier étudiant
                    elif len(parts) == 4 and parts[0].isdigit():
                        matricule = parts[0].strip()
                        last_name = parts[1].strip()
                        first_name = " ".join(parts[2:]).strip()
                        students_info.append((matricule, last_name, first_name))

            # Ajouter une pause entre chaque page pour donner le temps de traitement
            time.sleep(1)  # 1 seconde de pause entre chaque page

    # Vérifier que les deux listes ont la même longueur
    if len(students_info) != len(emails_campuses):
        print("⚠️ Attention : le nombre d'étudiants et le nombre d'emails/campus ne correspondent pas !")

    # Fusionner les données
    students_data = []
    for i in range(min(len(students_info), len(emails_campuses))):
        matricule, last_name, first_name = students_info[i]
        email, campus = emails_campuses[i]

        student = {
            "matricule": matricule,
            "lastName": last_name,
            "firstName": first_name,
            "email": email,
            "campusId": campus
        }
        students_data.append(student)

    return students_data

# 🔹 Chemin du fichier PDF
pdf_path = "students.pdf"

# 🔹 Extraction des données
students_data = extract_data_from_pdf(pdf_path)

# 🔹 Sauvegarde en JSON
with open("students.json", "w", encoding="utf-8") as json_file:
    json.dump(students_data, json_file, indent=4, ensure_ascii=False)

print(f"✅ Extraction terminée ! {len(students_data)} étudiants enregistrés dans students.json")
