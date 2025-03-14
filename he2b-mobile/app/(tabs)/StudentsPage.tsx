// app/(tabs)/StudentsPage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StudentsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page des Étudiants</Text>
      <Text>Bienvenue sur la page dédiée aux étudiants !</Text>
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

export default StudentsPage;
