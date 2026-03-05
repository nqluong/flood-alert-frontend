import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppHeader } from '../../components/AppHeader';
import {
  NotificationCard,
  Notification,
} from '../../components/notifications/NotificationCard';
import {
  NotificationFilterTabs,
  NotificationFilter,
} from '../../components/notifications/NotificationFilterTabs';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Cảnh báo khẩn: Đường Nguyễn Huệ đang ngập sâu!',
    description:
      'Mức nước 80cm, xe máy không thể di chuyển. Tìm đường khác ngay.',
    location: 'Quận 1, TP.HCM - 1.2km từ vị trí của bạn',
    timeAgo: '2 phút trước',
    isRead: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Ngập nhẹ tại đường Lê Lợi',
    description:
      'Mức nước 20-30cm, xe máy có thể đi chậm. Cẩn thận khi di chuyển.',
    location: 'Quận 1, TP.HCM - 0.8km từ vị trí của bạn',
    timeAgo: '15 phút trước',
    isRead: false,
  },
  {
    id: '3',
    type: 'safe',
    title: 'Nước đã rút tại đường Điện Biên Phủ',
    description: 'Giao thông trở lại bình thường, có thể di chuyển an toàn.',
    location: 'Quận 3, TP.HCM - 2.1km từ vị trí của bạn',
    timeAgo: '1 giờ trước',
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Mưa lớn gây ngập tại khu vực Tân Bình',
    description: 'Nhiều tuyến đường bị ảnh hưởng, hạn chế di chuyển.',
    location: 'Quận Tân Bình, TP.HCM - 5.2km từ vị trí của bạn',
    timeAgo: '2 giờ trước',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'urgent':
        return notifications.filter((n) => n.type === 'urgent');
      case 'read':
        return notifications.filter((n) => n.isRead);
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const MarkAllButton = (
    <TouchableOpacity
      onPress={handleMarkAllRead}
      activeOpacity={0.7}
      hitSlop={8}
      disabled={unreadCount === 0}
    >
      <Ionicons
        name="checkmark-done"
        size={22}
        color={unreadCount > 0 ? '#ffffff' : 'rgba(255,255,255,0.4)'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Thông báo cảnh báo" rightSlot={MarkAllButton} />

      <NotificationFilterTabs
        active={activeFilter}
        onChange={setActiveFilter}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        contentContainerStyle={
          filtered.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'urgent'
                ? 'Không có cảnh báo khẩn cấp nào'
                : activeFilter === 'read'
                ? 'Bạn chưa đọc thông báo nào'
                : 'Các cảnh báo lũ lụt sẽ xuất hiện ở đây'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
