/**
 * ActivityMap Component - Reusable map for activity tracking and viewing
 * Handles both real-time recording and completed activity display
 */

import React, { useRef, useEffect } from 'react';
import MapView, { Polyline } from 'react-native-maps';
import globalStyles from '../constants/globalStyles';
import { COLORS } from '../constants/theme';
import type { GPSPoint } from '../types';

interface Props {
  /** GPS points to display as track */
  gpsPoints?: GPSPoint[];
  /** Current location region for initial positioning */
  currentLocation?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  /** Calculated region from GPS track */
  trackRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  /** Whether to show user's current location */
  showsUserLocation?: boolean;
  /** Whether map should follow user location */
  followsUserLocation?: boolean;
  /** Whether this is for real-time recording (affects region handling) */
  isRecording?: boolean;
  /** Custom map reference for parent control */
  mapRef?: React.RefObject<MapView | null>;
  /** Polyline color (defaults to primary) */
  trackColor?: string;
  /** Polyline width (defaults to 4) */
  trackWidth?: number;
}

const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function ActivityMap({
  gpsPoints = [],
  currentLocation,
  trackRegion,
  showsUserLocation = false,
  followsUserLocation = false,
  isRecording = false,
  mapRef,
  trackColor = COLORS.primary,
  trackWidth = 4,
}: Props) {
  const internalMapRef = useRef<MapView | null>(null);
  const activeMapRef = mapRef || internalMapRef;

  // Convert GPS points to coordinates for polyline
  const coordinates = gpsPoints.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  // Determine initial region based on priority:
  // 1. Track region (for completed activities)
  // 2. Current location (for recording)
  // 3. Default Paris location
  const initialRegion = trackRegion || currentLocation || DEFAULT_REGION;

  // For recording mode, animate to current location when it changes
  useEffect(() => {
    if (isRecording && currentLocation && activeMapRef.current) {
      try {
        activeMapRef.current.animateToRegion(currentLocation, 500);
      } catch (e) {
        // Ignore animation errors
      }
    }
  }, [currentLocation, isRecording, activeMapRef]);

  return (
    <MapView
      ref={(r) => { 
        if (activeMapRef) {
          activeMapRef.current = r; 
        }
      }}
      style={globalStyles.map}
      initialRegion={initialRegion}
      region={isRecording ? (trackRegion ?? undefined) : undefined}
      showsUserLocation={showsUserLocation}
      followsUserLocation={followsUserLocation}
    >
      {coordinates.length >= 2 && (
        <Polyline
          coordinates={coordinates}
          strokeColor={trackColor}
          strokeWidth={trackWidth}
        />
      )}
    </MapView>
  );
}