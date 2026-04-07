import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

/**
 * Upload ảnh từ local URI lên Firebase Storage.
 * @param uri  Local image URI (từ expo-image-picker hoặc camera)
 * @returns    Download URL công khai của ảnh trên Firebase
 */
export async function uploadReportImage(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const filename = `flood-reports/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
