import { apiFetch } from './apiClient';
import type { FloodEvent, Viewport, ReportPayload } from '../types/flood.types';

// Backend response format (snake_case)
interface FileUploadBackendResponse {
  upload_url: string;
  file_url: string;
  file_path: string;
  expires_in_minutes: number;
}

// Frontend format (camelCase)
export interface FileUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  filePath: string;
  expiresInMinutes: number;
}

export const floodService = {
  getNearbyFloods: (viewport: Viewport): Promise<FloodEvent[]> =>
    apiFetch<FloodEvent[]>(
      `/core/floods/active/nearby?lat=${viewport.centerLat}&lon=${viewport.centerLon}&radius=${viewport.radius}`,
    ),

  /**
   * Lấy signed URL để upload ảnh lên Firebase Storage
   * @param extension Đuôi file (jpg, png, etc.)
   */
  getUploadUrl: async (extension: string): Promise<FileUploadResponse> => {
    console.log('[FloodService] Getting upload URL for extension:', extension);
    try {
      const response = await apiFetch<FileUploadBackendResponse>(
        `/reports/upload-url?extension=${extension}`
      );
      console.log('[FloodService] Backend response:', JSON.stringify(response, null, 2));
      
      // Map snake_case to camelCase
      const mapped: FileUploadResponse = {
        uploadUrl: response.upload_url,
        fileUrl: response.file_url,
        filePath: response.file_path,
        expiresInMinutes: response.expires_in_minutes,
      };
      
      // Validate response
      if (!mapped.uploadUrl || !mapped.fileUrl) {
        throw new Error('Invalid response from server: missing uploadUrl or fileUrl');
      }
      
      console.log('[FloodService] Mapped response:', {
        hasUploadUrl: !!mapped.uploadUrl,
        hasFileUrl: !!mapped.fileUrl,
        expiresInMinutes: mapped.expiresInMinutes,
      });
      
      return mapped;
    } catch (error) {
      console.error('[FloodService] Failed to get upload URL:', error);
      throw error;
    }
  },

  /**
   * Gửi báo cáo ngập lụt
   * @param payload Thông tin báo cáo (bao gồm imageUrl đã upload)
   */
  submitReport: (payload: ReportPayload): Promise<void> =>
    apiFetch<void>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
