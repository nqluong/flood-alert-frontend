import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from '../context/AlertContext';
import { UnreadNotificationsProvider } from '../background/UnreadNotificationsContext';
import { AppAlert } from '../components/ui/AppAlert';

// QUAN TRỌNG: Import để đăng ký Background Location Task
import '../background/BackgroundLocationTask';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Must be called after the native bridge is ready, not at module level.
    MapLibreGL.setAccessToken(null);
    
    // Ignore MapLibre warnings
    LogBox.ignoreLogs([
      'MapLibre',
      'Mbgl-HttpRequest',
      'Request failed due to a permanent error',
    ]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <UnreadNotificationsProvider>
          <Stack initialRouteName="login">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="addresses" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="notification-detail" options={{ headerShown: false }} />
          </Stack>
          <AppAlert />
        </UnreadNotificationsProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}
