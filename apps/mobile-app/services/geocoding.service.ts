const GOONG_BASE_URL = 'https://rsapi.goong.io';
const API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  place_type: string[];
  text: string;
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function mapGoongTypes(types: string[]): string[] {
  if (!types?.length) return ['place'];
  if (types.some((t) => ['street_address', 'route', 'premise'].includes(t))) return ['address'];
  if (types.some((t) => ['establishment', 'point_of_interest', 'food', 'store'].includes(t))) return ['poi'];
  if (types.some((t) => ['administrative_area_level_1', 'administrative_area_level_2', 'country'].includes(t))) return ['region'];
  return ['place'];
}

export const geocodingService = {
  async search(
    query: string,
    options?: {
      proximity?: [number, number]; // [lon, lat]
      limit?: number;
    },
  ): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];

    const params = new URLSearchParams({
      input: query,
      api_key: API_KEY,
    });

    if (options?.proximity) {
      params.append('location', `${options.proximity[1]},${options.proximity[0]}`);
      params.append('radius', '50000');
    }

    try {
      const res = await fetchWithTimeout(`${GOONG_BASE_URL}/place/autoComplete?${params}`);
      if (!res.ok) throw new Error(`Goong AutoComplete error: ${res.status}`);
      const data = await res.json();
      const predictions: any[] = data.predictions ?? [];

      return predictions.slice(0, options?.limit ?? 5).map((p: any) => ({
        id: p.place_id,
        text: p.structured_formatting?.main_text || p.description || '',
        place_name: p.description || p.structured_formatting?.main_text || '',
        center: [0, 0] as [number, number],
        place_type: mapGoongTypes(p.types ?? []),
      }));
    } catch (error) {
      console.error('Geocoding search error:', error);
      return [];
    }
  },

  async getDetail(placeId: string): Promise<GeocodingResult | null> {
    try {
      const res = await fetchWithTimeout(
        `${GOONG_BASE_URL}/place/detail?place_id=${placeId}&api_key=${API_KEY}`,
      );
      if (!res.ok) throw new Error(`Goong Place Detail error: ${res.status}`);
      const data = await res.json();
      const r = data.result;
      if (!r) return null;

      const lat = r.geometry?.location?.lat ?? 0;
      const lng = r.geometry?.location?.lng ?? 0;

      return {
        id: placeId,
        text: r.name || r.formatted_address || '',
        place_name: r.formatted_address || r.name || '',
        center: [lng, lat],
        place_type: mapGoongTypes(r.types ?? []),
      };
    } catch (error) {
      console.error('Goong Place Detail error:', error);
      return null;
    }
  },

  async reverse(lon: number, lat: number): Promise<GeocodingResult | null> {
    try {
      const res = await fetchWithTimeout(
        `${GOONG_BASE_URL}/geocode?latlng=${lat},${lon}&api_key=${API_KEY}`,
      );
      if (!res.ok) throw new Error(`Goong Reverse Geocode error: ${res.status}`);
      const data = await res.json();
      const results: any[] = data.results ?? [];
      if (!results[0]) return null;

      const r = results[0];
      const location = r.geometry?.location;

      return {
        id: r.place_id || `reverse_${lat}_${lon}`,
        text: r.name || r.formatted_address || '',
        place_name: r.formatted_address || '',
        center: [location?.lng ?? lon, location?.lat ?? lat],
        place_type: mapGoongTypes(r.types ?? []),
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },
};
