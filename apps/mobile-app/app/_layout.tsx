import { useEffect } from 'react';
import { Stack } from 'expo-router';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from '../context/AlertContext';
import { AppAlert } from '../components/ui/AppAlert';

// QUAN TRỌNG: Import để đăng ký Background Location Task
import '../services/BackgroundLocationTask';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Must be called after the native bridge is ready, not at module level.
    MapLibreGL.setAccessToken(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <Stack initialRouteName="login">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="addresses" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
        <AppAlert />
      </AlertProvider>
    </QueryClientProvider>
  );
}
