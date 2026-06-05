import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export interface FloodToastData {
  id: string;
  title: string;
  body: string;
  notificationType: string;
}

interface FloodToastContextType {
  toast: FloodToastData | null;
  showFloodToast: (title: string, body: string, notificationType?: string) => void;
  dismissToast: () => void;
}

const FloodToastContext = createContext<FloodToastContextType>({
  toast: null,
  showFloodToast: () => {},
  dismissToast: () => {},
});

export function FloodToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<FloodToastData | null>(null);
  const counterRef = useRef(0);

  const showFloodToast = useCallback(
    (title: string, body: string, notificationType = 'FLOOD_ALERT') => {
      counterRef.current += 1;
      setToast({ id: String(counterRef.current), title, body, notificationType });
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <FloodToastContext.Provider value={{ toast, showFloodToast, dismissToast }}>
      {children}
    </FloodToastContext.Provider>
  );
}

export function useFloodToastContext() {
  return useContext(FloodToastContext);
}
