import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppHeader } from '../../components/AppHeader';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import {
  NotificationFilterTabs,
  NotificationFilter,
} from '../../components/notifications/NotificationFilterTabs';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification.types';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    filteredNotifications,
    unreadCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    activeFilter,
    setActiveFilter,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data.eventId) {
      // Navigate to flood detail screen
      // router.push(`/flood/${notification.data.eventId}`);
      console.log('Navigate to flood detail:', notification.data.eventId);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    await markAllAsRead();
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#009688" />
      </View>
    );
  };

  const MarkAllButton = (
    <TouchableOpacity
      onPress={handleMarkAllRead}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={unreadCount === 0}
    >
      <Ionicons
        name="checkmark-done"
        size={22}
        color={unreadCount > 0 ? '#ffffff' : 'rgba(255,255,255,0.4)'}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Thông báo cảnh báo" rightSlot={MarkAllButton} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#009688" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title="Thông báo cảnh báo" rightSlot={MarkAllButton} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e53935" />
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Thông báo cảnh báo" rightSlot={MarkAllButton} />

      <NotificationFilterTabs
        active={activeFilter}
        onChange={setActiveFilter}
        unreadCount={unreadCount}
      />

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
        contentContainerStyle={
          filteredNotifications.length === 0
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
                : activeFilter === 'unread'
                ? 'Bạn đã đọc tất cả thông báo'
                : 'Các cảnh báo lũ lụt sẽ xuất hiện ở đây'}
            </Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#009688']}
            tintColor="#009688"
          />
        }
        onEndReached={() => {
          if (hasMore && !isLoadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e53935',
  },
  errorDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#009688',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
