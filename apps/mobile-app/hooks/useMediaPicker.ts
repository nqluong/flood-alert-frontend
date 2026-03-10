import { Alert, ActionSheetIOS, Platform } from 'react-native';

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

/**
 * Xin quyền camera, trả về true nếu được cấp.
 */
async function requestCameraPermission(): Promise<boolean> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) return false;
  const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) {
    Alert.alert(
      'Quyền bị từ chối',
      'Bạn đã từ chối quyền camera vĩnh viễn. Vui lòng vào Cài đặt để cấp quyền thủ công.',
    );
  }
  return false;
}

/**
 * Xin quyền thư viện ảnh, trả về true nếu được cấp.
 */
async function requestLibraryPermission(): Promise<boolean> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) return false;
  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) {
    Alert.alert(
      'Quyền bị từ chối',
      'Bạn đã từ chối quyền thư viện ảnh vĩnh viễn. Vui lòng vào Cài đặt để cấp quyền thủ công.',
    );
  }
  return false;
}

/**
 * Mở camera để chụp ảnh. Trả về PickedMedia hoặc null nếu huỷ / từ chối quyền.
 */
async function takePhoto(): Promise<PickedMedia | null> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) {
    Alert.alert('Chưa hỗ trợ', 'Tính năng này yêu cầu build lại app. Chạy: npx expo run:android');
    return null;
  }
  const granted = await requestCameraPermission();
  if (!granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width, height: asset.height, mimeType: asset.mimeType ?? undefined };
}

/**
 * Mở thư viện ảnh để chọn. Trả về PickedMedia hoặc null nếu huỷ / từ chối quyền.
 */
async function pickFromLibrary(): Promise<PickedMedia | null> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) {
    Alert.alert('Chưa hỗ trợ', 'Tính năng này yêu cầu build lại app. Chạy: npx expo run:android');
    return null;
  }
  const granted = await requestLibraryPermission();
  if (!granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width, height: asset.height, mimeType: asset.mimeType ?? undefined };
}

export function showMediaPickerSheet(onResult: (media: PickedMedia | null) => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Huỷ', 'Chụp ảnh', 'Chọn từ thư viện'],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) onResult(await takePhoto());
        else if (buttonIndex === 2) onResult(await pickFromLibrary());
      },
    );
  } else {
    Alert.alert('Thêm ảnh', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh', onPress: async () => onResult(await takePhoto()) },
      { text: 'Chọn từ thư viện', onPress: async () => onResult(await pickFromLibrary()) },
      { text: 'Huỷ', style: 'cancel', onPress: () => onResult(null) },
    ]);
  }
}
