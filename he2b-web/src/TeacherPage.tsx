import React, { useEffect, useState } from "react";
import axios from "axios";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  campusId: number;
}

interface Campus {
  id: number;
  name: string;
}

const TeacherPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [email, setEmail] = useState("");  // Email de l'utilisateur connecté
  const [teacherId, setTeacherId] = useState<number | null>(null); // ID du professeur sélectionné
  const [isPresent, setIsPresent] = useState<boolean | null>(null); // Statut de présence, null signifie non sélectionné
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [campusId, setCampusId] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false); // Indicateur si l'email est valide

  useEffect(() => {
    fetchTeachers();
    fetchCampuses();
  }, []);

  // 🔹 Charger les enseignants
  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/teachers");
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur de chargement des enseignants:", error);
      setTeachers([]);
    }
  };

  // 🔹 Charger les campus
  const fetchCampuses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/campuses");
      setCampuses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur de chargement des campus :", error);
      setCampuses([]);
    }
  };

  // 🔹 Trouver le nom du campus correspondant à l'ID
  const getCampusName = (id: number) => {
    const campus = campuses.find((c) => c.id === id);
    return campus ? campus.name : "Inconnu";
  };

  // 🔹 Vérification de l'email de l'utilisateur connecté
  const handleEmailChange = (emailInput: string) => {
    setEmail(emailInput);

    // Vérifier si l'email appartient au domaine @he2b.be
    if (emailInput.includes("@he2b.be")) {
      const [userName] = emailInput.split("@"); // Extraire la partie avant le '@'
      const [first, last] = userName.split("."); // Supposons que le format soit "prenom.nom"

      // Mettre à jour les informations du professeur
      setFirstName(first || "Inconnu");
      setLastName(last || "Inconnu");
      setIsEmailValid(true);  // Valider l'email
    } else {
      setIsEmailValid(false);
    }
  };

  // 🔹 Ajouter un professeur
  const handleAddTeacher = async () => {
    try {
      await axios.post("http://localhost:5000/teachers", { firstName, lastName, campusId: parseInt(campusId) });
      fetchTeachers();
      setFirstName("");
      setLastName("");
      setCampusId("");
    } catch (error) {
      console.error("Erreur d'ajout :", error);
    }
  };

  // 🔹 Supprimer un professeur
  const handleDeleteTeacher = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/teachers/${id}`);
      fetchTeachers();
    } catch (error) {
      console.error("Erreur de suppression :", error);
    }
  };

  const updatePresenceInDatabase = async (teacherId, presence) => {
    try {
      // Vérifier si la présence est déjà enregistrée pour ce professeur et ce jour
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          teacherId_timestamp: {
            teacherId,
            timestamp: new Date().toISOString().split('T')[0], // Utiliser la date actuelle
          },
        },
      });
  
      if (existingAttendance) {
        // Si une présence existe déjà, la mettre à jour
        return await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: { present: presence },
        });
      } else {
        // Si aucune présence n'existe, créer une nouvelle entrée
        return await prisma.attendance.create({
          data: {
            teacherId,
            present: presence,
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la présence:", error);
      throw new Error("Erreur lors de la mise à jour de la présence");
    }
  };


  // 🔹 Sélectionner un professeur
  const handleTeacherSelect = (id: number) => {
    setTeacherId(id); // Définit l'ID du professeur sélectionné
    setIsPresent(null); // Réinitialise le statut de présence à "non sélectionné"
  };

  const handlePresenceChange = async (status: boolean) => {
    if (teacherId !== null) {
      console.log("Envoi de la présence : ", teacherId, status); // Vérifiez les valeurs avant l'envoi
      try {
        const response = await axios.post("http://localhost:5000/attendance", {
          teacherId,
          presence: status,
        });
        console.log("Réponse de l'API : ", response.data); // Log la réponse de l'API
        setIsPresent(status);  // Mettre à jour l'état de la présence
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la présence:", error);
      }
    }
  };  
  
  // Exemple de fonction handleModifyPresence
const handleModifyPresence = async (teacherId: number, presence: boolean) => {
  try {
    const response = await axios.post("http://localhost:5000/attendance", {
      teacherId,
      presence,
    });
    console.log("Présence mise à jour avec succès", response.data);
    setIsPresent(presence); // Mettre à jour l'état de la présence
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la présence:", error);
  }
};



  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">📚 Liste des Professeurs</h1>

      {/* 🔹 Formulaire de connexion */}
      <div className="card p-4 mb-4 shadow">
        <h4>Connexion (Entrer votre email)</h4>
        <div className="row g-3">
          <div className="col-md-8">
            <input
              type="email"
              className="form-control"
              placeholder="Votre email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            {isEmailValid ? (
              <button className="btn btn-primary" onClick={() => console.log("Professeur connecté")}>
                Se connecter
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>
                Email invalide
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Afficher les informations du professeur si l'email est valide */}
      {isEmailValid && (
        <div className="card p-4 mb-4 shadow">
          <h4>Bienvenue, {firstName} {lastName}</h4>
          <div className="text-center">
          <button
              className="btn btn-warning mt-2"
              onClick={() => handleModifyPresence(teacherId, isPresent === null ? true : !isPresent)} // Passez teacherId et l'état de présence
              disabled={isPresent === null} // Désactive si aucun statut de présence n'est défini
            >
              Modifier la présence
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handlePresenceChange(false)}
              disabled={isPresent !== null} // Désactive les boutons si un statut de présence est déjà sélectionné
            >
              Marquer comme absent
            </button>
            <button
              className="btn btn-warning mt-2"
              onClick={handleModifyPresence}
              disabled={isPresent === null} // Désactive si aucun statut de présence n'est défini
            >
              Modifier la présence
            </button>
          </div>
          {isPresent !== null && (
            <div className="mt-3">
              <p>
                Présence: {isPresent ? "Présent" : "Absent"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Formulaire d'ajout de professeur */}
      <div className="card p-4 mb-4 shadow">
        <h4>Ajouter un professeur</h4>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-control"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
            >
              <option value="">Sélectionner un campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 text-center">
            <button className="btn btn-primary" onClick={handleAddTeacher}>
              ➕ Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Liste des professeurs */}
      <table className="table table-bordered table-hover shadow">
        <thead className="table-dark">
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Campus</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.firstName} {teacher.lastName}</td>
                <td>{teacher.email}</td>
                <td>{getCampusName(teacher.campusId)}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleTeacherSelect(teacher.id)} // Sélectionne le professeur
                  >
                    Sélectionner pour présence
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTeacher(teacher.id)}>
                    🗑 Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">Aucun professeur trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherPage;
