import './FloodMarkers.css';
import { Marker, Tooltip, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { ActiveFloodEvent } from '../../../../types/flood.types';
import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  SEVERITY_HALO,
  createFloodMarkerIcon,
  createClusterIcon,
} from './constants';

interface FloodMarkersProps {
  floodList: ActiveFloodEvent[];
}

export default function FloodMarkers({ floodList }: FloodMarkersProps) {
  return (
    <>
      {/* Vòng tròn halo WARNING / DANGER */}
      {floodList.map((flood) => {
        const halo = SEVERITY_HALO[flood.severityLevel];
        if (!halo) return null;
        const color = SEVERITY_COLOR[flood.severityLevel];
        return (
          <Circle
            key={`halo-${flood.eventId}`}
            center={[flood.lat, flood.lon]}
            radius={halo.radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: halo.fillOpacity,
              weight: 1.5,
              opacity: halo.fillOpacity + 0.15,
            }}
          />
        );
      })}

      {/* Cluster + Marker điểm ngập */}
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={60}
        spiderfyOnMaxZoom
        zoomToBoundsOnClick
      >
        {floodList.map((flood) => (
          <Marker
            key={flood.eventId}
            position={[flood.lat, flood.lon]}
            icon={createFloodMarkerIcon(flood.severityLevel)}
            alt={flood.severityLevel}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="sensor-map__tooltip">
                <strong>{flood.eventId}</strong>
                {flood.location && <span>{flood.location}</span>}
                <span>Mực nước: {flood.waterLevel.toFixed(2)} cm</span>
                <span
                  className="sensor-map__tooltip-status"
                  style={{ color: SEVERITY_COLOR[flood.severityLevel] }}
                >
                  {SEVERITY_LABEL[flood.severityLevel]} — {flood.status}
                </span>
                {flood.updatedAt && (
                  <span style={{ color: '#9ca3af', fontSize: 10 }}>
                    {new Date(flood.updatedAt).toLocaleTimeString('vi-VN')}
                  </span>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  );
}
