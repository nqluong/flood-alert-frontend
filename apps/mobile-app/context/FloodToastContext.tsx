import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Bật LayoutAnimation trên Android để hiệu ứng đẩy/ẩn toast mượt.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface FloodToastData {
  id: string;
  title: string;
  body: string;
  notificationType: string;
}

/** Giới hạn số toast xếp chồng để không tràn màn hình khi có quá nhiều thông báo. */
const MAX_TOASTS = 3;

interface FloodToastContextType {
  toasts: FloodToastData[];
  showFloodToast: (title: string, body: string, notificationType?: string) => void;
  dismissToast: (id: string) => void;
}

const FloodToastContext = createContext<FloodToastContextType>({
  toasts: [],
  showFloodToast: () => {},
  dismissToast: () => {},
});

export function FloodToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<FloodToastData[]>([]);
  const counterRef = useRef(0);

  const showFloodToast = useCallback(
    (title: string, body: string, notificationType = 'FLOOD_ALERT') => {
      counterRef.current += 1;
      const next: FloodToastData = {
        id: String(counterRef.current),
        title,
        body,
        notificationType,
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setToasts((prev) => [next, ...prev].slice(0, MAX_TOASTS));
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <FloodToastContext.Provider value={{ toasts, showFloodToast, dismissToast }}>
      {children}
    </FloodToastContext.Provider>
  );
}

export function useFloodToastContext() {
  return useContext(FloodToastContext);
}
