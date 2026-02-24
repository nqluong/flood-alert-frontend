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
  avatarUrl?: string;
}

// ---- Auth state ----
export interface AuthSession {
  user: User;
  accessToken: string;
}

// ---- API response shape ----
export interface AuthResult {
  success: true;
  session: AuthSession;
}

export interface AuthError {
  success: false;
  message: string;
}

export type AuthResponse = AuthResult | AuthError;
