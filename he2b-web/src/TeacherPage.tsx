import React, { useEffect, useState } from "react";
import axios from "axios";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  campusId: number;
  presence?: boolean;
}

interface Campus {
  id: number;
  name: string;
}

const TeacherPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [email, setEmail] = useState("");
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [isPresent, setIsPresent] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [campusId, setCampusId] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchCampuses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/teachers");
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur de chargement des enseignants:", error);
      setTeachers([]);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/campuses");
      setCampuses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erreur de chargement des campus :", error);
      setCampuses([]);
    }
  };

  const getCampusName = (id: number) => {
    const campus = campuses.find((c) => c.id === id);
    return campus ? campus.name : "Inconnu";
  };

  const handleEmailChange = (emailInput: string) => {
    setEmail(emailInput);

    if (emailInput.includes("@he2b.be")) {
      const [userName] = emailInput.split("@");
      const [first, last] = userName.split(".");

      setFirstName(first || "Inconnu");
      setLastName(last || "Inconnu");
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!firstName || !lastName || !campusId) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    try {
      await axios.post("http://localhost:5000/teachers", {
        firstName,
        lastName,
        campusId: parseInt(campusId),
      });
      fetchTeachers();
      setFirstName("");
      setLastName("");
      setCampusId("");
    } catch (error) {
      console.error("Erreur d'ajout :", error);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/teachers/${id}`);
      fetchTeachers();
    } catch (error) {
      console.error("Erreur de suppression :", error);
    }
  };
const handleModifyPresence = async (teacherId: number, newPresence: boolean) => {
  console.log(`🔄 Tentative de modification de la présence de ${teacherId} à ${newPresence}`);

  try {
    const response = await axios.patch(`http://localhost:5000/teachers/${teacherId}/presence`, {
      isPresent: newPresence, // Vérifie bien que la clé correspond à celle du serveur
    });

    console.log("✅ Réponse serveur :", response.data);

    setTeachers((prevTeachers) =>
      prevTeachers.map((teacher) =>
        teacher.id === teacherId ? { ...teacher, presence: newPresence } : teacher
      )
    );

    if (teacherId === teacherId) {
      setIsPresent(newPresence);
    }

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la présence:", error);
  }
};

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">📚 Liste des Professeurs</h1>

      {/* 🔹 Informations du professeur connecté */}
      {isEmailValid && (
        <div className="card p-4 mb-4 shadow">
          <h4>Bienvenue, {firstName} {lastName}</h4>
          <div className="text-center">
            <button
              className="btn btn-warning mt-2"
              onClick={() => teacherId && handleModifyPresence(teacherId, !isPresent)}
              disabled={teacherId === null}
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
                  <button className="btn btn-success btn-sm" onClick={() => handleModifyPresence(teacher.id, true)}>✅ Présent</button>
                  <button className="btn btn-danger btn-sm ms-2" onClick={() => handleModifyPresence(teacher.id, false)}>❌ Absent</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="text-center">Aucun professeur trouvé.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherPage;
