import { useEffect, useRef, useState } from 'react';
import './SensorMap.css';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type {
  ActiveFloodEvent,
  ProcessedSensorData,
  SensorMapItem,
  SeverityLevel,
} from '../../../../types/flood.types';
import type { WsStatus } from '../../hooks/useFloodWebSocket';

//  Màu sắc & nhãn theo mức độ 
const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  SAFE:    '#22c55e',
  WARNING: '#f59e0b',
  DANGER:  '#ef4444',
  UNKNOWN: '#6b7280',
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  SAFE:    'Bình thường',
  WARNING: 'Cảnh báo',
  DANGER:  'Nguy hiểm',
  UNKNOWN: 'Không xác định',
};

const SEVERITY_PRIORITY: Record<SeverityLevel, number> = {
  UNKNOWN: 0, SAFE: 1, WARNING: 2, DANGER: 3,
};

const SEVERITY_HALO: Partial<Record<SeverityLevel, { radius: number; fillOpacity: number }>> = {
  WARNING: { radius: 50,  fillOpacity: 0.18 },
  DANGER:  { radius: 150, fillOpacity: 0.22 },
};

const STATUS_SENSOR_COLOR: Record<string, string> = {
  NORMAL:   '#22c55e',
  ACTIVE:   '#22c55e',
  WARNING:  '#f59e0b',
  DANGER:   '#ef4444',
  INACTIVE: '#6b7280',
};


