import { useUnreadNotificationsContext } from '../background/UnreadNotificationsContext';

interface UseUnreadNotificationsOptions {
  /**
   * Có tự động poll không (deprecated - giờ được quản lý bởi context)
   * @deprecated Sử dụng context để quản lý polling globally
   */
  enablePolling?: boolean;
  /**
   * Interval polling (deprecated - giờ được quản lý bởi context)
   * @deprecated Sử dụng context để quản lý polling globally
   */
  pollingInterval?: number;
}

/**
 * Hook để lấy số lượng thông báo chưa đọc
 * Sử dụng để hiển thị badge trên tab icon
 * 
 * @param options - Cấu hình polling (deprecated, giờ dùng context)
 */
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
    reset, // Expose reset method
  };
}