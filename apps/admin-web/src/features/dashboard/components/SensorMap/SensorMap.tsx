import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import './SensorMap.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import type {
  ActiveFloodEvent,
  ProcessedSensorData,
  SensorMapItem,
  SeverityLevel,
} from '../../../../types/flood.types';
import type { WsStatus } from '../../hooks/useFloodWebSocket';
import { floodService } from '../../../../services/flood.service';
import { sensorService } from '../../../../services/sensor.service';
import type { ActionType } from './constants';
import type { ModalState } from './SensorModals';
import FloodMarkers from './FloodMarkers';
import SensorMarkers from './SensorMarkers';
import SensorModals from './SensorModals';
import { FullscreenControl, MapHeader } from './MapControls';

//  Types 
interface SensorMapProps {
  activeFloods:      Record<string, ActiveFloodEvent>;
  sensors:           Record<string, ProcessedSensorData>;
  sensorMarkers:     SensorMapItem[];
  loading:           boolean;
  apiError:          string | null;
  wsStatus:          WsStatus;
  wsError:           string | null;
  onClearWsError:    () => void;
  onFloodDismissed:  (eventId: string) => void;
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
  onFloodDismissed,
}: SensorMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // ---- Action state ----
  const [modalState,   setModalState]   = useState<ModalState | null>(null);
  const [fetchingId,   setFetchingId]   = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const handleDismissFlood = useCallback(async (eventId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm ngập này khỏi bản đồ không?')) return;
    setDismissingId(eventId);
    try {
      await floodService.dismissFlood(eventId);
      onFloodDismissed(eventId);
    } catch (e) {
      console.error('SensorMap: failed to dismiss flood', e);
    } finally {
      setDismissingId(null);
    }
  }, [onFloodDismissed]);

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

  const floodList = useMemo(() => Object.values(activeFloods), [activeFloods]);

  // Tập vị trí điểm ngập — tra cứu O(1) thay vì .some() O(n) cho từng sensor
  const floodPositionKeys = useMemo(
    () => new Set(floodList.map((f) => `${f.lat},${f.lon}`)),
    [floodList],
  );

  // Cảm biến có telemetry real-time (loại trừ vị trí trùng điểm ngập)
  const sensorList = useMemo(
    () => Object.values(sensors).filter((s) => !floodPositionKeys.has(`${s.lat},${s.lon}`)),
    [sensors, floodPositionKeys],
  );

  const staticMarkers = useMemo(() => {
    const telemetrySensorIds = new Set(Object.keys(sensors));
    return sensorMarkers.filter(
      (m) => !telemetrySensorIds.has(m.sensorId)
          && !floodPositionKeys.has(`${m.lat},${m.lon}`),
    );
  }, [sensorMarkers, sensors, floodPositionKeys]);

  const totalSensorCount = sensorMarkers.length || sensorList.length;
  const counts: Record<SeverityLevel, number> = useMemo(() => {
    const c: Record<SeverityLevel, number> = { SAFE: 0, WARNING: 0, DANGER: 0, UNKNOWN: 0 };
    for (const f of floodList) c[f.severityLevel] = (c[f.severityLevel] ?? 0) + 1;
    return c;
  }, [floodList]);

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
          <div className="sensor-map__error">
            <AlertTriangle size={16} style={{ marginRight: '6px' }} />
            <span>{apiError}</span>
          </div>
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

          <FloodMarkers
            floodList={floodList}
            dismissingId={dismissingId}
            onDismiss={handleDismissFlood}
          />

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
