import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { notificationService } from '../services/notification.service';
import { storageService } from '../services/storage.service';

export interface UnreadNotificationsContextType {
  unreadCount: number;
  isLoading: boolean;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Kiểm tra authentication status
  const checkAuth = useCallback(async () => {
    const token = await storageService.getAccessToken();
    setIsAuthenticated(!!token);
    return !!token;
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    // Chỉ fetch khi đã authenticated
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
      
      // Nếu session expired, dừng polling và reset count
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        console.warn('[UnreadNotifications] Session expired, stopping polling');
        // Dừng polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setUnreadCount(0);
        setIsAuthenticated(false);
        // Không throw error để tránh crash app
        return;
      }
      
      // Các lỗi khác không reset count, chỉ log
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

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    console.log('[UnreadNotifications] Resetting context');
    setUnreadCount(0);
    setIsAuthenticated(false);
    stopPolling();
  }, [stopPolling]);

  // Polling logic - chỉ khi app active và đã authenticated
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Poll mỗi 2 phút khi app active
    intervalRef.current = setInterval(async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        fetchUnreadCount();
      } else {
        // Nếu không còn authenticated, dừng polling
        stopPolling();
      }
    }, 120000);
  }, [checkAuth, fetchUnreadCount, stopPolling]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const wasBackground = appStateRef.current === 'background';
      const isActive = nextAppState === 'active';
      
      appStateRef.current = nextAppState;

      if (isActive) {
        // Kiểm tra auth trước khi fetch
        const isAuth = await checkAuth();
        if (!isAuth) {
          console.log('[UnreadNotifications] Not authenticated, skipping refresh');
          return;
        }

        // App became active - refresh count and start polling
        if (wasBackground) {
          fetchUnreadCount();
        }
        startPolling();
      } else {
        // App went to background - stop polling to save battery
        stopPolling();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [checkAuth, fetchUnreadCount, startPolling, stopPolling]);

  // FCM foreground message listener
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('[UnreadNotifications] FCM foreground message:', remoteMessage);
      
      // Nếu là thông báo mới, tăng count
      if (remoteMessage.data?.type === 'flood_alert' || remoteMessage.data?.type === 'notification') {
        incrementCount();
      }
    });

    return unsubscribe;
  }, [incrementCount]);

  // Initial setup
  useEffect(() => {
    const init = async () => {
      // Kiểm tra auth trước
      const isAuth = await checkAuth();
      
      if (!isAuth) {
        console.log('[UnreadNotifications] Not authenticated, skipping initial load');
        setIsLoading(false);
        return;
      }

      // Load initial count
      await fetchUnreadCount();

      // Start polling if app is active
      if (AppState.currentState === 'active') {
        startPolling();
      }
    };

    init();

    return () => {
      stopPolling();
    };
  }, [checkAuth, fetchUnreadCount, startPolling, stopPolling]);

  const value: UnreadNotificationsContextType = {
    unreadCount,
    isLoading,
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
