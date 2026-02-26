import type { GatewayErrorResponse } from '../types/api.types';

/**
 * Lỗi có cấu trúc từ API (Gateway hoặc service).
 * Mang theo HTTP status code, details và validationErrors (nếu có).
 */
export class ApiError extends Error {
  readonly code: number;
  readonly details: string | null | undefined;
  readonly validationErrors: Record<string, string> | null | undefined;

  constructor(
    message: string,
    code: number,
    details?: string | null,
    validationErrors?: Record<string, string> | null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.validationErrors = validationErrors;
  }
}

export async function parseApiError(res: Response): Promise<never> {
  let body: GatewayErrorResponse | null = null;

  try {
    body = (await res.json()) as GatewayErrorResponse;
  } catch {
    // Body không phải JSON (HTML error page, mạng bị cắt...)
    throw new ApiError(`Lỗi ${res.status}`, res.status);
  }

  throw new ApiError(
    body.message ?? `Lỗi ${res.status}`,
    body.code   ?? res.status,
    body.details,
    body.validationErrors,
  );
}
