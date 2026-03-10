import { useEffect } from 'react';
import { Stack } from 'expo-router';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { AlertProvider } from '../context/AlertContext';
import { AppAlert } from '../components/ui/AppAlert';

export default function RootLayout() {
  useEffect(() => {
    // Must be called after the native bridge is ready, not at module level.
    MapLibreGL.setAccessToken(null);
  }, []);

  return (
    <AlertProvider>
      <Stack initialRouteName="login">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <AppAlert />
    </AlertProvider>
  );
}