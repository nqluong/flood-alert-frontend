import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';

/**
 * Hook để lấy số lượng thông báo chưa đọc
 * Sử dụng để hiển thị badge trên tab icon
 */
export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds to update badge
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    refresh: fetchUnreadCount,
  };
}
