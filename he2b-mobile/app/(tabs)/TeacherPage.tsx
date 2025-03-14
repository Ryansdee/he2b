// app/(tabs)/TeacherPage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TeacherPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page des Enseignants</Text>
      <Text>Bienvenue sur la page dédiée aux enseignants !</Text>
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

export default TeacherPage;
