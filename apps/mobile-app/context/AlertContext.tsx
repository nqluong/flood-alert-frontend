import React, { createContext, useContext, useState, useCallback } from 'react';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

export type AlertType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

export type AlertConfig = {
  type: AlertType;
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type AlertContextType = {
  show: (config: AlertConfig) => void;
  hide: () => void;
  visible: boolean;
  config: AlertConfig | null;
};

const AlertContext = createContext<AlertContextType>({
  show: () => {},
  hide: () => {},
  visible: false,
  config: null,
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const show = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ show, hide, visible, config }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
