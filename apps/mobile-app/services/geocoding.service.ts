const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const GEOCODING_BASE_URL = 'https://api.maptiler.com/geocoding';

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  place_type: string[];
  text: string;
  context?: Array<{ id: string; text: string }>;
}

export interface GeocodingResponse {
  features: GeocodingResult[];
}

export const geocodingService = {
  /**
   * Tìm kiếm địa điểm theo text
   * @param query - Từ khóa tìm kiếm
   * @param options - Tùy chọn tìm kiếm
   */
  async search(
    query: string,
    options?: {
      proximity?: [number, number]; // [lon, lat] - ưu tiên kết quả gần vị trí này
      bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
      limit?: number;
      language?: string;
    },
  ): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];

    const params = new URLSearchParams({
      key: MAPTILER_KEY || '',
      country: 'VN',
      limit: String(options?.limit || 5),
      language: options?.language || 'vi',
    });

    if (options?.proximity) {
      params.append('proximity', options.proximity.join(','));
    }

    if (options?.bbox) {
      params.append('bbox', options.bbox.join(','));
    }

    try {
      const response = await fetch(`${GEOCODING_BASE_URL}/${encodeURIComponent(query)}.json?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: GeocodingResponse = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Geocoding search error:', error);
      return [];
    }
  },

  /**
   * Reverse geocoding - lấy địa chỉ từ tọa độ
   * @param lon - Kinh độ
   * @param lat - Vĩ độ
   */
  async reverse(lon: number, lat: number): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        key: MAPTILER_KEY || '',
        language: 'vi',
      });

      const response = await fetch(
        `${GEOCODING_BASE_URL}/${lon},${lat}.json?${params}`,
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data: GeocodingResponse = await response.json();
      return data.features[0] || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },
};
