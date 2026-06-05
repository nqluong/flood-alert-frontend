import { Stack } from 'expo-router';
import { LogBox, View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertProvider } from '../context/AlertContext';
import { FloodToastProvider } from '../context/FloodToastContext';
import { UnreadNotificationsProvider } from '../background/UnreadNotificationsContext';
import { AppAlert } from '../components/ui/AppAlert';
import { FloodToastBanner } from '../components/ui/FloodToastBanner';

import '../background/BackgroundLocationTask';

// Must be called at module level before any MapView renders
MapLibreGL.setAccessToken(null);

LogBox.ignoreLogs([
  'MapLibre',
  'Mbgl-HttpRequest',
  'Request failed due to a permanent error',
]);

const queryClient = new QueryClient();

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default function RootLayout() {

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <FloodToastProvider>
          <UnreadNotificationsProvider>
            <View style={styles.root}>
              <Stack initialRouteName="login">
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="addresses" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="notification-detail" options={{ headerShown: false }} />
                <Stack.Screen name="privacy" options={{ headerShown: false }} />
                <Stack.Screen name="terms" options={{ headerShown: false }} />
                <Stack.Screen name="help" options={{ headerShown: false }} />
              </Stack>
              <AppAlert />
              <FloodToastBanner />
            </View>
          </UnreadNotificationsProvider>
        </FloodToastProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}
