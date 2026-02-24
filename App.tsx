import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡SISTEMA ACTIVO!</Text>
      <Text style={styles.subtext}>Si ves esto, el puente funciona.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#0f0',
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#fff',
    marginTop: 10,
  },
});

export default App;