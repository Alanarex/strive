/**
 * Types pour l'application Strive
 */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  photo?: string;
  createdAt: string;
}

export interface GPSPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  speed: number | null; // m/s
}

export type ActivityType = 'run' | 'walk' | 'bike' | 'hike' | 'other';

export type RecordingState = 'idle' | 'recording' | 'paused';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  gpsPoints: GPSPoint[];
  distance: number; // meters
  duration: number; // seconds
  averageSpeed: number; // m/s
  startTime: string; // ISO string
  endTime: string;
  recordingState: 'completed';
}

export interface ActivitySummary {
  id: string;
  type: ActivityType;
  distance: number;
  duration: number;
  averageSpeed: number;
  startTime: string;
}

export interface GlobalStats {
  totalDistance: number;
  totalDuration: number;
  totalActivities: number;
  averageSpeed: number;
}
