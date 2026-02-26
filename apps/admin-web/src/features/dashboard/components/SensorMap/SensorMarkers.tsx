import './SensorMarkers.css';
import { Marker, Tooltip, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { ProcessedSensorData, SensorMapItem } from '../../../../types/flood.types';
import { createSensorIcon, createSensorClusterIcon } from './constants';
import type { ActionType } from './constants';
import SensorActionPopup from './SensorPopup';

interface SensorMarkersProps {
  /** Cảm biến có telemetry real-time (đã loại trừ điểm trùng lũ) */
  sensorList:    ProcessedSensorData[];
  /** Cảm biến tĩnh từ /sensors/map chưa có telemetry */
  staticMarkers: SensorMapItem[];
  fetchingId:    string | null;
  onAction:      (sensorId: string, action: ActionType) => void;
}

export default function SensorMarkers({
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
          <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
            <SensorActionPopup
              sensorId={sensor.sensorId}
              status={sensor.status}
              waterLevel={sensor.waterLevel}
              recordedAt={sensor.recordedAt}
              fetchingId={fetchingId}
              onAction={onAction}
            />
          </Popup>
        </Marker>
      ))}

      {/* Cảm biến tĩnh từ /sensors/map */}
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
          <Popup className="smap-popup-wrap" closeButton={false} minWidth={220} maxWidth={280}>
            <SensorActionPopup
              sensorId={sensor.sensorId}
              name={sensor.name}
              status={sensor.status}
              batteryLevel={sensor.batteryLevel}
              fetchingId={fetchingId}
              onAction={onAction}
            />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
