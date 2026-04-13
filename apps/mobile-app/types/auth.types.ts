export interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface SocialLoginRequest {
  idToken: string;
  provider: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userResponse: UserResponse;
}

export interface RefreshData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userResponse?: UserResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export type LoginApiResponse = ApiResponse<LoginData>;
