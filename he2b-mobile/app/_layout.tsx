// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import LoginPage from './(tabs)/LoginPage'; // Page de connexion

const AppLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Vérifier si un token est stocké lors du démarrage
  useEffect(() => {
    const fetchToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        setIsAuthenticated(true); // Si token trouvé, authentifier l'utilisateur
      } else {
        setIsAuthenticated(false); // Sinon, rediriger vers la page de login
        router.push('/login');
      }
    };
    fetchToken();
  }, [router]);

  return (
    <>
      {isAuthenticated ? (
        // Si authentifié, redirige vers /app/(tabs)
        <>{/* La navigation par onglets sera ici */}</>
      ) : (
        // Si non authentifié, redirige vers la page de login
        <LoginPage />
      )}
    </>
  );
};

export default AppLayout;
