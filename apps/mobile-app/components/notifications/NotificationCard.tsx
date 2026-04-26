import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Notification } from '../../types/notification.types';
import { formatTimeAgo, formatNotificationLocation } from '../../utils/dateUtils';

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const TYPE_CONFIG = {
  FLOOD_ALERT: {
    label: 'Cảnh báo lũ',
    icon: 'warning' as const,
  },
  FLOOD_UPDATE: {
    label: 'Cập nhật',
    icon: 'information-circle' as const,
  },
  SYSTEM_UPDATE: {
    label: 'Hệ thống',
    icon: 'notifications' as const,
  },
};

const PRIORITY_CONFIG = {
  HIGH: {
    labelColor: '#e53935',
    iconBg: '#e53935',
    borderColor: '#e53935',
  },
  NORMAL: {
    labelColor: '#fb8c00',
    iconBg: '#fb8c00',
    borderColor: '#fb8c00',
  },
  LOW: {
    labelColor: '#43a047',
    iconBg: '#43a047',
    borderColor: 'transparent',
  },
};

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const { title, body, notificationType, priority, data, isRead, createdAt } = notification;
  
  const typeConfig = TYPE_CONFIG[notificationType];
  const priorityConfig = PRIORITY_CONFIG[priority];
  const isUnread = !isRead;
  
  const timeAgo = formatTimeAgo(createdAt);
  const location = formatNotificationLocation(data);

  const handlePress = () => {
    onPress?.(notification);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isUnread && { borderLeftColor: priorityConfig.borderColor, borderLeftWidth: 4 },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: priorityConfig.iconBg }]}>
        <Ionicons name={typeConfig.icon} size={20} color="#ffffff" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Type + time row */}
        <View style={styles.metaRow}>
          <Text style={[styles.typeLabel, { color: priorityConfig.labelColor }]}>
            {typeConfig.label}
          </Text>
          <Text style={[styles.timeAgo, isRead && styles.timeAgoRead]}>
            {timeAgo}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, isRead && styles.titleRead]}>{title}</Text>

        {/* Description */}
        <Text style={[styles.description, isRead && styles.descriptionRead]} numberOfLines={2}>
          {body}
        </Text>

        {/* Location */}
        {location && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-sharp"
              size={12}
              color={isRead ? '#9ca3af' : '#6b7280'}
            />
            <Text style={[styles.location, isRead && styles.locationRead]} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}
      </View>

      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
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
    flex: 1,
  },
  locationRead: {
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#009688',
    position: 'absolute',
    top: 20,
    right: 16,
  },
});
