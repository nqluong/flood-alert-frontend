import { View, Text, StyleSheet } from 'react-native';
import { SHARED_TEST } from '@floodalert/shared-logic'; // Test luôn Monorepo

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FloodGuard Mobile</Text>
      <Text>Shared: {SHARED_TEST}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});