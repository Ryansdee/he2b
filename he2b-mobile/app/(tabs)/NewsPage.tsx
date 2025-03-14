// app/(tabs)/NewsPage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NewsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page des Actualités</Text>
      <Text>Voici les dernières actualités de l'école !</Text>
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

export default NewsPage;
