import { getValidAccessToken } from './auth.service';
import { parseApiError } from './api.helpers';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/flood-alert/api/v1';

/**
 * Base API client với authentication tự động
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Tạo headers với authentication token
   */
  private async getHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const token = await getValidAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | string[]>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Xử lý array parameters (ví dụ: roles)
          if (Array.isArray(value)) {
            value.forEach(item => {
              url.searchParams.append(key, String(item));
            });
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) await parseApiError(response);

    return response.json();
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) await parseApiError(response);

    return response.json();
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) await parseApiError(response);

    return response.json();
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) await parseApiError(response);

    return response.json();
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) await parseApiError(response);

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
