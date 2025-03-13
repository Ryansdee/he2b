import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    campus: "",
  });
  const [searchTerm, setSearchTerm] = useState(""); // Recherche par prénom, nom ou matricule
  const [selectedCampus, setSelectedCampus] = useState(""); // Filtrer par campus
  const [sortBy, setSortBy] = useState("name"); // Tri des étudiants (nom/matricule)
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getUserEmail = () => {
      const email = "64576@etu.he2b.be"; // Remplacer par la méthode réelle
      setUserEmail(email);
    };

    getUserEmail();
    fetchStudents();
    fetchCampuses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants", error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/campuses");
      setCampuses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des campus", error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/students", {
        ...newStudent,
        campusId: newStudent.campus,
      });
      await fetchStudents();
      setNewStudent({ firstName: "", lastName: "", matricule: "", campus: "" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'étudiant", error);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/students/${id}`);
      setStudents(students.filter((student) => student.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étudiant", error);
    }
  };

  // 🔹 Filtrage des étudiants
  const filteredStudents = students
  .filter((student) =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matricule.includes(searchTerm)
  )
  .filter((student) => (selectedCampus ? student.campus.id === Number(selectedCampus) : true)) // ✅ Correction ici
  .sort((a, b) => {
    if (sortBy === "name") {
      return a.lastName.localeCompare(b.lastName);
    } else if (sortBy === "matricule") {
      return a.matricule.localeCompare(b.matricule);
    }
    return 0;
  });


  const isStudent = userEmail?.endsWith("@etu.he2b.be");

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Gestion des étudiants</h1>

      {/* Formulaire d'ajout */}
      <div className="card p-4 shadow-sm">
        <h2 className="mb-3">Ajouter un étudiant</h2>
        <form onSubmit={handleAddStudent}>
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Prénom"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Nom"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Matricule"
                value={newStudent.matricule}
                onChange={(e) => setNewStudent({ ...newStudent, matricule: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              value={newStudent.campus}
              onChange={(e) => setNewStudent({ ...newStudent, campus: e.target.value })}
              required
            >
              <option value="">Sélectionner un campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Ajouter étudiant
          </button>
        </form>
      </div>

      {/* 🔹 Filtres */}
      <div className="mt-4 d-flex gap-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par prénom, nom ou matricule"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="form-select" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
          <option value="">Tous les campus</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </select>
        <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Trier par Nom</option>
          <option value="matricule">Trier par Matricule</option>
        </select>
      </div>

      {/* Liste des étudiants */}
      <div className="mt-5">
        <h2>Liste des étudiants</h2>
        {filteredStudents.length === 0 ? (
          <p className="text-muted">Aucun étudiant trouvé.</p>
        ) : (
          <table className="table table-striped mt-3">
            <thead className="table-dark">
              <tr>
                <th>Nom complet</th>
                <th>Matricule</th>
                <th>Email</th>
                <th>Campus</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.matricule}</td>
                  <td>{student.email}</td>
                  <td>{student.campus.name}</td>
                  <td>
                    {!isStudent && (
                      <>
                        <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteStudent(student.id)}>
                          Supprimer
                        </button>
                        <button className="btn btn-warning btn-sm" onClick={() => navigate(`/students/edit/${student.id}`)}>
                          Modifier
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
