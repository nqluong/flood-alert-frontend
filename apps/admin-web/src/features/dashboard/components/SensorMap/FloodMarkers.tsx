import './FloodMarkers.css';
import './SensorPopup.css';
import { Marker, Tooltip, Circle, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Trash2 } from 'lucide-react';
import type { ActiveFloodEvent } from '../../../../types/flood.types';
import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  SEVERITY_HALO,
  createFloodMarkerIcon,
  createUserReportFloodMarkerIcon,
  createClusterIcon,
} from './constants';

interface FloodMarkersProps {
  floodList:    ActiveFloodEvent[];
  dismissingId: string | null;
  onDismiss:    (eventId: string) => void;
}

export default function FloodMarkers({ floodList, dismissingId, onDismiss }: FloodMarkersProps) {
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
        {floodList.map((flood) => {
          const isUserReport = flood.source === 'USER_REPORT';
          const icon = isUserReport
            ? createUserReportFloodMarkerIcon(flood.severityLevel)
            : createFloodMarkerIcon(flood.severityLevel);
          const title = flood.location?.trim()
            || `${flood.lat.toFixed(4)}, ${flood.lon.toFixed(4)}`;
          const waterLevelText = flood.waterLevel != null
            ? `~${Math.round(flood.waterLevel)} cm`
            : null;
          const isDismissing = dismissingId === flood.eventId;
          return (
            <Marker
              key={flood.eventId}
              position={[flood.lat, flood.lon]}
              icon={icon}
              alt={flood.severityLevel}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div className="sensor-map__tooltip">
                  <strong>{title}</strong>
                  <span
                    className="sensor-map__tooltip-source"
                    style={{ color: isUserReport ? '#7c3aed' : '#2563eb', fontSize: 11 }}
                  >
                    {isUserReport ? '👤 Báo cáo cộng đồng' : '📡 Cảm biến IoT'}
                  </span>
                  {!isUserReport && (
                    <span>Mực nước: {waterLevelText ?? 'Chưa có dữ liệu'}</span>
                  )}
                  <span
                    className="sensor-map__tooltip-status"
                    style={{ color: SEVERITY_COLOR[flood.severityLevel] }}
                  >
                    {SEVERITY_LABEL[flood.severityLevel]}
                  </span>
                  {flood.updatedAt && (
                    <span style={{ color: '#9ca3af', fontSize: 10 }}>
                      {new Date(flood.updatedAt).toLocaleTimeString('vi-VN')}
                    </span>
                  )}
                </div>
              </Tooltip>
              <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
                <div className="smap-popup">
                  <div className="smap-popup__head">
                    <span className="smap-popup__name">{title}</span>
                    <code className="smap-popup__sid">{flood.eventId}</code>
                  </div>
                  <div className="smap-popup__meta">
                    <span
                      className="smap-popup__badge"
                      style={{
                        background: isUserReport ? '#f3e8ff' : '#eff6ff',
                        color: isUserReport ? '#7c3aed' : '#2563eb',
                      }}
                    >
                      {isUserReport ? '👤 Cộng đồng' : '📡 Cảm biến'}
                    </span>
                    <span
                      className="smap-popup__badge"
                      style={{
                        background: '#fef2f2',
                        color: SEVERITY_COLOR[flood.severityLevel] ?? '#374151',
                      }}
                    >
                      {SEVERITY_LABEL[flood.severityLevel] ?? flood.severityLevel}
                    </span>
                  </div>
                  {waterLevelText && (
                    <p className="smap-popup__time">Mực nước: {waterLevelText}</p>
                  )}
                  {flood.updatedAt && (
                    <p className="smap-popup__time">
                      {new Date(flood.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                  <div className="smap-popup__actions">
                    <button
                      className="smap-popup__action-btn smap-popup__action-btn--danger"
                      style={{ flex: 'none', width: '100%' }}
                      disabled={isDismissing}
                      onClick={() => onDismiss(flood.eventId)}
                      title="Xóa điểm ngập khỏi bản đồ"
                    >
                      <Trash2 size={13} />
                      <span>{isDismissing ? 'Đang xóa…' : 'Xóa điểm ngập'}</span>
                    </button>
                  </div>
                  {isDismissing && <span className="smap-popup__spin" />}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </>
  );
}
