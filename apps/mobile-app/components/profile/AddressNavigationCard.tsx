import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddressNavigationCardProps {
  onPress: () => void;
}

export function AddressNavigationCard({ onPress }: AddressNavigationCardProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.left}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={20} color="#009688" />
          </View>
          <View>
            <Text style={styles.title}>Địa chỉ của tôi</Text>
            <Text style={styles.description}>Quản lý địa chỉ nhận cảnh báo</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9e9e9e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,150,136,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
