import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from './src/HomeScreen';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      <HomeScreen />
    </SafeAreaView>
  );
};

export default App;