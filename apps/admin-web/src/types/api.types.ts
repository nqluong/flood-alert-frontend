/**
 * Cấu trúc response chuẩn từ tất cả API (thành công lẫn thất bại).
 * Tương ứng với class ApiResponse<T> ở phía backend.
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string | null;
  data: T;
  timestamp: string;
}

/**
 * Cấu trúc lỗi chuẩn trả về từ API Gateway.
 *
 * Áp dụng cho: 401 / 403 / 404 / 500 / 503 / 504 ...
 */
export interface GatewayErrorResponse {
  success: false;
  code: number;
  message: string;
  details: string | null;
  path: string;
  timestamp: string;
  validationErrors: Record<string, string> | null;
}
