import { useUnreadNotificationsContext } from '../background/UnreadNotificationsContext';

interface UseUnreadNotificationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
}

export function useUnreadNotifications(options: UseUnreadNotificationsOptions = {}) {
  // Sử dụng context thay vì logic riêng
  const {
    unreadCount,
    isLoading,
    refresh,
    incrementCount,
    decrementCount,
    updateCount,
    reset,
  } = useUnreadNotificationsContext();

  return {
    unreadCount,
    isLoading,
    refresh,
    updateUnreadCount: updateCount,
    incrementUnreadCount: incrementCount,
    decrementUnreadCount: decrementCount,
    reset,
  };
}