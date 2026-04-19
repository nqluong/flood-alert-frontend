import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { authService } from '../services/auth.service';
import auth from '@react-native-firebase/auth';

export const useSocialAuth = () => {
  const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  const [isLoading, setIsLoading] = useState(false);

  // Cấu hình GoogleSignin khi hook khởi tạo
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Google Native Login
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('Không lấy được Google ID Token');

      // Đăng nhập Firebase với Google credential
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);

      // Lấy Firebase Token từ User vừa đăng nhập thành công
      const firebaseIdToken = await userCredential.user.getIdToken(true);

      if (!firebaseIdToken) throw new Error('Không lấy được Firebase ID Token');

      // Gọi API Backend
      const loginData = await authService.verifyFirebaseToken({
        idToken: firebaseIdToken,
        provider: 'google',
      });

      return loginData;
    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED' || error.code === '-5') return null;
      Alert.alert('Lỗi', error.message || 'Đăng nhập Google thất bại');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!LoginManager) {
      Alert.alert('Lỗi hệ thống', 'Facebook SDK chưa được khởi tạo');
      return null;
    }
    setIsLoading(true);
    try {
      // Facebook Native Login
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) return null;

      const fbAccessToken = await AccessToken.getCurrentAccessToken();
      if (!fbAccessToken) throw new Error('Không lấy được FB Access Token');

      // Đăng nhập Firebase với Facebook credential
      const facebookCredential = auth.FacebookAuthProvider.credential(fbAccessToken.accessToken);
      const userCredential = await auth().signInWithCredential(facebookCredential);

      // Lấy Firebase Token mới nhất
      const firebaseIdToken = await userCredential.user.getIdToken(true);
      if (!firebaseIdToken) throw new Error('Không lấy được Firebase ID Token');

      const loginData = await authService.verifyFirebaseToken({
        idToken: firebaseIdToken,
        provider: 'facebook',
      });

      return loginData;
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng nhập Facebook thất bại');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleGoogleLogin, handleFacebookLogin };
};
