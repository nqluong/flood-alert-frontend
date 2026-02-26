import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---- Fix default Leaflet icon (Vite static asset issue) ----
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PIN_ICON = L.divIcon({
  className: '',
  html: `<div class="lp-pin"></div>`,
  iconSize:   [24, 36],
  iconAnchor: [12, 36],
});

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange(
        Math.round(lat * 1e6) / 1e6,
        Math.round(lng * 1e6) / 1e6,
      );
    },
  });
  return null;
}

function FlyTo({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (lat === null || lon === null) return;
    const prev = prevRef.current;
    // Only fly when position actually changes
    if (prev && prev.lat === lat && prev.lon === lon) return;
    prevRef.current = { lat, lon };
    map.flyTo([lat, lon], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [lat, lon, map]);

  return null;
}

// ---- Public component ----

interface LocationPickerProps {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}

// Default center: Hà Nội
const DEFAULT_CENTER: [number, number] = [21.0278, 105.8342];
const DEFAULT_ZOOM = 11;

export default function LocationPicker({ lat, lon, onChange }: LocationPickerProps) {
  const hasPosition = lat !== null && lon !== null;

  return (
    <div className="lp-wrap">
      <p className="lp-hint">
        Click lên bản đồ để chọn vị trí đặt cảm biến.
        {hasPosition && (
          <span className="lp-hint__coords">
            {' '}Đã chọn: {lat}, {lon}
          </span>
        )}
      </p>

      <MapContainer
        center={hasPosition ? [lat!, lon!] : DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="lp-map"
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onChange={onChange} />
        <FlyTo lat={lat} lon={lon} />

        {hasPosition && (
          <Marker
            position={[lat!, lon!]}
            icon={PIN_ICON}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat: la, lng: lo } = (e.target as L.Marker).getLatLng();
                onChange(
                  Math.round(la * 1e6) / 1e6,
                  Math.round(lo * 1e6) / 1e6,
                );
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
