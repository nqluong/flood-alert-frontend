import { useAlertContext } from '../context/AlertContext';

export interface PickedMedia {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
}

function getImagePicker(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-image-picker');
  } catch {
    return null;
  }
}

export function useMediaPicker() {
  const { show: showAlert } = useAlertContext();
  const ImagePicker = getImagePicker();

  const showUnsupported = () => {
    showAlert({
      type: 'error',
      title: 'Chưa hỗ trợ',
      message: 'Tính năng này yêu cầu build lại app. Chạy: npx expo run:android',
      buttons: [{ text: 'Đóng', style: 'cancel' }],
    });
  };

  const showPermissionDenied = (type: 'camera' | 'library') => {
    const name = type === 'camera' ? 'camera' : 'thư viện ảnh';
    showAlert({
      type: 'error',
      title: 'Quyền bị từ chối',
      message: `Bạn đã từ chối quyền ${name} vĩnh viễn. Vui lòng vào Cài đặt để cấp quyền thủ công.`,
      buttons: [{ text: 'Đóng', style: 'cancel' }],
    });
  };

  const takePicture = async (): Promise<PickedMedia | null> => {
    if (!ImagePicker) { showUnsupported(); return null; }

    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) showPermissionDenied('camera');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || result.assets.length === 0) return null;
    const { uri, width, height, mimeType } = result.assets[0];
    return { uri, width, height, mimeType: mimeType ?? undefined };
  };

  const pickFromLibrary = async (): Promise<PickedMedia | null> => {
    if (!ImagePicker) { showUnsupported(); return null; }

    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) showPermissionDenied('library');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || result.assets.length === 0) return null;
    const { uri, width, height, mimeType } = result.assets[0];
    return { uri, width, height, mimeType: mimeType ?? undefined };
  };

  const showSourcePicker = (onResult: (media: PickedMedia | null) => void) => {
    showAlert({
      type: 'info',
      title: 'Thêm ảnh',
      buttons: [
        {
          text: 'Chụp ảnh',
          style: 'default',
          onPress: async () => onResult(await takePicture()),
        },
        {
          text: 'Chọn từ thư viện',
          style: 'default',
          onPress: async () => onResult(await pickFromLibrary()),
        },
        {
          text: 'Huỷ',
          style: 'cancel',
          onPress: () => onResult(null),
        },
      ],
    });
  };

  return { showSourcePicker };
}
