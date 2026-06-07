import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { notificationService } from '../services/notification.service';
import { storageService } from '../services/storage.service';
import { useFloodToastContext } from '../context/FloodToastContext';

export interface UnreadNotificationsContextType {
  unreadCount: number;
  isLoading: boolean;
  /** Mốc thời gian (Date.now()) của lần nhận push gần nhất — đổi giá trị mỗi khi có push mới.
   *  Màn hình danh sách thông báo dựa vào đây để fetch lại đúng lúc, thay vì polling định kỳ. */
  lastPushAt: number | null;
  refresh: () => Promise<void>;
  incrementCount: () => void;
  decrementCount: (amount?: number) => void;
  updateCount: (count: number) => void;
  reset: () => void;
}

const UnreadNotificationsContext = createContext<UnreadNotificationsContextType | undefined>(undefined);

interface UnreadNotificationsProviderProps {
  children: React.ReactNode;
}

export function UnreadNotificationsProvider({ children }: UnreadNotificationsProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastPushAt, setLastPushAt] = useState<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const { showFloodToast } = useFloodToastContext();

  const checkAuth = useCallback(async () => {
    const token = await storageService.getAccessToken();
    setIsAuthenticated(!!token);
    return !!token;
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      console.log('[UnreadNotifications] Not authenticated, skipping fetch');
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('[UnreadNotifications] Failed to fetch unread count:', error);

      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        console.warn('[UnreadNotifications] Session expired, resetting count');
        setUnreadCount(0);
        setIsAuthenticated(false);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  const incrementCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const decrementCount = useCallback((amount: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  }, []);

  const updateCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const reset = useCallback(() => {
    console.log('[UnreadNotifications] Resetting context');
    setUnreadCount(0);
    setIsAuthenticated(false);
  }, []);

  // Refresh khi app từ background trở về foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const wasBackground = appStateRef.current === 'background';
      appStateRef.current = nextAppState;

      if (nextAppState === 'active' && wasBackground) {
        const isAuth = await checkAuth();
        if (isAuth) {
          fetchUnreadCount();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [checkAuth, fetchUnreadCount]);

  // FCM foreground message listener
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('[UnreadNotifications] FCM foreground message:', remoteMessage);

      // Backend (FcmDispatchService) luôn đính kèm notificationId + notificationType
      // trong data payload — đây là dấu hiệu tin cậy để nhận biết push từ hệ thống
      // (data KHÔNG có field "type" như điều kiện cũ kiểm tra, nên trước đây luôn bỏ qua).
      const notificationType = remoteMessage.data?.notificationType as string | undefined;
      if (remoteMessage.data?.notificationId || notificationType) {
        incrementCount();
        // Báo cho màn danh sách thông báo (nếu đang mở) biết để fetch lại — event-driven,
        // không polling theo chu kỳ để tránh gọi API thừa khi không có gì mới.
        setLastPushAt(Date.now());

        const title = remoteMessage.notification?.title ?? 'Cảnh báo lũ lụt';
        const body = remoteMessage.notification?.body ?? '';
        showFloodToast(title, body, notificationType ?? 'SYSTEM_UPDATE');
      }
    });

    return unsubscribe;
  }, [incrementCount, showFloodToast]);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        console.log('[UnreadNotifications] Not authenticated, skipping initial load');
        setIsLoading(false);
        return;
      }
      await fetchUnreadCount();
    };

    init();
  }, [checkAuth, fetchUnreadCount]);

  const value: UnreadNotificationsContextType = {
    unreadCount,
    isLoading,
    lastPushAt,
    refresh: fetchUnreadCount,
    incrementCount,
    decrementCount,
    updateCount,
    reset,
  };

  return (
    <UnreadNotificationsContext.Provider value={value}>
      {children}
    </UnreadNotificationsContext.Provider>
  );
}

export function useUnreadNotificationsContext(): UnreadNotificationsContextType {
  const context = useContext(UnreadNotificationsContext);
  if (context === undefined) {
    throw new Error('useUnreadNotificationsContext must be used within an UnreadNotificationsProvider');
  }
  return context;
}
