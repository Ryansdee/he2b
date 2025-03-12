import React, { useState } from "react";
import axios from "axios";

const ImportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleImport = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Vous devez être connecté pour importer des étudiants.");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/import-students",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message || "Étudiants importés avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      setMessage("Erreur lors de l'importation des étudiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="import-page">
      <h2>Importation des étudiants</h2>
      <button
        className="btn btn-primary"
        onClick={handleImport}
        disabled={isLoading}
      >
        {isLoading ? "Importation en cours..." : "Importer les étudiants"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ImportPage;
