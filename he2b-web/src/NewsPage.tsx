import React, { useEffect, useState } from "react";
import axios from "axios";

interface News {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  links?: string;
  campusId: number | null;
  createdAt: string;
}

interface Campus {
  id: number;
  name: string;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState("");
  const [campusId, setCampusId] = useState<number | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  useEffect(() => {
    fetchCampuses();
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const url = selectedCampus
        ? `http://localhost:5000/news/campus/${selectedCampus}`
        : "http://localhost:5000/news";
      const response = await axios.get(url);
      setNews(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des news :", error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/campuses");
      setCampuses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des campus :", error);
    }
  };

  const handleAddOrUpdateNews = async () => {
    if (!title || !description) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }
  
    const newsData = { title, description, imageUrl, links };
  
    try {
      if (editingNewsId) {
        // Mise à jour de toutes les news avec le même id
        await axios.put(`http://localhost:5000/news/${editingNewsId}`, newsData);
      } else {
        if (!campusId) {
          // Aucun campus spécifique, ne pas ajouter la news à tous les campus
          await axios.post("http://localhost:5000/news", { ...newsData });
        } else {
          // Ajouter la news à un campus spécifique
          await axios.post("http://localhost:5000/news", { ...newsData, campusId });
        }
      }
  
      fetchNews();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification :", error);
    }
  };
  

  const handleEditNews = (newsItem: News) => {
    setTitle(newsItem.title);
    setDescription(newsItem.description);
    setImageUrl(newsItem.imageUrl || "");
    setLinks(newsItem.links || "");
    setCampusId(newsItem.campusId);
    setEditingNewsId(newsItem.id);
  };

  const handleDeleteNews = async (title: string) => {
    try {
      // Suppression de toutes les occurrences de la news avec le même titre
      await axios.delete(`http://localhost:5000/news/title/${title}`);
      fetchNews(); // Rafraîchit la liste des news après la suppression
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLinks("");
    setCampusId(null);
    setEditingNewsId(null);
  };

  const getCampusName = (id: number | null) => {
    if (id === null) return "Tous les campus";
    const campus = campuses.find((c) => c.id === id);
    return campus ? campus.name : "Inconnu";
  };

  // Fonction pour formater la description avec un lien cliquable
  const getDescriptionWithLinks = (description: string, link: string | undefined) => {
    if (link) {
      const keyword = "lien";  // Mot-clé pour insérer le lien (à adapter selon votre besoin)
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      return description.replace(
        regex,
        `<a href="${link}" target="_blank" rel="noopener noreferrer">${keyword}</a>`
      );
    }
    return description;
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">📰 Gestion des News</h1>
      {/* Formulaire d'ajout/modification */}
      <div className="card p-4 mb-4 shadow">
        <h4>{editingNewsId ? "Modifier une News" : "Ajouter une News"}</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-control"
              value={campusId || ""}
              onChange={(e) => setCampusId(parseInt(e.target.value))}
            >
              <option value="">Sélectionner un campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-12">
            <textarea
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Image URL (optionnel)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Lien externe (optionnel)"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
            />
          </div>
          <div className="col-12 text-center">
            <button className="btn btn-primary me-2" onClick={handleAddOrUpdateNews}>
              {editingNewsId ? "Modifier" : "➕ Ajouter"}
            </button>
            {editingNewsId && (
              <button className="btn btn-secondary" onClick={resetForm}>
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des News */}
      <table className="table table-bordered table-hover shadow">
        <thead className="table-dark">
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Campus</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {news.length > 0 ? (
            news.map((newsItem) => (
              <tr key={newsItem.id}>
                <td>{newsItem.title}</td>
                <td
                  dangerouslySetInnerHTML={{
                    __html: getDescriptionWithLinks(newsItem.description, newsItem.links),
                  }}
                />
                <td>{getCampusName(newsItem.campusId)}</td>
                <td>{new Date(newsItem.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditNews(newsItem)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteNews(newsItem.title)}
                  >
                    🗑️ Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">Aucune news trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NewsPage;
