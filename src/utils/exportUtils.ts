/**
 * Export Utility - Generate GPX and CSV formats for activities
 */

import type { Activity } from '../types';
import { ACTIVITY_LABELS } from '../constants/activities';

/**
 * Generate GPX format from activity
 * GPX is the standard format for GPS tracks
 */
export function generateGPX(activity: Activity): string {
  const date = new Date(activity.startTime).toISOString();
  
  const trkpts = activity.gpsPoints
    .map(
      (pt) =>
        `    <trkpt lat="${pt.latitude}" lon="${pt.longitude}">
      <ele>${0}</ele>
      <time>${new Date(pt.timestamp).toISOString()}</time>
      ${pt.accuracy ? `<hdop>${(pt.accuracy / 1000).toFixed(2)}</hdop>` : ''}
    </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Strive" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${ACTIVITY_LABELS[activity.type] || activity.type}</name>
    <time>${date}</time>
  </metadata>
  <trk>
    <name>${ACTIVITY_LABELS[activity.type] || activity.type}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Generate CSV format from activity
 */
export function generateCSV(activity: Activity): string {
  const headers = [
    'Latitude',
    'Longitude',
    'Accuracy (m)',
    'Timestamp',
    'Speed (m/s)',
  ].join(',');

  const rows = activity.gpsPoints
    .map(
      (pt) =>
        [
          pt.latitude,
          pt.longitude,
          pt.accuracy ?? '',
          new Date(pt.timestamp).toISOString(),
          pt.speed ?? '',
        ].join(',')
    )
    .join('\n');

  return `${headers}\n${rows}`;
}

/**
 * Generate activity summary report as text
 */
export function generateReport(activity: Activity): string {
  const date = new Date(activity.startTime).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const time = new Date(activity.startTime).toLocaleTimeString('fr-FR');
  
  const distance = (activity.distance / 1000).toFixed(2);
  const minutes = Math.floor(activity.duration / 60);
  const seconds = activity.duration % 60;
  const duration = `${minutes}m ${seconds}s`;
  
  const speed = (activity.averageSpeed * 3.6).toFixed(2);
  const pace = activity.averageSpeed > 0
    ? (() => {
        const secondsPerKm = 1000 / activity.averageSpeed;
        const paceMin = Math.floor(secondsPerKm / 60);
        const paceSec = Math.floor(secondsPerKm % 60);
        return `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
      })()
    : '--:--';

  return `RAPPORT D'ACTIVITÉ STRIVE
================================

Type d'activité: ${ACTIVITY_LABELS[activity.type] || activity.type}
Date: ${date}
Heure: ${time}

MÉTRIQUES
---------
Distance: ${distance} km
Durée: ${duration}
Vitesse moyenne: ${speed} km/h
Allure moyenne: ${pace} min/km
Nombre de points GPS: ${activity.gpsPoints.length}

Début: ${new Date(activity.startTime).toLocaleString('fr-FR')}
Fin: ${new Date(activity.endTime).toLocaleString('fr-FR')}
`;
}

/**
 * Create and return a data URI for download
 */
export function createDataURI(content: string, filename: string, mimeType: string): string {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
}

/**
 * Get filename for export
 */
export function getExportFilename(
  activity: Activity,
  format: 'gpx' | 'csv' | 'txt'
): string {
  const date = new Date(activity.startTime).toISOString().split('T')[0];
  const type = ACTIVITY_LABELS[activity.type] || activity.type;
  return `strive-${type}-${date}.${format}`;
}
