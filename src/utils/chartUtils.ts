/**
 * Chart utilities for aggregating data for visualization
 */
import { ActivitySummary } from '../types';

export interface MonthlyStats {
  month: string;
  monthNumber: number;
  count: number;
  distance: number;
  speed: number;
  pace: string;
}

/**
 * Aggregate activities by month
 * Returns last 3 months, or from join date if newer
 */
export const getMonthlyStats = (activities: ActivitySummary[]): MonthlyStats[] => {
  const now = new Date();
  const months: Record<string, { count: number; distance: number; duration: number }> = {};

  const earliestActivity = activities.length
    ? new Date(
        Math.min(
          ...activities.map((a) => new Date((a as any).startTime).getTime())
        )
      )
    : null;

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const startDate = earliestActivity && earliestActivity > threeMonthsAgo
    ? new Date(earliestActivity.getFullYear(), earliestActivity.getMonth(), 1)
    : threeMonthsAgo;

  // Initialize months from startDate to now
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (cursor <= now) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { count: 0, distance: 0, duration: 0 };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Aggregate activities
  (activities as any[]).forEach((activity) => {
    const actDate = new Date(activity.startTime);
    const key = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].count += 1;
      months[key].distance += activity.distance;
      months[key].duration += activity.duration;
    }
  });

  // Convert to array with display format
  return Object.entries(months).map(([key, data], index) => {
    const [year, month] = key.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const avgSpeed = data.duration > 0 ? data.distance / data.duration : 0;
    const paceMs = avgSpeed > 0 ? 1000 / avgSpeed : 0;
    const paceMin = Math.floor(paceMs / 60);
    const paceSec = Math.floor(paceMs % 60);
    
    return {
      month: monthNames[monthDate.getMonth()],
      monthNumber: parseInt(month),
      count: data.count,
      distance: data.distance / 1000, // Convert to km
      speed: avgSpeed > 0 ? (data.distance / data.duration) * 3.6 : 0, // Convert to km/h
      pace: `${paceMin}:${String(paceSec).padStart(2, '0')}`,
    };
  });
};

/**
 * Get chart data points for line chart
 */
export const getChartDataPoints = (
  monthlyStats: MonthlyStats[],
  dataType: 'count' | 'distance' | 'speed'
): number[] => {
  return monthlyStats.map((stat) => {
    switch (dataType) {
      case 'count':
        return stat.count;
      case 'distance':
        return stat.distance;
      case 'speed':
        return stat.speed;
      default:
        return 0;
    }
  });
};

/**
 * Get max value for scaling chart
 */
export const getMaxChartValue = (data: number[]): number => {
  const max = Math.max(...data, 1);
  return Math.ceil(max * 1.1); // Add 10% padding
};
