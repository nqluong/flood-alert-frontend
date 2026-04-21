import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddressEmptyStateProps {
  onAddPress: () => void;
}

export function AddressEmptyState({ onAddPress }: AddressEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="location-outline" size={64} color="#d1d5db" />
      <Text style={styles.title}>Chưa có địa chỉ nào</Text>
      <Text style={styles.description}>
        Thêm địa chỉ để nhận cảnh báo ngập lụt chính xác hơn
      </Text>
      <TouchableOpacity style={styles.button} onPress={onAddPress} activeOpacity={0.85}>
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.buttonText}>Thêm địa chỉ đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#009688',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
