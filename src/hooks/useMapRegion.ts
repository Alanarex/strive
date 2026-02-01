/**
 * Hook for calculating map region from GPS points
 */

import { useMemo } from 'react';
import type { GPSPoint } from '../types';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Calculate map region to fit all GPS points
 */
export function useMapRegion(gpsPoints: GPSPoint[]): MapRegion | null {
  return useMemo(() => {
    if (gpsPoints.length === 0) return null;
    
    const lats = gpsPoints.map((p) => p.latitude);
    const lngs = gpsPoints.map((p) => p.longitude);
    
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [gpsPoints]);
}
