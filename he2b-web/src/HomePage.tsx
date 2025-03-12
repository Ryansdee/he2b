import React from "react";

const HomePage: React.FC<{ user: any }> = ({ user }) => {
  // Extraire le matricule (partie avant '@' dans l'email)
  const matricule = user?.email?.split('@')[0];

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1>Bienvenue, {user?.name}!</h1>
        </div>
        <div className="card-body">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Matricule:</strong> {matricule}</p>
          <p><strong>Campus:</strong> {user?.campus?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
