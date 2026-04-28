
interface GeocodingResult {
  address: string;
  district?: string;
  city?: string;
  country?: string;
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';

const geocodingCache = new Map<string, GeocodingResult>();

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeocodingResult> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      'accept-language': 'vi',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_API}?${params.toString()}`, {
      headers: {
        'User-Agent': 'FloodAlert-Admin/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    // Xử lý địa chỉ từ response
    const address = data.address || {};
    
    let formattedAddress = '';
    
    const parts = [
      address.road || address.street,
      address.suburb || address.neighbourhood || address.quarter,
      address.city_district || address.district || address.county,
      address.city || address.town || address.province,
    ].filter(Boolean);

    formattedAddress = parts.join(', ') || data.display_name || 'Không xác định';

    const result: GeocodingResult = {
      address: formattedAddress,
      district: address.city_district || address.district || address.county,
      city: address.city || address.town || address.province,
      country: address.country,
    };

    // Lưu vào cache
    geocodingCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Fallback: trả về tọa độ
    const fallback: GeocodingResult = {
      address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    };
    
    geocodingCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Batch reverse geocoding cho nhiều tọa độ
 * Thêm delay giữa các request để tránh rate limit
 */
export async function batchReverseGeocode(
  coordinates: Array<{ lat: number; lon: number }>,
  delayMs = 1000,
): Promise<GeocodingResult[]> {
  const results: GeocodingResult[] = [];

  for (const coord of coordinates) {
    const result = await reverseGeocode(coord.lat, coord.lon);
    results.push(result);

    // Delay để tránh rate limit (Nominatim yêu cầu tối đa 1 request/giây)
    if (coordinates.indexOf(coord) < coordinates.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
