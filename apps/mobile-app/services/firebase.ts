/**
 * Upload ảnh lên Firebase Storage thông qua Backend signed URL
 * 
 * Flow:
 * 1. Gọi Backend để lấy signed upload URL
 * 2. Upload file lên Firebase Storage qua signed URL
 * 3. Trả về public file URL để lưu vào report
 * 
 * @param uri Local image URI (từ expo-image-picker hoặc camera)
 * @param getUploadUrl Function để lấy signed URL từ Backend
 * @returns Public file URL để lưu vào database
 */
export async function uploadReportImage(
  uri: string,
  getUploadUrl: (extension: string) => Promise<{
    uploadUrl: string;
    fileUrl: string;
    filePath: string;
    expiresInMinutes: number;
  }>
): Promise<string> {
  try {
    console.log('[Firebase] Starting upload for:', uri);

    // 1. Lấy signed URL từ Backend
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    console.log('[Firebase] Getting upload URL for extension:', extension);
    
    const uploadData = await getUploadUrl(extension);
    console.log('[Firebase] Got upload data:', {
      hasUploadUrl: !!uploadData.uploadUrl,
      hasFileUrl: !!uploadData.fileUrl,
      uploadUrlPreview: uploadData.uploadUrl?.substring(0, 100),
    });

    if (!uploadData.uploadUrl || !uploadData.fileUrl) {
      throw new Error('Backend did not return valid upload URLs');
    }

    // 2. Đọc file từ local URI
    console.log('[Firebase] Fetching local file...');
    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error(`Failed to read local file: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('[Firebase] File blob size:', blob.size, 'bytes, type:', blob.type);

    // 3. Upload lên Firebase Storage qua signed URL
    console.log('[Firebase] Uploading to Firebase...');
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': blob.type || `image/${extension}`,
      },
      body: blob,
    });

    console.log('[Firebase] Upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[Firebase] Upload error response:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    console.log('[Firebase] Upload successful:', uploadData.fileUrl);

    // 4. Trả về public URL
    return uploadData.fileUrl;
  } catch (error) {
    console.error('[Firebase] Upload failed:', error);
    
    if (error instanceof Error) {
      // Network request failed thường do CORS hoặc URL không hợp lệ
      if (error.message.includes('Network request failed')) {
        throw new Error('Không thể kết nối đến Firebase Storage. Vui lòng kiểm tra kết nối mạng.');
      }
      throw error;
    }
    
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
  }
}
