import React from 'react';
import { ShapeSource, LineLayer } from '@maplibre/maplibre-react-native';

interface RouteLayerProps {
  routeGeoJSON: GeoJSON.FeatureCollection | null;
}

/**
 * Component hiển thị đường đi trên bản đồ
 */
export function RouteLayer({ routeGeoJSON }: RouteLayerProps) {
  if (!routeGeoJSON) {
    return null;
  }

  return (
    <ShapeSource id="route-source" shape={routeGeoJSON}>
      {/* Route outline (border) */}
      <LineLayer
        id="route-outline"
        style={{
          lineColor: '#ffffff',
          lineWidth: 8,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      
      {/* Route main line */}
      <LineLayer
        id="route-line"
        style={{
          lineColor: '#009688',
          lineWidth: 5,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </ShapeSource>
  );
}