//  Icon helpers 
function createFloodMarkerIcon(severity: SeverityLevel) {
  const color = SEVERITY_COLOR[severity];
  return L.divIcon({
    className: '',
    html: `<span class="flood-marker" style="background:${color};border-color:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createSensorIcon(status: string) {
  const color = STATUS_SENSOR_COLOR[status] ?? '#6b7280';
  return L.divIcon({
    className: '',
    html: `<span class="sensor-marker" style="background:${color};border-color:${color}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createSensorClusterIcon(cluster: any): L.DivIcon {
  const count: number = cluster.getChildCount();
  return L.divIcon({
    className: '',
    html: `<span class="sensor-cluster">${count}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createClusterIcon(cluster: any): L.DivIcon {
  const children: any[] = cluster.getAllChildMarkers();
  let maxPriority = 0;
  let maxSeverity: SeverityLevel = 'SAFE';
  for (const m of children) {
    const sev = (m.options?.alt ?? 'SAFE') as SeverityLevel;
    if (SEVERITY_PRIORITY[sev] > maxPriority) {
      maxPriority = SEVERITY_PRIORITY[sev];
      maxSeverity = sev;
    }
  }
  const color = SEVERITY_COLOR[maxSeverity];
  const count: number = cluster.getChildCount();
  return L.divIcon({
    className: '',
    html: `<span class="flood-cluster" style="background:${color};border-color:${color}">${count}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

//  Nút fullscreen 
function FullscreenControl({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setTimeout(() => map.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [map]);

  const toggle = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => null);
    else document.exitFullscreen().catch(() => null);
  };

  return (
    <button className="sensor-map__fullscreen-btn" title={isFullscreen ? 'Thu nhỏ' : 'Phóng to bản đồ'} onClick={toggle}>
      {isFullscreen ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
          <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/>
          <path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
        </svg>
      )}
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="sensor-map__legend-item">
      <span className="sensor-map__legend-dot" style={{ background: color }} />
      {label}
    </div>
  );
}

//  Types 
interface SensorMapProps {
  activeFloods:   Record<string, ActiveFloodEvent>;
  sensors:        Record<string, ProcessedSensorData>;
  sensorMarkers:  SensorMapItem[];
  loading:        boolean;
  apiError:       string | null;
  wsStatus:       WsStatus;
  wsError:        string | null;
  onClearWsError: () => void;
}

//  Component chính 
export default function SensorMap({
  activeFloods,
  sensors,
  sensorMarkers,
  loading,
  apiError,
  wsStatus,
  wsError,
  onClearWsError,
}: SensorMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  //  Dữ liệu render 
  const floodList  = Object.values(activeFloods);

  // Cảm biến có telemetry real-time (loại trừ vị trí trùng điểm ngập)
  const sensorList = Object.values(sensors).filter(
    (s) => !floodList.some((f) => f.lat === s.lat && f.lon === s.lon),
  );

  // Cảm biến tĩnh từ API /sensors/map chưa có telemetry
  const telemetrySensorIds = new Set(Object.keys(sensors));
  const staticMarkers = sensorMarkers.filter((m) => !telemetrySensorIds.has(m.sensorId));

  const totalSensorCount = sensorMarkers.length || sensorList.length;
  const counts: Record<SeverityLevel, number> = {
    SAFE:    floodList.filter(f => f.severityLevel === 'SAFE').length,
    WARNING: floodList.filter(f => f.severityLevel === 'WARNING').length,
    DANGER:  floodList.filter(f => f.severityLevel === 'DANGER').length,
    UNKNOWN: floodList.filter(f => f.severityLevel === 'UNKNOWN').length,
  };

  return (
    <div className="sensor-map">
      {/* Toast thông báo lỗi WebSocket */}
      {wsError && (
        <div className="sensor-map__ws-toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{wsError}</span>
          <button className="sensor-map__ws-toast-close" onClick={onClearWsError}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="sensor-map__header">
        <div className="sensor-map__header-left">
          <h2 className="sensor-map__title">Bản đồ giám sát lũ lụt thời gian thực</h2>

          {loading && <span className="sensor-map__badge sensor-map__badge--loading">Đang tải…</span>}

          {/* Trạng thái WebSocket */}
          {!loading && (
            <span className={`sensor-map__badge ${
              wsStatus === 'connected'   ? 'sensor-map__badge--ws-on'  :
              wsStatus === 'connecting'  ? 'sensor-map__badge--loading' :
                                          'sensor-map__badge--ws-off'
            }`}>
              {wsStatus === 'connected'  ? '● Live' :
               wsStatus === 'connecting' ? '◌ Đang kết nối…' : '○ Offline'}
            </span>
          )}

          {!loading && !apiError && (
            <span className="sensor-map__badge sensor-map__badge--count">{floodList.length} điểm ngập</span>
          )}
          {totalSensorCount > 0 && (
            <span className="sensor-map__badge sensor-map__badge--sensor">{totalSensorCount} cảm biến</span>
          )}
        </div>

        <div className="sensor-map__legend">
          {(Object.keys(counts) as SeverityLevel[]).map(sev =>
            counts[sev] > 0 && (
              <LegendItem key={sev} color={SEVERITY_COLOR[sev]} label={`${SEVERITY_LABEL[sev]} (${counts[sev]})`} />
            )
          )}
        </div>
      </div>

      {/* Canvas bản đồ */}
      <div className="sensor-map__canvas" ref={canvasRef}>
        {apiError && (
          <div className="sensor-map__error"><span>⚠ {apiError}</span></div>
        )}

        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          zoomControl
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FullscreenControl containerRef={canvasRef} />

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
                  color, fillColor: color,
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
                    <span className="sensor-map__tooltip-status" style={{ color: SEVERITY_COLOR[flood.severityLevel] }}>
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

          {/* Cluster cảm biến: telemetry real-time + tĩnh từ /sensors/map */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createSensorClusterIcon}
            showCoverageOnHover={false}
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            zoomToBoundsOnClick
          >
            {sensorList.map((sensor) => (
              <Marker
                key={sensor.sensorId}
                position={[sensor.lat, sensor.lon]}
                icon={createSensorIcon(sensor.status)}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
                  <div className="sensor-map__tooltip">
                    <strong>📡 {sensor.sensorId}</strong>
                    <span>Mực nước: {sensor.waterLevel.toFixed(2)} cm</span>
                    <span>Trạng thái: {sensor.status}</span>
                    {sensor.recordedAt && (
                      <span style={{ color: '#9ca3af', fontSize: 10 }}>
                        {new Date(sensor.recordedAt).toLocaleTimeString('vi-VN')}
                      </span>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            ))}

            {staticMarkers.map((sensor) => (
              <Marker
                key={`map-${sensor.sensorId}`}
                position={[sensor.lat, sensor.lon]}
                icon={createSensorIcon(sensor.status)}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
                  <div className="sensor-map__tooltip">
                    <strong>📡 {sensor.sensorId}</strong>
                    <span>{sensor.name}</span>
                    <span>Trạng thái: {sensor.status}</span>
                    <span>Pin: {sensor.batteryLevel}%</span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
