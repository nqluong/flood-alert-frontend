import { useAlertContext } from '../context/AlertContext';
import type { AlertButton } from '../context/AlertContext';

type AlertOptions = {
  extraButtons?: AlertButton[];
};

export function useAlert() {
  const { show } = useAlertContext();

  const showInfo = (title: string, message?: string, options?: AlertOptions) => {
    show({
      type: 'info',
      title,
      message,
      buttons: [...(options?.extraButtons ?? []), { text: 'OK', style: 'default' }],
    });
  };

  const showSuccess = (title: string, message?: string, onClose?: () => void) => {
    show({
      type: 'success',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onClose }],
    });
  };

  const showError = (title: string, message?: string, onClose?: () => void) => {
    show({
      type: 'error',
      title,
      message,
      buttons: [{ text: 'Đóng', style: 'cancel', onPress: onClose }],
    });
  };

  const showWarning = (title: string, message?: string, options?: AlertOptions) => {
    show({
      type: 'warning',
      title,
      message,
      buttons: [...(options?.extraButtons ?? []), { text: 'OK', style: 'default' }],
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string;
      destructive?: boolean;
    },
  ) => {
    show({
      type: 'confirm',
      title,
      message,
      buttons: [
        {
          text: options?.cancelLabel ?? 'Huỷ',
          style: 'cancel',
          onPress: options?.onCancel,
        },
        {
          text: options?.confirmLabel ?? 'Xác nhận',
          style: options?.destructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ],
    });
  };

  return { showInfo, showSuccess, showError, showWarning, showConfirm };
}
