import React, { useState, useEffect } from "react";

interface ProfilePageProps {
  user: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (user?.name) {
      const [first, last] = user.name.split(' ');
      setFirstName(first);
      setLastName(last);
    }
  }, [user]);

  // Fonction pour envoyer les modifications au backend
  const handleSaveChanges = async () => {
    const updatedUser = { firstName, lastName };

    try {
      const response = await fetch("http://localhost:5000/api/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Utilisateur mis à jour : ", updatedData);
        setIsEditing(false); // Désactiver le mode édition
      } else {
        console.error("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg" style={{ maxWidth: "600px", margin: "auto" }}>
        <div className="card-body">
          <h2 className="card-title text-center">
            Bonjour, {user?.name}
          </h2>

          <p className="card-text">
            <strong>Email:</strong> {user?.email}
          </p>

          {isEditing ? (
            <div>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  <i className="fas fa-pencil-alt mr-2"></i> Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  value={user.firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                <i className="fas fa-pencil-alt mr-2"></i> Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  value={user.lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                />
              </div>

              <div className="d-flex justify-content-between">
                <button onClick={handleSaveChanges} className="btn btn-success">
                  <i className="fas fa-save mr-2"></i> Sauvegarder
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-danger">
                  <i className="fas fa-times mr-2"></i> Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p><strong>Prénom:</strong> {user.firstName}</p>
              <p><strong>Nom:</strong> {user.lastName}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-warning">
                <i className="fas fa-edit mr-2"></i> Modifier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;