/// <reference types="expo/types" />

// Khai báo kiểu cho các biến môi trường EXPO_PUBLIC_*
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL: string;
    readonly EXPO_PUBLIC_API_URL_ANDROID: string;
    readonly EXPO_PUBLIC_FIREBASE_API_KEY: string;
    readonly EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    readonly EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
    readonly EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    readonly EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly EXPO_PUBLIC_FIREBASE_APP_ID: string;
    readonly EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
  }
}
