import React from 'react';
import { ShapeSource, CircleLayer } from '@maplibre/maplibre-react-native';
import type { OnPressEvent } from '@maplibre/maplibre-react-native';
import { SearchLocationMarker } from './SearchLocationMarker';

interface MapMarkersProps {
  userGeoJSON: GeoJSON.FeatureCollection;
  floodsGeoJSON: GeoJSON.FeatureCollection;
  searchedLocationGeoJSON?: GeoJSON.FeatureCollection;
  onFloodPress: (e: OnPressEvent) => void;
  onClearSearch?: () => void;
}

export function MapMarkers({
  userGeoJSON,
  floodsGeoJSON,
  searchedLocationGeoJSON,
  onFloodPress,
  onClearSearch,
}: MapMarkersProps) {
  // Extract searched location coordinate
  const searchedCoordinate = searchedLocationGeoJSON?.features[0]?.geometry.type === 'Point'
    ? (searchedLocationGeoJSON.features[0].geometry.coordinates as [number, number])
    : null;
  const searchedName = searchedLocationGeoJSON?.features[0]?.properties?.name || '';

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
          onClose={onClearSearch}
          showDirections={true}
        />
      )}

      {/* Điểm ngập lụt */}
      <ShapeSource
        id="floods"
        shape={floodsGeoJSON}
        onPress={onFloodPress}
        hitbox={{ width: 48, height: 48 }}
      >
        <CircleLayer
          id="floodHalo"
          style={{
            circleRadius: 24,
            circleColor: ['match', ['get', 'severityLevel'], 'DANGER', '#E53935', '#FB8C00'],
            circleOpacity: 0.3,
          }}
        />
        <CircleLayer
          id="floodDot"
          style={{
            circleRadius: 13,
            circleColor: ['match', ['get', 'severityLevel'], 'DANGER', '#E53935', '#FB8C00'],
            circleStrokeWidth: 2.5,
            circleStrokeColor: '#ffffff',
          }}
        />
      </ShapeSource>
    </>
  );
}
