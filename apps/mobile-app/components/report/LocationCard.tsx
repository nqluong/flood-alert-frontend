import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationCardProps {
  address: string;
  accuracy?: string;
}

export function LocationCard({ address, accuracy = '±8m' }: LocationCardProps) {
  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="location-sharp" size={18} color="#009688" />
      </View>

      {/* Text content */}
      <View style={styles.content}>
        <Text style={styles.label}>Vị trí hiện tại</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.accuracy}>Độ chính xác: {accuracy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,150,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: -0.5,
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  accuracy: {
    fontSize: 12,
    color: '#9ca3af',
    letterSpacing: -0.5,
  },
});
