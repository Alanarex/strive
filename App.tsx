import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { RecordingProvider } from './src/context/RecordingContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/database';

export default function App() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RecordingProvider>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </SafeAreaProvider>
        </RecordingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
