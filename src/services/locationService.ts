/**
 * Service de localisation avec support background
 * Intervalle : 1-3s en mouvement, 5-10s en pause (via distanceInterval)
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import type { GPSPoint } from '../types';

const BACKGROUND_TASK_NAME = 'STRIVE_LOCATION_TASK';

// Store partagé pour communiquer entre le task background et l'app
let locationCallback: ((locations: Location.LocationObject[]) => void) | null =
  null;

export function setLocationCallback(cb: ((locs: Location.LocationObject[]) => void) | null) {
  locationCallback = cb;
}

// Doit être défini au top-level pour le background
TaskManager.defineTask(BACKGROUND_TASK_NAME, ({
  data,
  error,
}: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
  if (error) {
    console.error('Background location error:', error);
    return Promise.resolve();
  }
  if (data?.locations && locationCallback) {
    locationCallback(data.locations);
  }
  return Promise.resolve();
});

export async function requestForegroundPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function requestBackgroundPermissions(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

export async function getForegroundPermissionStatus(): Promise<boolean> {
  const { granted } = await Location.getForegroundPermissionsAsync();
  return granted;
}

export async function getBackgroundPermissionStatus(): Promise<boolean> {
  const { granted } = await Location.getBackgroundPermissionsAsync();
  return granted;
}

export async function isBackgroundLocationAvailable(): Promise<boolean> {
  return Location.isBackgroundLocationAvailableAsync();
}

export function convertToGPSPoint(loc: Location.LocationObject): GPSPoint {
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy,
    timestamp: loc.timestamp,
    speed: loc.coords.speed,
  };
}

export async function startBackgroundLocationUpdates(
  onLocation: (point: GPSPoint) => void
): Promise<void> {
  setLocationCallback((locations) => {
    for (const loc of locations) {
      onLocation(convertToGPSPoint(loc));
    }
  });

  await Location.startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 7, // ~7m entre les points (5-10m spec)
    timeInterval: 2000, // 2s en mouvement (1-3s spec)
    deferredUpdatesInterval: 7000, // 7s quand pause (5-10s spec)
    deferredUpdatesDistance: 10,
    foregroundService: {
      notificationTitle: 'Strive - Enregistrement en cours',
      notificationBody: 'Votre activité sportive est en cours d\'enregistrement',
      notificationColor: '#00C853',
    },
    activityType: Location.ActivityType.Fitness,
    pausesUpdatesAutomatically: true,
    showsBackgroundLocationIndicator: true,
  });
}

export async function stopBackgroundLocationUpdates(): Promise<void> {
  setLocationCallback(null);
  const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);
  if (started) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
  }
}

// Fallback foreground-only (Expo Go)
export async function startForegroundWatch(
  onLocation: (point: GPSPoint) => void
): Promise<() => void> {
  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 7,
      timeInterval: 2000,
    },
    (loc) => onLocation(convertToGPSPoint(loc))
  );
  return () => sub.remove();
}
