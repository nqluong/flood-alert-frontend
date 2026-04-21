import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

interface ProfileInfoSectionProps {
  items: InfoItem[];
}

export function ProfileInfoSection({ items }: ProfileInfoSectionProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Ionicons name={item.icon as any} size={18} color="#6b7280" />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'right',
  },
});
