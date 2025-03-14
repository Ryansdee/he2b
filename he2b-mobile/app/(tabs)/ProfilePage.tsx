// app/(tabs)/HomePage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomePage = () => {
  return (
    <View style={styles.container}>
      <Text>Page d'Accueil</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomePage;
