/**
 * StatsByType Component - Display statistics grouped by activity type
 */

import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../constants/globalStyles';
import { msToKmh, msToPace } from '../utils/gps';
import { ACTIVITY_LABELS } from '../constants/activities';
import type { ActivitySummary, ActivityType } from '../types';

interface Props {
  activities: ActivitySummary[];
}

interface TypeStat {
  type: string;
  title: string;
  icon: string;
  count: number;
  distance: string;
  speed: string;
  pace: string;
}

// Activity type icons
const ACTIVITY_ICONS: Record<string, string> = {
  run: '🏃',
  bike: '🚴',
  walk: '🚶',
  hike: '🥾',
  other: '🎯',
};

export default function StatsByType({ activities }: Props) {
  // Group by activity type
  const byType: Record<string, ActivitySummary[]> = {};
  (activities as any[]).forEach((a) => {
    if (!byType[a.type]) byType[a.type] = [];
    byType[a.type].push(a);
  });

  // Convert to TypeStat array
  const typeStats: TypeStat[] = Object.entries(byType).map(([type, typeActivities]) => {
    const totalDist = typeActivities.reduce((sum, a) => sum + a.distance, 0);
    const totalDur = typeActivities.reduce((sum, a) => sum + a.duration, 0);
    const avgSpeed = totalDur > 0 ? totalDist / totalDur : 0;

    return {
      type,
      title: ACTIVITY_LABELS[type as ActivityType] || type,
      icon: ACTIVITY_ICONS[type] || '🎯',
      count: typeActivities.length,
      distance: `${(totalDist / 1000).toFixed(1)} km`,
      speed: `${msToKmh(avgSpeed).toFixed(1)} km/h`,
      pace: msToPace(avgSpeed),
    };
  });

  if (typeStats.length === 0) {
    return (
      <Text style={[globalStyles.card_text, { textAlign: 'center' }]}>
        Aucune activité pour le moment.
      </Text>
    );
  }

  return (
    <View style={globalStyles.flex_column}>
      {typeStats.map((stat, index) => {
        // Render a row for every 2 items
        if (index % 2 === 0) {
          return (
            <View key={`row-${index}`} style={globalStyles.flex_row}>
              <View style={globalStyles.achievement_card}>
                <View style={globalStyles.achievement_header}>
                  <Text style={globalStyles.achievement_icon}>{stat.icon}</Text>
                  <View style={globalStyles.achievement_content}>
                    <Text style={globalStyles.achievement_title}>{stat.title}</Text>
                    <Text style={globalStyles.achievement_value}>{stat.count} activités</Text>
                    <Text style={globalStyles.achievement_description}>
                      {stat.distance} • {stat.speed} • {stat.pace}
                    </Text>
                  </View>
                </View>
              </View>
              {typeStats[index + 1] && (
                <View style={globalStyles.achievement_card}>
                  <View style={globalStyles.achievement_header}>
                    <Text style={globalStyles.achievement_icon}>{typeStats[index + 1].icon}</Text>
                    <View style={globalStyles.achievement_content}>
                      <Text style={globalStyles.achievement_title}>{typeStats[index + 1].title}</Text>
                      <Text style={globalStyles.achievement_value}>{typeStats[index + 1].count} activités</Text>
                      <Text style={globalStyles.achievement_description}>
                        {typeStats[index + 1].distance} • {typeStats[index + 1].speed} • {typeStats[index + 1].pace}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}
