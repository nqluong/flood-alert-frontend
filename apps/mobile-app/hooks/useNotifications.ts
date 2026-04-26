import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../types/notification.types';

export type NotificationFilter = 'all' | 'urgent' | 'unread';

interface UseNotificationsReturn {
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  activeFilter: NotificationFilter;
  setActiveFilter: (filter: NotificationFilter) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter((n) => {
    switch (activeFilter) {
      case 'urgent':
        return n.priority === 'HIGH';
      case 'unread':
        return !n.isRead;
      default:
        return true;
    }
  });

  // Load notifications
  const loadNotifications = useCallback(
    async (page: number, append = false) => {
      try {
        const response = await notificationService.getNotifications(page, 20);
        
        setNotifications((prev) =>
          append ? [...prev, ...response.notifications] : response.notifications
        );
        setUnreadCount(response.unreadCount);
        setHasMore(response.hasNext);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông báo');
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadNotifications(0);
      setIsLoading(false);
    };
    init();
  }, [loadNotifications]);

  // Refresh (pull-to-refresh)
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications(0);
    setIsRefreshing(false);
  }, [loadNotifications]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    await loadNotifications(currentPage + 1, true);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, currentPage, loadNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, clickedAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, clickedAt: n.clickedAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  return {
    notifications,
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
  };
}
