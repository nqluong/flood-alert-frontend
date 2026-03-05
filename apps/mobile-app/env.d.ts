/// <reference types="expo/types" />

// Khai báo kiểu cho các biến môi trường EXPO_PUBLIC_*
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL: string;
    readonly EXPO_PUBLIC_API_URL_ANDROID: string;
  }
}
