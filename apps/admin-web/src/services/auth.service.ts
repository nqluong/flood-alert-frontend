import type {
  LoginCredentials,
  AuthResponse,
  AuthSession,
  ApiLoginResponse,
} from '../types/auth.types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/api/v1';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): void;
}

export const authService: IAuthService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    let apiRes: Response;

    try {
      apiRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });
    } catch {
      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      };
    }

    let body: ApiLoginResponse;
    try {
      body = (await apiRes.json()) as ApiLoginResponse;
    } catch {
      return { success: false, message: 'Phản hồi từ máy chủ không hợp lệ.' };
    }

    if (!apiRes.ok || !body.success) {
      return {
        success: false,
        message: body.message ?? 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
      };
    }

    const { accessToken, refreshToken, userResponse } = body.data;

    const isAdmin = userResponse.roles.includes('ADMIN');
    if (!isAdmin) {
      return {
        success: false,
        message:
          'Tài khoản của bạn không có quyền truy cập vào trang quản trị. Vui lòng liên hệ quản trị viên.',
      };
    }

    const session: AuthSession = {
      user: {
        id: userResponse.id,
        name: userResponse.fullName,
        email: userResponse.email,
        role: 'admin',
        roles: userResponse.roles,
        avatarUrl: userResponse.avatarUrl ?? undefined,
        phoneNumber: userResponse.phoneNumber,
        status: userResponse.status,
      },
      accessToken,
      refreshToken,
    };

    // Lưu tokens vào localStorage
    localStorage.setItem('fg_access_token', accessToken);
    localStorage.setItem('fg_refresh_token', refreshToken);
    localStorage.setItem('fg_session', JSON.stringify(session));

    return { success: true, session };
  },

  logout(): void {
    localStorage.removeItem('fg_session');
    localStorage.removeItem('fg_remember');
    localStorage.removeItem('fg_access_token');
    localStorage.removeItem('fg_refresh_token');
  },
};
