import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface LoginPageProps {
  handleLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans l'application</Text>
      <Button title="Se connecter avec Google" onPress={handleLogin} />
    </View>
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

export default LoginPage;
