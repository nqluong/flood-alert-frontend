import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type FloodSeverity = 'danger' | 'warning';

export interface FloodPoint {
  id: string;
  name: string;
  description: string;
  timeAgo: string;
  severity: FloodSeverity;
}

interface FloodPointCardProps {
  name: string;
  description: string;
  timeAgo: string;
  severity: FloodSeverity;
}

export function FloodPointCard({ name, description, timeAgo, severity }: FloodPointCardProps) {
  const borderColor = severity === 'danger' ? '#e53935' : '#fb8c00';
  const iconBgColor =
    severity === 'danger' ? 'rgba(229,57,53,0.1)' : 'rgba(251,140,0,0.1)';
  const iconColor = severity === 'danger' ? '#e53935' : '#fb8c00';

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {severity === 'danger' ? (
          <Ionicons name="warning" size={20} color={iconColor} />
        ) : (
          <MaterialCommunityIcons name="waves" size={20} color={iconColor} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color="#6b7280" />
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f6',
    borderLeftWidth: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    minHeight: 104,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginLeft: 16,
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    letterSpacing: -0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.5,
  },
});
