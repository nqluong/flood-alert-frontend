import axios from 'axios';
import { getBaseUrl, APP_CONFIG } from '../config';

const axiosClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    async (config) => {
        // Sau này bạn sẽ lấy Token từ AsyncStorage (Mobile) hoặc LocalStorage (Web)
        // const token = await storage.getItem('access_token');
        const token = null; // Tạm thời để null
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Xử lý lỗi tập trung (ví dụ: Token hết hạn -> Tự logout)
        if (error.response?.status === 401) {
            console.log("Token hết hạn, cần logout!");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;