import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Fonction pour gérer la connexion Google
  const handleGoogleLogin = async () => {
    // Rediriger vers l'API de connexion Google
    window.location.href = "http://localhost:5000/auth/google"; // Remplace par ton URL d'authentification
  };

  return (
    <p></p>
  );
};

export default LoginPage;
