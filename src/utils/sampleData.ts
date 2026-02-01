/**
 * Sample data generator for development/testing
 */

import { saveActivity } from '../services/database';
import type { GPSPoint, ActivityType, Activity } from '../types';

// Paris area coordinates for realistic GPS data
const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 };

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Generate realistic GPS points for a route
 */
function generateGPSRoute(
  startLat: number,
  startLng: number,
  durationMs: number,
  speedMs: number,
  activityType: ActivityType
): GPSPoint[] {
  const points: GPSPoint[] = [];
  const intervalMs = 5000; // Point every 5 seconds
  const numPoints = Math.floor(durationMs / intervalMs);
  
  // Different movement patterns based on activity type
  const speedVariation = activityType === 'run' ? 0.3 : activityType === 'bike' ? 0.4 : 0.2;
  
  let currentLat = startLat;
  let currentLng = startLng;
  const baseTimestamp = Date.now() - durationMs;
  
  for (let i = 0; i < numPoints; i++) {
    // Add slight randomness to route (simulate real movement)
    const angle = (i / numPoints) * 2 * Math.PI + Math.random() * 0.3;
    const speedVar = speedMs * (1 + (Math.random() - 0.5) * speedVariation);
    const distance = (speedVar * intervalMs) / 1000; // meters
    
    // Convert distance to lat/lng offset (rough approximation)
    const latOffset = (distance * Math.cos(angle)) / 111000; // ~111km per degree
    const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(currentLat * Math.PI / 180));
    
    currentLat += latOffset;
    currentLng += lngOffset;
    
    points.push({
      latitude: currentLat,
      longitude: currentLng,
      accuracy: 5 + Math.random() * 10,
      timestamp: baseTimestamp + (i * intervalMs),
      speed: speedVar + (Math.random() - 0.5) * speedVar * 0.3,
    });
  }
  
  return points;
}

/**
 * Calculate total distance from GPS points
 */
function calculateDistance(points: GPSPoint[]): number {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Haversine formula for distance between two points
    const R = 6371000; // Earth's radius in meters
    const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
    const dLng = (curr.longitude - prev.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }
  
  return totalDistance;
}

/**
 * Generate and save sample activities
 */
export async function generateSampleActivities(userId: string): Promise<void> {
  // Activity 1: Morning run
  const runDuration = 35 * 60 * 1000; // 35 minutes
  const runSpeed = 3.5; // m/s (~12.6 km/h)
  const runPoints = generateGPSRoute(
    PARIS_CENTER.lat + 0.01,
    PARIS_CENTER.lng - 0.01,
    runDuration,
    runSpeed,
    'run'
  );
  const runDistance = calculateDistance(runPoints);
  const runStartTime = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  
  const runActivity: Activity = {
    id: generateId(),
    userId,
    type: 'run',
    gpsPoints: runPoints,
    distance: runDistance,
    duration: Math.floor(runDuration / 1000), // Convert to seconds
    averageSpeed: runDistance / (runDuration / 1000), // m/s
    startTime: runStartTime,
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + runDuration).toISOString(),
    recordingState: 'completed',
  };
  
  await saveActivity(runActivity);

  // Activity 2: Evening bike ride
  const bikeDuration = 45 * 60 * 1000; // 45 minutes  
  const bikeSpeed = 6.5; // m/s (~23.4 km/h)
  const bikePoints = generateGPSRoute(
    PARIS_CENTER.lat - 0.005,
    PARIS_CENTER.lng + 0.02,
    bikeDuration,
    bikeSpeed,
    'bike'
  );
  const bikeDistance = calculateDistance(bikePoints);
  const bikeStartTime = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
  
  const bikeActivity: Activity = {
    id: generateId(),
    userId,
    type: 'bike',
    gpsPoints: bikePoints,
    distance: bikeDistance,
    duration: Math.floor(bikeDuration / 1000), // Convert to seconds
    averageSpeed: bikeDistance / (bikeDuration / 1000), // m/s
    startTime: bikeStartTime,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + bikeDuration).toISOString(),
    recordingState: 'completed',
  };
  
  await saveActivity(bikeActivity);
}