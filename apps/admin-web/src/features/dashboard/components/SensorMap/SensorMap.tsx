import { useCallback, useRef, useState } from 'react';
import './SensorMap.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import type {
  ActiveFloodEvent,
  ProcessedSensorData,
  SensorMapItem,
  SeverityLevel,
} from '../../../../types/flood.types';
import type { WsStatus } from '../../hooks/useFloodWebSocket';
import { sensorService } from '../../../../services/sensor.service';
import type { ActionType } from './constants';
import type { ModalState } from './SensorModals';
import FloodMarkers from './FloodMarkers';
import SensorMarkers from './SensorMarkers';
import SensorModals from './SensorModals';
import { FullscreenControl, MapHeader } from './MapControls';

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

  // ---- Action state ----
  const [modalState,  setModalState]  = useState<ModalState | null>(null);
  const [fetchingId,  setFetchingId]  = useState<string | null>(null);

  const handleSensorAction = useCallback(async (sensorId: string, action: ActionType) => {
    setFetchingId(sensorId);
    try {
      const page = await sensorService.getSensors({ search: sensorId, size: 1 });
      const sensor = page.content[0];
      if (!sensor) return;
      const resolvedAction: ActionType =
        action === 'delete' && (sensor.status as string) === 'DELETED' ? 'restore' : action;
      setModalState({ type: resolvedAction, sensor });
    } catch (e) {
      console.error('SensorMap: failed to fetch sensor', e);
    } finally {
      setFetchingId(null);
    }
  }, []);

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

      <MapHeader
        loading={loading}
        wsStatus={wsStatus}
        apiError={apiError}
        floodCount={floodList.length}
        totalSensorCount={totalSensorCount}
        counts={counts}
      />

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

          <FloodMarkers floodList={floodList} />

          <SensorMarkers
            sensorList={sensorList}
            staticMarkers={staticMarkers}
            fetchingId={fetchingId}
            onAction={handleSensorAction}
          />
        </MapContainer>
      </div>

      {/* ---- Sensor action modals ---- */}
      <SensorModals
        modalState={modalState}
        onClose={() => setModalState(null)}
        onSuccess={() => setModalState(null)}
      />
    </div>
  );
}
