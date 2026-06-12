import { memo } from 'react';
import './SensorMarkers.css';
import { Marker, Tooltip, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Radio } from 'lucide-react';
import type { ProcessedSensorData, SensorMapItem } from '../../../../types/flood.types';
import { createSensorIcon, createSensorClusterIcon } from './constants';
import type { ActionType } from './constants';
import SensorActionPopup from './SensorPopup';

interface SensorMarkersProps {
  /** Cảm biến có telemetry real-time (đã loại trừ điểm trùng lũ) */
  sensorList: ProcessedSensorData[];
  /** Cảm biến tĩnh từ /sensors/map chưa có telemetry */
  staticMarkers: SensorMapItem[];
  fetchingId: string | null;
  onAction: (sensorId: string, action: ActionType) => void;
}

const TelemetrySensorMarker = memo(function TelemetrySensorMarker({
  sensor,
  isFetching,
  onAction,
}: {
  sensor: ProcessedSensorData;
  isFetching: boolean;
  onAction: (sensorId: string, action: ActionType) => void;
}) {
  return (
    <Marker
      position={[sensor.lat, sensor.lon]}
      icon={createSensorIcon(sensor.status || 'NORMAL')}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
        <div className="sensor-map__tooltip">
          <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={14} />
            {sensor.sensorId}
          </strong>
          <span>{sensor.locationName}</span>
          <span>Mực nước: {sensor.waterLevel != null ? `${sensor.waterLevel.toFixed(1)} cm` : '—'}</span>
          <span>Trạng thái: {sensor.status || 'NORMAL'}</span>
          <span>Pin: {sensor.battery}%</span>
          {sensor.timestamp && (
            <span style={{ color: '#9ca3af', fontSize: 10 }}>
              {new Date(sensor.timestamp).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </Tooltip>
      <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
        <SensorActionPopup
          sensorId={sensor.sensorId}
          status={sensor.status || 'NORMAL'}
          waterLevel={sensor.waterLevel ?? undefined}
          batteryLevel={sensor.battery}
          timestamp={sensor.timestamp}
          locationName={sensor.locationName}
          warningThreshold={sensor.warningThreshold}
          dangerThreshold={sensor.dangerThreshold}
          fetchingId={isFetching ? sensor.sensorId : null}
          onAction={onAction}
        />
      </Popup>
    </Marker>
  );
});

const StaticSensorMarker = memo(function StaticSensorMarker({
  sensor,
  isFetching,
  onAction,
}: {
  sensor: SensorMapItem;
  isFetching: boolean;
  onAction: (sensorId: string, action: ActionType) => void;
}) {
  return (
    <Marker
      position={[sensor.lat, sensor.lon]}
      icon={createSensorIcon(sensor.status)}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
        <div className="sensor-map__tooltip">
          <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={14} />
            {sensor.sensorId}
          </strong>
          <span>{sensor.name}</span>
          <span>Trạng thái: {sensor.status}</span>
          <span>Pin: {sensor.batteryLevel}%</span>
        </div>
      </Tooltip>
      <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
        <SensorActionPopup
          sensorId={sensor.sensorId}
          name={sensor.name}
          status={sensor.status}
          batteryLevel={sensor.batteryLevel}
          fetchingId={isFetching ? sensor.sensorId : null}
          onAction={onAction}
        />
      </Popup>
    </Marker>
  );
});

export default memo(function SensorMarkers({
  sensorList,
  staticMarkers,
  fetchingId,
  onAction,
}: SensorMarkersProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createSensorClusterIcon}
      showCoverageOnHover={false}
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      zoomToBoundsOnClick
    >
      {/* Cảm biến real-time */}
      {sensorList.map((sensor) => (
        <TelemetrySensorMarker
          key={sensor.sensorId}
          sensor={sensor}
          isFetching={fetchingId === sensor.sensorId}
          onAction={onAction}
        />
      ))}

      {/* Cảm biến tĩnh từ /sensors/map */}
      {staticMarkers.map((sensor) => (
        <StaticSensorMarker
          key={`map-${sensor.sensorId}`}
          sensor={sensor}
          isFetching={fetchingId === sensor.sensorId}
          onAction={onAction}
        />
      ))}
    </MarkerClusterGroup>
  );
});
