import { Platform } from 'react-native';

export const APP_CONFIG = {
    APP_NAME: "FloodAlert",
    
    API_TIMEOUT: 10000, 
};

export const getBaseUrl = () => {
    // Nếu đang chạy ở môi trường Development
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return "http://10.0.2.2:8080/api/v1"; 
        }
        
        return "http://localhost:8080/api/v1";
    }

    return "https://api.floodalert.com/api/v1";
};