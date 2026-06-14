import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { storageService } from '../services/storage.service';
import { useFloodToastContext } from '../context/FloodToastContext';

const FLOOD_PUSH_TYPES = new Set(['FLOOD_ALERT', 'FLOOD_RESOLVED', 'FLOOD_UPDATE']);

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
  const queryClient = useQueryClient();

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


  const presentFloodToast = useCallback(
    (remoteMessage: { data?: Record<string, any>; notification?: { title?: string; body?: string } } | null) => {
      const notificationType = remoteMessage?.data?.notificationType as string | undefined;
      if (!remoteMessage || (!remoteMessage.data?.notificationId && !notificationType)) {
        return false;
      }

      const title = remoteMessage.notification?.title ?? 'Cảnh báo lũ lụt';
      const body = remoteMessage.notification?.body ?? '';
      showFloodToast(title, body, notificationType ?? 'SYSTEM_UPDATE');

      if (notificationType && FLOOD_PUSH_TYPES.has(notificationType)) {
        queryClient.invalidateQueries({ queryKey: ['nearbyFloods'] });
      }
      return true;
    },
    [showFloodToast, queryClient],
  );

  // FCM foreground message listener
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('[UnreadNotifications] FCM foreground message:', remoteMessage);

      if (presentFloodToast(remoteMessage)) {
        incrementCount();
        setLastPushAt(Date.now());
      }
    });

    return unsubscribe;
  }, [incrementCount, presentFloodToast]);

  useEffect(() => {
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('[UnreadNotifications] Notification opened app từ background:', remoteMessage);
      if (presentFloodToast(remoteMessage)) {
        setLastPushAt(Date.now());
        fetchUnreadCount();
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (!remoteMessage) return;
        console.log('[UnreadNotifications] App mở từ quit state qua notification:', remoteMessage);
        if (presentFloodToast(remoteMessage)) {
          setLastPushAt(Date.now());
          fetchUnreadCount();
        }
      });

    return unsubscribeOpenedApp;
  }, [presentFloodToast, fetchUnreadCount]);

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
