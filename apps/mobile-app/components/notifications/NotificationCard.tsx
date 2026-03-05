import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type NotificationType = 'urgent' | 'warning' | 'safe';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  location: string;
  timeAgo: string;
  isRead: boolean;
}

interface NotificationCardProps {
  notification: Notification;
}

const TYPE_CONFIG = {
  urgent: {
    label: 'Khẩn cấp',
    labelColor: '#e53935',
    iconBg: '#e53935',
    borderColor: '#e53935',
    icon: <Ionicons name="warning" size={20} color="#ffffff" />,
  },
  warning: {
    label: 'Cảnh báo',
    labelColor: '#fb8c00',
    iconBg: '#fb8c00',
    borderColor: '#fb8c00',
    icon: <Ionicons name="alert-circle" size={20} color="#ffffff" />,
  },
  safe: {
    label: 'An toàn',
    labelColor: '#43a047',
    iconBg: '#43a047',
    borderColor: 'transparent',
    icon: <Ionicons name="checkmark" size={20} color="#ffffff" />,
  },
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const { type, title, description, location, timeAgo, isRead } = notification;
  const config = TYPE_CONFIG[type];
  const isUnread = !isRead;

  return (
    <View
      style={[
        styles.card,
        isUnread && { borderLeftColor: config.borderColor, borderLeftWidth: 4 },
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
        {config.icon}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Type + time row */}
        <View style={styles.metaRow}>
          <Text style={[styles.typeLabel, { color: config.labelColor }]}>
            {config.label}
          </Text>
          <Text style={[styles.timeAgo, isRead && styles.timeAgoRead]}>
            {timeAgo}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, isRead && styles.titleRead]}>{title}</Text>

        {/* Description */}
        <Text style={[styles.description, isRead && styles.descriptionRead]}>
          {description}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons
            name="location-sharp"
            size={12}
            color={isRead ? '#9ca3af' : '#6b7280'}
          />
          <Text style={[styles.location, isRead && styles.locationRead]}>
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#eef2f7',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.3,
  },
  timeAgoRead: {
    color: '#9ca3af',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  titleRead: {
    color: '#4b5563',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  descriptionRead: {
    color: '#6b7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: -0.3,
  },
  locationRead: {
    color: '#9ca3af',
  },
});
