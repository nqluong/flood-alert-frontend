const PHOTON_BASE_URL = 'https://photon.komoot.io/api';

const VIETNAM_BBOX: [number, number, number, number] = [102.14, 8.18, 109.46, 23.39];

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  place_type: string[];
  text: string;
}

function resolveDisplayName(props: any): { text: string; place_name: string } {
  const addressLine =
    props.housenumber && props.street
      ? `${props.housenumber} ${props.street}`
      : props.street || undefined;

  // Title: ưu tiên tên địa điểm, fallback về địa chỉ đường
  const text = props.name || addressLine || '';

  // Subtitle: chuỗi đầy đủ, bỏ trùng lặp
  const rawParts = [props.name, addressLine, props.district || props.city, props.state, props.country];
  const seen = new Set<string>();
  const parts = rawParts.filter((p): p is string => {
    if (!p) return false;
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });

  return {
    text,
    place_name: parts.join(', ') || text,
  };
}

function resolvePlaceType(props: any): string[] {
  const osmKey = props.osm_key || '';
  const osmValue = props.osm_value || '';
  const type = props.type || '';

  if (['amenity', 'shop', 'tourism', 'leisure', 'office'].includes(osmKey)) return ['poi'];
  if (type === 'house' || osmKey === 'address' || osmValue === 'house') return ['address'];
  if (osmKey === 'place' || ['city', 'town', 'village', 'suburb'].includes(type)) return ['place'];
  if (osmKey === 'boundary' || ['county', 'state', 'country'].includes(type)) return ['region'];
  return ['place'];
}

function mapPhotonFeature(feature: any, index: number): GeocodingResult {
  const props = feature.properties || {};
  const [lon, lat] = feature.geometry.coordinates;
  const osmType = String(props.osm_type || '').toLowerCase();
  const typePrefix = osmType === 'n' ? 'node' : osmType === 'w' ? 'way' : 'relation';
  const { text, place_name } = resolveDisplayName(props);

  return {
    id: `${typePrefix}_${props.osm_id ?? index}`,
    text: text || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    place_name: place_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    center: [lon, lat],
    place_type: resolvePlaceType(props),
  };
}

export const geocodingService = {
  async search(
    query: string,
    options?: {
      proximity?: [number, number]; // [lon, lat]
      bbox?: [number, number, number, number];
      limit?: number;
    },
  ): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];

    const params = new URLSearchParams({
      q: query,
      limit: String(options?.limit ?? 5),
      lang: 'en',
    });

    if (options?.proximity) {
      params.append('lon', String(options.proximity[0]));
      params.append('lat', String(options.proximity[1]));
    }

    const bbox = options?.bbox ?? VIETNAM_BBOX;
    params.append('bbox', bbox.join(','));

    try {
      const response = await fetch(`${PHOTON_BASE_URL}?${params.toString()}`);
      if (!response.ok) throw new Error(`Photon API error: ${response.status}`);
      const data = await response.json();
      return (data.features ?? []).map(mapPhotonFeature);
    } catch (error) {
      console.error('Geocoding search error:', error);
      return [];
    }
  },

  async reverse(lon: number, lat: number): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `${PHOTON_BASE_URL}/reverse?lon=${lon}&lat=${lat}&lang=en`,
      );
      if (!response.ok) throw new Error(`Reverse geocoding error: ${response.status}`);
      const data = await response.json();
      const features = data.features ?? [];
      if (!features[0]) return null;
      return mapPhotonFeature(features[0], 0);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },
};
