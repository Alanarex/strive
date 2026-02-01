/**
 * Activity type constants and labels
 */

import type { ActivityType } from '../types';

export const ACTIVITY_LABELS: Record<string, string> = {
  run: 'Course',
  walk: 'Marche',
  bike: 'Vélo',
  hike: 'Randonnée',
  other: 'Autre',
};

export const ACTIVITY_TYPES: Array<{ key: ActivityType; label: string }> = [
  { key: 'run', label: 'Course' },
  { key: 'walk', label: 'Marche' },
  { key: 'bike', label: 'Vélo' },
  { key: 'hike', label: 'Randonnée' },
  { key: 'other', label: 'Autre' },
];
