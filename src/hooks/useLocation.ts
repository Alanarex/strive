/**
 * Hook for managing current location
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import type { MapRegion } from './useMapRegion';

interface UseLocationOptions {
  /** Whether to poll for location updates (when not recording) */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 4000) */
  pollingInterval?: number;
  /** Location accuracy */
  accuracy?: Location.Accuracy;
}

interface UseLocationResult {
  region: MapRegion | null;
  error: string | null;
}

/**
 * Get and optionally poll current device location
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
  const {
    enablePolling = false,
    pollingInterval = 4000,
    accuracy = Location.Accuracy.Balanced,
  } = options;

  const [region, setRegion] = useState<MapRegion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial location fetch
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) {
            setError('Permission de localisation refusée');
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy });
        if (!mounted || !pos) return;

        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setError(null);
      } catch (e) {
        console.warn('Failed to get initial location', e);
        if (mounted) {
          setError('Impossible de récupérer la position');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accuracy]);

  // Polling for location updates
  useEffect(() => {
    if (!enablePolling) return;

    let mounted = true;
    const timer = setInterval(async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy });
        if (!mounted || !pos) return;

        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setError(null);
      } catch (e) {
        // Silently ignore polling errors
      }
    }, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [enablePolling, pollingInterval, accuracy]);

  return { region, error };
}
