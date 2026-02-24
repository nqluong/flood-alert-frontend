// ---- Credentials ----
export interface LoginCredentials {
  email: string;
  password: string;
}

// ---- User ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  roles: string[];
  avatarUrl?: string;
  phoneNumber?: string;
  status?: string;
}

// ---- Auth state ----
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ---- App-level response shape ----
export interface AuthResult {
  success: true;
  session: AuthSession;
}

export interface AuthError {
  success: false;
  message: string;
}

export type AuthResponse = AuthResult | AuthError;

export interface ApiUserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
}

export interface ApiLoginData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userResponse: ApiUserResponse;
}

export interface ApiLoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: ApiLoginData;
  timestamp: string;
}
