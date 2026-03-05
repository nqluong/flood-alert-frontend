import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getValidAccessToken } from '../services/apiClient';


export default function Index() {
  useEffect(() => {
    async function checkAuth() {
      const token = await getValidAccessToken();
      if (token) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    }
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#009688" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f6',
  },
});
