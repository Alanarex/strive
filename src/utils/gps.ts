/**
 * Utilitaires pour les calculs GPS et de distance
 * Spécification : distance minimale entre deux points 5-10m
 */

import type { GPSPoint } from '../types';

const MIN_DISTANCE_METERS = 7; // Entre 5 et 10m
const EARTH_RADIUS_M = 6371000;

/**
 * Calcule la distance entre deux points GPS (formule Haversine)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Vérifie si un nouveau point doit être ajouté (distance minimale respectée)
 */
export function shouldAddPoint(
  points: GPSPoint[],
  newPoint: GPSPoint
): boolean {
  if (points.length === 0) return true;
  const last = points[points.length - 1];
  const dist = haversineDistance(
    last.latitude,
    last.longitude,
    newPoint.latitude,
    newPoint.longitude
  );
  return dist >= MIN_DISTANCE_METERS;
}

/**
 * Calcule la distance totale d'une série de points GPS
 */
export function calculateTotalDistance(points: GPSPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
  }
  return total;
}

/**
 * Convertit m/s en km/h
 */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/**
 * Convertit m/s en allure (min/km)
 */
export function msToPace(ms: number): string {
  if (ms <= 0) return '--:--';
  const secondsPerKm = 1000 / ms;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formate une distance en mètres
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Formate une durée en secondes
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m.toString().padStart(h > 0 ? 2 : 1, '0')}min`);
  if (h === 0) parts.push(`${s.toString().padStart(2, '0')}s`);
  return parts.join(' ');
}
