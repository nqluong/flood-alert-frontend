import { Stack } from 'expo-router';
import { AlertProvider } from '../context/AlertContext';
import { AppAlert } from '../components/ui/AppAlert';

export default function RootLayout() {
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