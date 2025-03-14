import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ProfilePage from "./ProfilePage";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import StudentsPage from "./StudentsPage";
import TeacherPage from "./TeacherPage";
import ImportPage from "./ImportPage";
import PrivateRoute from "./PrivateRoute";
import NewsPage from "./NewsPage";


const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const getUserInfo = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Informations utilisateur récupérées :", response.data);
      // Mettre à jour l'état de l'utilisateur et l'authentification
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur", error);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    console.log("🔍 Token récupéré depuis l'URL :", tokenFromUrl);

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      getUserInfo(tokenFromUrl).then(() => {
        console.log("✅ Redirection vers /home après connexion...");
        navigate("/home");
      });
    } else {
      const token = localStorage.getItem("token");
      console.log("📂 Token depuis localStorage :", token);

      if (token) {
        getUserInfo(token).then(() => navigate("/home"));
      } else {
        console.log("❌ Aucun token trouvé, redirection vers /login");
        navigate("/login");
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    console.log('Tentative de connexion...');
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login"); // Rediriger vers la page de login après déconnexion
  };

  return (
    <div className="App">
      {/* Navbar Bootstrap */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
  <div className="container">
    <Link to="/" className="navbar-brand fw-bold">
      <img src="https://upload.wikimedia.org/wikipedia/fr/c/c8/He2b.svg" alt="" width="60" />
    </Link>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item">
          <Link to="/home" className="nav-link text-white">Accueil</Link>
        </li>
        <li className="nav-item">
          <Link to="/profile" className="nav-link text-white">Profile</Link>
        </li>
        {isAuthenticated && user?.email?.endsWith("@he2b.be") && (
        <li className="nav-item">
          <Link to="/import" className="nav-link text-white">Import</Link>
        </li>
        )}
        {isAuthenticated && user?.email?.endsWith("@etu.he2b.be") && (
          <li className="nav-item">
            <Link to="/students" className="nav-link text-white">Students</Link>
          </li>
        )}
        {isAuthenticated && user?.email?.endsWith("@he2b.be") && (
        <li className="nav-item">
          <Link to="/teachers" className="nav-link text-white">Teachers</Link>
        </li>
        )}
        {isAuthenticated && user?.email?.endsWith("ce@he2b.be") && (
        <li className="nav-item">
          <Link to="/news" className="nav-link text-white">News</Link>
        </li>
        )}
      </ul>

      {/* Bouton de connexion/déconnexion à droite */}
      <div className="d-flex ms-auto">
        {!isAuthenticated ? (
          <button onClick={handleGoogleLogin} className="btn btn-primary me-2">
            <i className="fa-brands fa-google"></i> Se connecter
          </button>
        ) : (
          <button onClick={handleLogout} className="btn btn-danger">
            <i className="fa-solid fa-power-off"></i> Déconnexion
          </button>
        )}
      </div>
    </div>
  </div>
</nav>


      {/* Condition pour afficher l'image et le texte uniquement si l'utilisateur n'est pas connecté */}
      {!isAuthenticated && (
        <div className="landing-section d-flex justify-content-center align-items-center vh-100">
          <div className="container text-center">
            <div className="row">
              <div className="col-md-6">
                {/* Image Section */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/fr/c/c8/He2b.svg" // Remplace par l'URL de ton image
                  alt="Landing"
                  className="img-fluid mb-4"
                />
              </div>
              <div className="col-md-6 d-flex justify-content-center align-items-center">
                <div className="card p-4 shadow-sm" style={{border: "none"}}>
                  <div className="card-body text-center">
                    <p className="lead">Bienvenue sur HE2B App!</p>
                    <div className="d-flex justify-content-center">
                      {!isAuthenticated ? (
                        <button onClick={handleGoogleLogin} className="btn btn-primary me-2">
                          <i className="fa-brands fa-google"></i> Se connecter
                        </button>
                      ) : (
                        <button onClick={handleLogout} className="btn btn-danger">
                          <i className="fa-solid fa-power-off"></i> Déconnexion
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} element={<HomePage user={user} />} />
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} element={<ProfilePage user={user} />} />
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} element={<StudentsPage user={user} />} />
          }
        />
        <Route
          path="/teachers"
          element={
            isAuthenticated ? (
              <TeacherPage user={user} />
            ) : (
              <div className="text-center mt-5">
                <h2>🚫 Accès refusé</h2>
                <p>Vous devez être connecté pour voir cette page.</p>
                <Link to="/login" className="btn btn-primary">Se connecter</Link>
              </div>
            )
          }
        />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/" element={isAuthenticated ? <HomePage user={user} /> : <LoginPage />} />
      </Routes>
    </div>
  );
};

export default App;
