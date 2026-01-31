/**
 * Contexte d'enregistrement d'activité avec GPS
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
  startForegroundWatch,
  requestForegroundPermissions,
  requestBackgroundPermissions,
  isBackgroundLocationAvailable,
} from '../services/locationService';
import { saveActivity } from '../services/database';
import {
  shouldAddPoint,
  calculateTotalDistance,
} from '../utils/gps';
import type { GPSPoint, Activity, ActivityType } from '../types';

type RecordingState = 'idle' | 'recording' | 'paused';

interface RecordingContextType {
  state: RecordingState;
  gpsPoints: GPSPoint[];
  distance: number;
  duration: number;
  averageSpeed: number;
  activityType: ActivityType;
  startRecording: (userId: string, type?: ActivityType) => Promise<boolean>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopAndSaveRecording: (userId: string) => Promise<Activity | null>;
  discardRecording: () => Promise<void>;
  setActivityType: (type: ActivityType) => void;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RecordingState>('idle');
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activityType, setActivityType] = useState<ActivityType>('run');
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userIdRef = useRef<string>('');
  const foregroundCleanupRef = useRef<(() => void) | null>(null);

  const updateStats = useCallback((points: GPSPoint[]) => {
    setDistance(calculateTotalDistance(points));
  }, []);

  const handleLocation = useCallback(
    (point: GPSPoint) => {
      setGpsPoints((prev) => {
        if (!shouldAddPoint(prev, point)) return prev;
        const next = [...prev, point];
        updateStats(next);
        return next;
      });
    },
    [updateStats]
  );

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      const elapsed = elapsedBeforePauseRef.current + (Date.now() - startTimeRef.current) / 1000;
      setDuration(Math.floor(elapsed));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(
    async (userId: string, type: ActivityType = 'run'): Promise<boolean> => {
      const fg = await requestForegroundPermissions();
      if (!fg) return false;

      userIdRef.current = userId;
      setActivityType(type);
      setGpsPoints([]);
      setDistance(0);
      setDuration(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
      setState('recording');
      startTimer();

      const bgAvailable = await isBackgroundLocationAvailable();
      try {
        if (bgAvailable) {
          const bgGranted = await requestBackgroundPermissions();
          if (bgGranted) {
            await startBackgroundLocationUpdates(handleLocation);
          } else {
            const cleanup = await startForegroundWatch(handleLocation);
            foregroundCleanupRef.current = cleanup;
          }
        } else {
          const cleanup = await startForegroundWatch(handleLocation);
          foregroundCleanupRef.current = cleanup;
        }
      } catch (e) {
        const cleanup = await startForegroundWatch(handleLocation);
        foregroundCleanupRef.current = cleanup;
      }
      return true;
    },
    [handleLocation, startTimer]
  );

  const pauseRecording = useCallback(() => {
    if (state !== 'recording') return;
    elapsedBeforePauseRef.current += (Date.now() - startTimeRef.current) / 1000;
    stopTimer();
    stopBackgroundLocationUpdates();
    if (foregroundCleanupRef.current) {
      foregroundCleanupRef.current();
      foregroundCleanupRef.current = null;
    }
    setState('paused');
  }, [state, stopTimer]);

  const resumeRecording = useCallback(async () => {
    if (state !== 'paused') return;
    startTimeRef.current = Date.now();
    setState('recording');
    startTimer();
    const bgAvailable = await isBackgroundLocationAvailable();
    try {
      if (bgAvailable) {
        await startBackgroundLocationUpdates(handleLocation);
      } else {
        const cleanup = await startForegroundWatch(handleLocation);
        foregroundCleanupRef.current = cleanup;
      }
    } catch {
      const cleanup = await startForegroundWatch(handleLocation);
      foregroundCleanupRef.current = cleanup;
    }
  }, [state, handleLocation, startTimer]);

  const gpsPointsRef = useRef<GPSPoint[]>([]);
  const durationRef = useRef(0);
  gpsPointsRef.current = gpsPoints;
  durationRef.current = duration;

  const discardRecording = useCallback(async () => {
    stopTimer();
    await stopBackgroundLocationUpdates();
    if (foregroundCleanupRef.current) {
      foregroundCleanupRef.current();
      foregroundCleanupRef.current = null;
    }
    setState('idle');
    setGpsPoints([]);
    setDistance(0);
    setDuration(0);
  }, [stopTimer]);

  const stopAndSaveRecording = useCallback(
    async (userId: string): Promise<Activity | null> => {
      stopTimer();
      await stopBackgroundLocationUpdates();
      if (foregroundCleanupRef.current) {
        foregroundCleanupRef.current();
        foregroundCleanupRef.current = null;
      }
      const points = gpsPointsRef.current;
      setState('idle');
      if (points.length < 2) return null;

      const dist = calculateTotalDistance(points);
      const startTs = points[0].timestamp;
      const endTs = points[points.length - 1].timestamp;
      const dur = Math.floor((endTs - startTs) / 1000) || Math.floor(durationRef.current);
      const avgSpeed = dur > 0 ? dist / dur : 0;

      const activity: Activity = {
        id: generateId(),
        userId,
        type: activityType,
        gpsPoints: points,
        distance: dist,
        duration: dur,
        averageSpeed: avgSpeed,
        startTime: new Date(startTs).toISOString(),
        endTime: new Date(endTs).toISOString(),
        recordingState: 'completed',
      };
      await saveActivity(activity);
      setGpsPoints([]);
      setDistance(0);
      setDuration(0);
      return activity;
    },
    [activityType, stopTimer]
  );

  return (
    <RecordingContext.Provider
      value={{
        state,
        gpsPoints,
        distance,
        duration,
        averageSpeed: duration > 0 ? distance / duration : 0,
        activityType,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopAndSaveRecording,
        discardRecording,
        setActivityType,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used within RecordingProvider');
  return ctx;
}
