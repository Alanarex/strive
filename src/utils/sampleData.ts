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
  const activityConfigs = [
    {
      type: 'run' as ActivityType,
      duration: 35 * 60 * 1000, // 35 minutes
      speed: 3.5, // m/s (~12.6 km/h)
      latOffset: 0.01,
      lngOffset: -0.01,
      daysAgo: 3,
    },
    {
      type: 'walk' as ActivityType,
      duration: 50 * 60 * 1000, // 50 minutes
      speed: 1.4, // m/s (~5 km/h)
      latOffset: -0.005,
      lngOffset: 0.005,
      daysAgo: 2,
    },
    {
      type: 'bike' as ActivityType,
      duration: 45 * 60 * 1000, // 45 minutes
      speed: 6.5, // m/s (~23.4 km/h)
      latOffset: -0.005,
      lngOffset: 0.02,
      daysAgo: 1,
    },
    {
      type: 'hike' as ActivityType,
      duration: 120 * 60 * 1000, // 2 hours
      speed: 1.2, // m/s (~4.3 km/h)
      latOffset: 0.015,
      lngOffset: 0.01,
      daysAgo: 5,
    },
  ];

  for (const config of activityConfigs) {
    const gpsPoints = generateGPSRoute(
      PARIS_CENTER.lat + config.latOffset,
      PARIS_CENTER.lng + config.lngOffset,
      config.duration,
      config.speed,
      config.type
    );
    
    const distance = calculateDistance(gpsPoints);
    const startTime = new Date(Date.now() - config.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() - config.daysAgo * 24 * 60 * 60 * 1000 + config.duration).toISOString();
    
    const activity: Activity = {
      id: generateId(),
      userId,
      type: config.type,
      gpsPoints,
      distance,
      duration: Math.floor(config.duration / 1000), // Convert to seconds
      averageSpeed: distance / (config.duration / 1000), // m/s
      startTime,
      endTime,
      recordingState: 'completed',
    };
    
    await saveActivity(activity);
  }
}