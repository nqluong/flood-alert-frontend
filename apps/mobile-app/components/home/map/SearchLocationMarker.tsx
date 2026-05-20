/**
 * Marker cho địa điểm tìm kiếm / chạm chọn trên bản đồ.
 *
 * Trước đây dùng <MarkerView> (overlay React Native View lên trên map). Cách
 * đó bị TRỄ rõ rệt khi user pan/zoom map vì vị trí overlay được cập nhật ở
 * tầng JS trong khi map đã di chuyển ở native → marker "xê dịch" rồi mới về
 * đúng chỗ. Hiện chuyển sang ShapeSource + CircleLayer (vẽ native bởi
 * MapLibre) nên gắn cứng vào toạ độ, không drift.
 */
import React, { useMemo } from 'react';
import { CircleLayer, ShapeSource } from '@maplibre/maplibre-react-native';

interface SearchLocationMarkerProps {
  coordinate: [number, number];
  name?: string;
}

export function SearchLocationMarker({ coordinate, name }: SearchLocationMarkerProps) {
  const shape = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'search-marker',
          geometry: { type: 'Point', coordinates: coordinate },
          properties: { name: name ?? '' },
        },
      ],
    }),
    [coordinate, name],
  );

  return (
    <ShapeSource id="search-marker-source" shape={shape}>
      <CircleLayer
        id="searchMarkerHalo"
        style={{
          circleRadius: 22,
          circleColor: '#ef4444',
          circleOpacity: 0.25,
        }}
      />
      <CircleLayer
        id="searchMarkerRing"
        style={{
          circleRadius: 13,
          circleColor: '#ffffff',
        }}
      />
      <CircleLayer
        id="searchMarkerDot"
        style={{
          circleRadius: 9,
          circleColor: '#ef4444',
          circleStrokeWidth: 2,
          circleStrokeColor: '#ffffff',
        }}
      />
    </ShapeSource>
  );
}
