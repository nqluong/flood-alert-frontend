import './SensorMap.css';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

interface SensorPoint {
  id: string;
  lat: number;
  lng: number;
  status: 'normal' | 'warning';
  label: string;
  area: string;
}

// Sensor data placed around Hà Nội
const SENSOR_POINTS: SensorPoint[] = [
  { id: 's1',  lat: 21.0285, lng: 105.8542, status: 'normal',  label: 'S-01', area: 'Hoàn Kiếm' },
  { id: 's2',  lat: 21.0245, lng: 105.8412, status: 'normal',  label: 'S-02', area: 'Ba Đình' },
  { id: 's3',  lat: 21.0195, lng: 105.8350, status: 'warning', label: 'S-03', area: 'Đống Đa' },
  { id: 's4',  lat: 21.0380, lng: 105.8490, status: 'normal',  label: 'S-04', area: 'Tây Hồ' },
  { id: 's5',  lat: 21.0130, lng: 105.8730, status: 'warning', label: 'S-05', area: 'Hai Bà Trưng' },
  { id: 's6',  lat: 20.9920, lng: 105.8640, status: 'normal',  label: 'S-06', area: 'Hoàng Mai' },
  { id: 's7',  lat: 21.0060, lng: 105.8430, status: 'normal',  label: 'S-07', area: 'Thanh Xuân' },
  { id: 's8',  lat: 21.0480, lng: 105.8020, status: 'normal',  label: 'S-08', area: 'Cầu Giấy' },
  { id: 's9',  lat: 21.0680, lng: 105.7800, status: 'warning', label: 'S-09', area: 'Nam Từ Liêm' },
  { id: 's10', lat: 21.0820, lng: 105.7650, status: 'normal',  label: 'S-10', area: 'Bắc Từ Liêm' },
  { id: 's11', lat: 21.0430, lng: 105.9100, status: 'normal',  label: 'S-11', area: 'Long Biên' },
  { id: 's12', lat: 21.0600, lng: 105.9300, status: 'warning', label: 'S-12', area: 'Gia Lâm' },
  { id: 's13', lat: 20.9700, lng: 105.8450, status: 'normal',  label: 'S-13', area: 'Thanh Trì' },
  { id: 's14', lat: 20.9500, lng: 105.7900, status: 'normal',  label: 'S-14', area: 'Hà Đông' },
  { id: 's15', lat: 21.0150, lng: 105.9000, status: 'normal',  label: 'S-15', area: 'Hoàng Mai - Yên Sở' },
];

// Colors per status
const STATUS_COLOR: Record<SensorPoint['status'], string> = {
  normal:  '#22c55e',
  warning: '#ef4444',
};

export default function SensorMap() {
  const normalCount  = SENSOR_POINTS.filter(s => s.status === 'normal').length;
  const warningCount = SENSOR_POINTS.filter(s => s.status === 'warning').length;

  return (
    <div className="sensor-map">
      {/* Header */}
      <div className="sensor-map__header">
        <h2 className="sensor-map__title">Bản đồ cảm biến thời gian thực</h2>
        <div className="sensor-map__legend">
          <div className="sensor-map__legend-item">
            <span className="sensor-map__legend-dot sensor-map__legend-dot--normal" />
            Bình thường ({normalCount})
          </div>
          <div className="sensor-map__legend-item">
            <span className="sensor-map__legend-dot sensor-map__legend-dot--warning" />
            Cảnh báo lũ ({warningCount})
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="sensor-map__canvas">
        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={11}
          style={{ width: '100%', height: '460px' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {SENSOR_POINTS.map((sensor) => (
            <CircleMarker
              key={sensor.id}
              center={[sensor.lat, sensor.lng]}
              radius={8}
              pathOptions={{
                color: STATUS_COLOR[sensor.status],
                fillColor: STATUS_COLOR[sensor.status],
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.92}>
                <div className="sensor-map__tooltip">
                  <strong>{sensor.label}</strong>
                  <span>{sensor.area}</span>
                  <span
                    className={`sensor-map__tooltip-status sensor-map__tooltip-status--${sensor.status}`}
                  >
                    {sensor.status === 'warning' ? 'Cảnh báo lũ' : 'Bình thường'}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
