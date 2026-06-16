import { memo, useState } from 'react';
import './FloodMarkers.css';
import './SensorPopup.css';
import { Marker, Tooltip, Circle, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Trash2 } from 'lucide-react';
import type { ActiveFloodEvent } from '../../../../types/flood.types';
import {
  SEVERITY_COLOR,
  SEVERITY_HALO,
  getSeverityLabel,
  getSeverityColor,
  createFloodMarkerIcon,
  createUserReportFloodMarkerIcon,
  createClusterIcon,
} from './constants';

interface FloodMarkersProps {
  floodList:    ActiveFloodEvent[];
  dismissingId: string | null;
  onDismiss:    (eventId: string) => void;
}

const FLOOD_DISABLE_CLUSTER_ZOOM = 15;

// Nội dung chung của Tooltip và Popup (Popup có thêm nút hành động)
function FloodInfoContent({
  flood,
  isUserReport,
  title,
  waterLevelText,
}: {
  flood: ActiveFloodEvent;
  isUserReport: boolean;
  title: string;
  waterLevelText: string | null;
}) {
  return (
    <>
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
          {isUserReport ? 'Cộng đồng' : 'Cảm biến'}
        </span>
        <span
          className="smap-popup__badge"
          style={{
            background: '#fef2f2',
            color: getSeverityColor(flood.severityLevel),
          }}
        >
          {getSeverityLabel(flood.severityLevel)}
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
    </>
  );
}

const FloodMarker = memo(function FloodMarker({
  flood,
  isDismissing,
  onDismiss,
}: {
  flood: ActiveFloodEvent;
  isDismissing: boolean;
  onDismiss: (eventId: string) => void;
}) {
  const isUserReport = flood.source === 'USER_REPORT';
  const icon = isUserReport
    ? createUserReportFloodMarkerIcon(flood.severityLevel)
    : createFloodMarkerIcon(flood.severityLevel);
  const title = flood.location?.trim()
    || `${flood.lat.toFixed(4)}, ${flood.lon.toFixed(4)}`;
  const waterLevelText = flood.waterLevel != null
    ? `~${Math.round(flood.waterLevel)} cm`
    : null;
  return (
    <Marker
      position={[flood.lat, flood.lon]}
      icon={icon}
      alt={flood.severityLevel}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={1} className="smap-popup-wrap">
        <div className="smap-popup">
          <FloodInfoContent
            flood={flood}
            isUserReport={isUserReport}
            title={title}
            waterLevelText={waterLevelText}
          />
        </div>
      </Tooltip>
      <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
        <div className="smap-popup">
          <FloodInfoContent
            flood={flood}
            isUserReport={isUserReport}
            title={title}
            waterLevelText={waterLevelText}
          />
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
});

export default memo(function FloodMarkers({ floodList, dismissingId, onDismiss }: FloodMarkersProps) {
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });
  const [zoom, setZoom] = useState(() => map.getZoom());
  const showHalo = zoom >= FLOOD_DISABLE_CLUSTER_ZOOM;

  return (
    <>
      {showHalo && floodList.map((flood) => {
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
        disableClusteringAtZoom={FLOOD_DISABLE_CLUSTER_ZOOM}
        spiderfyOnMaxZoom
        zoomToBoundsOnClick
      >
        {floodList.map((flood) => (
          <FloodMarker
            key={flood.eventId}
            flood={flood}
            isDismissing={dismissingId === flood.eventId}
            onDismiss={onDismiss}
          />
        ))}
      </MarkerClusterGroup>
    </>
  );
});
