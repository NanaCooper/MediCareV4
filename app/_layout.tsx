import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Try to load Inter font if available via expo-font
        // Note: For production, add Inter to app.json fonts or use a custom font loader
        await Font.loadAsync({
          // 'Inter': require('../assets/fonts/Inter-Regular.ttf'), // Uncomment if adding custom font
        });
      } catch (e) {
        console.warn('Font loading skipped or failed (using system fonts):', e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
