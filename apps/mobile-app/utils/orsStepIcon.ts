/**
 * Mapping mã `type` của step OpenRouteService sang tên icon MaterialIcons.
 * Mã type theo tài liệu ORS directions response:
 *   0 left, 1 right, 2 sharp-left, 3 sharp-right,
 *   4 slight-left, 5 slight-right, 6 straight,
 *   7 enter-roundabout, 8 exit-roundabout, 9 u-turn,
 *   10 goal, 11 depart, 12 keep-left, 13 keep-right
 */
import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export function getOrsStepIcon(type: number | undefined): MaterialIconName {
  switch (type) {
    case 0: return 'turn-left';
    case 1: return 'turn-right';
    case 2: return 'turn-sharp-left';
    case 3: return 'turn-sharp-right';
    case 4: return 'turn-slight-left';
    case 5: return 'turn-slight-right';
    case 6: return 'straight';
    case 7: return 'roundabout-right';
    case 8: return 'roundabout-right';
    case 9: return 'u-turn-left';
    case 10: return 'flag';
    case 11: return 'near-me';
    case 12: return 'fork-left';
    case 13: return 'fork-right';
    default: return 'straight';
  }
}

export function formatDistance(meters: number): string {
  if (!isFinite(meters) || meters < 0) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}
