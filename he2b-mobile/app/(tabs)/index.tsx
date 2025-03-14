import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import HomePage from './HomePage'; // Page d'accueil
import LoginPage from './LoginPage'; // Page de connexion

const Tab = createBottomTabNavigator();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configuration de la demande d'authentification Google
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '407304894097-6fukeaviamtnjnm4ekanp6n0cdcfn3oi.apps.googleusercontent.com', // Ton client ID Google
      redirectUri: makeRedirectUri({
        useProxy: true, // Utilisation du proxy Expo
      }),
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
  );

  // Gérer la réponse d'authentification
  useEffect(() => {
    if (response?.type === 'success' && response?.params?.id_token) {
      const { id_token } = response.params;
      console.log('Réponse reçue avec le token:', id_token);
      SecureStore.setItemAsync('token', id_token);
      getUserInfo(id_token);
    } else if (response?.type === 'error') {
      console.error('Erreur d\'authentification:', response.error);
    }
  }, [response]);

  // Récupérer les informations utilisateur avec le token
  const getUserInfo = async (token: string) => {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setIsAuthenticated(true); // Authentification réussie
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      setIsAuthenticated(false); // Échec de l'authentification
    }
  };

  // Authentifier avec Google
  const handleLogin = () => {
    console.log('Tentative de connexion avec Google...');
    promptAsync()
      .then((result) => {
        console.log('Résultat de l\'authentification:', result);
      })
      .catch((error) => {
        console.error('Erreur dans le processus de connexion Google:', error);
      });
  };
  

  // Se déconnecter
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Vérifier l'état d'authentification au démarrage
  useEffect(() => {
    const fetchToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        getUserInfo(token);
      } else {
        setIsAuthenticated(false);
      }
    };
    fetchToken();
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomePage} />
        </Tab.Navigator>
      ) : (
        <LoginPage handleLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default App;
