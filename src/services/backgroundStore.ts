import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GPSPoint } from '../types';

const BG_LOC_KEY = 'strive:bg_locations';

export async function appendBackgroundLocations(points: GPSPoint[]): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(BG_LOC_KEY);
    const existing: GPSPoint[] = raw ? JSON.parse(raw) : [];
    const next = existing.concat(points);
    await AsyncStorage.setItem(BG_LOC_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('appendBackgroundLocations failed', e);
  }
}

export async function readBackgroundLocations(): Promise<GPSPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(BG_LOC_KEY);
    return raw ? (JSON.parse(raw) as GPSPoint[]) : [];
  } catch (e) {
    console.warn('readBackgroundLocations failed', e);
    return [];
  }
}

export async function clearBackgroundLocations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BG_LOC_KEY);
  } catch (e) {
    console.warn('clearBackgroundLocations failed', e);
  }
}
