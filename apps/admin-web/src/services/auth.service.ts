import type { LoginCredentials, AuthResponse, AuthSession } from '../types/auth.types';

const DEMO_EMAIL    = import.meta.env.VITE_DEMO_EMAIL    as string;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string;

const MOCK_SESSION: AuthSession = {
  user: {
    id: '1',
    name: 'Nguyễn Văn A',
    email: DEMO_EMAIL,
    role: 'admin',
    avatarUrl: 'https://www.figma.com/api/mcp/asset/fda90483-6c15-4304-bbaf-5aa1c8f6b7f7',
  },
  accessToken: 'mock-jwt-token',
};

// ---- Interface ----
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): void;
}

// ---- Implementation ----
export const authService: IAuthService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Giả lập độ trễ mạng
    await simulateApiCall(600);

    const emailMatch    = credentials.email.trim().toLowerCase() === DEMO_EMAIL?.toLowerCase();
    const passwordMatch = credentials.password === DEMO_PASSWORD;

    if (emailMatch && passwordMatch) {
      return { success: true, session: MOCK_SESSION };
    }

    return { success: false, message: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' };
  },

  logout(): void {
    localStorage.removeItem('fg_session');
    localStorage.removeItem('fg_remember');
  },
};

// ---- Helpers ----
function simulateApiCall(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
