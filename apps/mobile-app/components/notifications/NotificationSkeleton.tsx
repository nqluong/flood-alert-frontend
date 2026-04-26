import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Skeleton loader cho notification card
 */
export function NotificationSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle} />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.typeLabel} />
          <View style={styles.timeAgo} />
        </View>
        <View style={styles.title} />
        <View style={styles.description} />
        <View style={styles.descriptionShort} />
        <View style={styles.location} />
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  timeAgo: {
    width: 60,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  title: {
    width: '90%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  description: {
    width: '100%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  descriptionShort: {
    width: '70%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  location: {
    width: 120,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 4,
  },
});
