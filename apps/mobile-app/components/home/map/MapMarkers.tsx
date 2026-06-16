import React, { useCallback, useRef } from 'react';
import {
  ShapeSource,
  CircleLayer,
  SymbolLayer,
  type ShapeSourceRef,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import type { OnPressEvent } from '@maplibre/maplibre-react-native';
import { SearchLocationMarker } from './SearchLocationMarker';

interface MapMarkersProps {
  userGeoJSON: GeoJSON.FeatureCollection;
  floodsGeoJSON: GeoJSON.FeatureCollection;
  searchedLocationGeoJSON?: GeoJSON.FeatureCollection;
  onFloodPress: (e: OnPressEvent) => void;
  onClearSearch?: () => void;
  cameraRef?: React.RefObject<CameraRef | null>;
}

// Khớp với web (disableClusteringAtZoom=15): gom cụm tới zoom 14, tách điểm từ 15+.
const CLUSTER_MAX_ZOOM = 14;
const CLUSTER_RADIUS = 60;

// Màu theo mức độ — đỏ cho DANGER, cam cho còn lại (giống quy ước hiện tại).
const SEVERITY_COLOR = ['match', ['get', 'severityLevel'], 'DANGER', '#E53935', '#FB8C00'] as const;
// Cụm đỏ nếu chứa ít nhất 1 điểm DANGER, ngược lại cam.
const CLUSTER_COLOR = ['case', ['>', ['get', 'hasDanger'], 0], '#E53935', '#FB8C00'] as const;

export function MapMarkers({
  userGeoJSON,
  floodsGeoJSON,
  searchedLocationGeoJSON,
  onFloodPress,
  cameraRef,
}: MapMarkersProps) {
  const floodSourceRef = useRef<ShapeSourceRef>(null);

  // Extract searched location coordinate
  const searchedCoordinate = searchedLocationGeoJSON?.features[0]?.geometry.type === 'Point'
    ? (searchedLocationGeoJSON.features[0].geometry.coordinates as [number, number])
    : null;
  const searchedName = searchedLocationGeoJSON?.features[0]?.properties?.name || '';

  // Bấm vào cụm → phóng to để tách cụm; bấm vào điểm đơn → mở chi tiết.
  const handlePress = useCallback(
    async (e: OnPressEvent) => {
      const feature = e.features[0] as GeoJSON.Feature | undefined;
      if (feature?.properties?.cluster) {
        if (!cameraRef?.current || feature.geometry.type !== 'Point') return;
        const coordinates = feature.geometry.coordinates as [number, number];
        try {
          const zoom = await floodSourceRef.current?.getClusterExpansionZoom(feature);
          cameraRef.current.setCamera({
            centerCoordinate: coordinates,
            zoomLevel: zoom ?? CLUSTER_MAX_ZOOM + 1,
            animationDuration: 400,
          });
        } catch {
          // Nếu không lấy được expansion zoom thì vẫn bay tới tâm cụm
          cameraRef.current.setCamera({
            centerCoordinate: coordinates,
            zoomLevel: CLUSTER_MAX_ZOOM + 1,
            animationDuration: 400,
          });
        }
        return;
      }
      onFloodPress(e);
    },
    [cameraRef, onFloodPress],
  );

  return (
    <>
      {/* Vị trí người dùng */}
      {userGeoJSON.features.length > 0 && (
        <ShapeSource id="userLocation" shape={userGeoJSON}>
          <CircleLayer
            id="userHalo"
            style={{
              circleRadius: 20,
              circleColor: '#3b82f6',
              circleOpacity: 0.2,
            }}
          />
          <CircleLayer
            id="userDot"
            style={{
              circleRadius: 8,
              circleColor: '#3b82f6',
              circleStrokeWidth: 3,
              circleStrokeColor: '#ffffff',
            }}
          />
        </ShapeSource>
      )}

      {/* Địa điểm tìm kiếm - Custom Pin Marker */}
      {searchedCoordinate && (
        <SearchLocationMarker
          coordinate={searchedCoordinate}
          name={searchedName}
        />
      )}

      {/* Điểm ngập lụt — bật clustering native để tránh loạn khi nhiều điểm */}
      <ShapeSource
        ref={floodSourceRef}
        id="floods"
        shape={floodsGeoJSON}
        onPress={handlePress}
        hitbox={{ width: 48, height: 48 }}
        cluster
        clusterRadius={CLUSTER_RADIUS}
        clusterMaxZoomLevel={CLUSTER_MAX_ZOOM}
        clusterProperties={{
          // Gom mức độ nặng nhất của cụm: 1 nếu có điểm DANGER.
          hasDanger: ['max', ['case', ['==', ['get', 'severityLevel'], 'DANGER'], 1, 0]],
        }}
      >
        {/* --- Điểm ngập đơn lẻ (không thuộc cụm) --- */}
        <CircleLayer
          id="floodHalo"
          filter={['!', ['has', 'point_count']]}
          style={{
            circleRadius: 24,
            circleColor: SEVERITY_COLOR,
            circleOpacity: 0.3,
          }}
        />
        <CircleLayer
          id="floodDot"
          filter={['!', ['has', 'point_count']]}
          style={{
            circleRadius: 13,
            circleColor: SEVERITY_COLOR,
            circleStrokeWidth: 2.5,
            circleStrokeColor: '#ffffff',
          }}
        />

        {/* --- Cụm điểm ngập --- */}
        <CircleLayer
          id="floodClusterCircle"
          filter={['has', 'point_count']}
          style={{
            circleColor: CLUSTER_COLOR,
            circleOpacity: 0.9,
            circleStrokeWidth: 3,
            circleStrokeColor: '#ffffff',
            // To dần theo số điểm trong cụm.
            circleRadius: ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
          }}
        />
        <SymbolLayer
          id="floodClusterCount"
          filter={['has', 'point_count']}
          style={{
            textField: ['get', 'point_count_abbreviated'],
            textSize: 13,
            textColor: '#ffffff',
            textFont: ['Noto Sans Bold'],
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
      </ShapeSource>
    </>
  );
}
