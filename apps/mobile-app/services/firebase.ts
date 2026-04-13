import storage from '@react-native-firebase/storage';

/**
 * Upload ảnh từ local URI lên Firebase Storage.
 * @param uri  Local image URI (từ expo-image-picker hoặc camera)
 * @returns    Download URL công khai của ảnh trên Firebase
 */
export async function uploadReportImage(uri: string): Promise<string> {
  const filename = `flood-reports/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

  const reference = storage().ref(filename);

  await reference.putFile(uri);

  const downloadUrl = await reference.getDownloadURL();
  return downloadUrl;
}
