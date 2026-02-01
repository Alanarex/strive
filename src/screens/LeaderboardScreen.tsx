/**
 * Leaderboard Screen - Personal statistics and achievements
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../constants/globalStyles';
import { StatsLineChart, AchievementsList, StatsByType } from '../components';
import { getActivitiesByUserId } from '../services/database';
import { ACTIVITY_LABELS } from '../constants/activities';
import { COLORS } from '../constants/theme';
import type { ActivitySummary, ActivityType } from '../types';

interface Props {
  userId: string;
}

interface Achievement {
  title: string;
  value: string;
  icon: string;
  description: string;
}

export default function LeaderboardScreen({ userId }: Props) {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const list = await getActivitiesByUserId(userId);
      setActivities(list);
      calculateAchievements(list);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (activities: ActivitySummary[]) => {
    const actsList = activities as any[];

    if (actsList.length === 0) {
      setAchievements([]);
      return;
    }

    const totalDistance = actsList.reduce((sum, a) => sum + a.distance, 0);
    const totalDuration = actsList.reduce((sum, a) => sum + a.duration, 0);

    // Find personal bests by activity type
    const bestsByType: Record<string, ActivitySummary> = {};
    actsList.forEach((a) => {
      if (!bestsByType[a.type] || a.distance > bestsByType[a.type].distance) {
        bestsByType[a.type] = a;
      }
    });

    const achievementsList: Achievement[] = [
      {
        title: 'Total Activités',
        value: actsList.length.toString(),
        icon: '🏃',
        description: `${actsList.length} activités enregistrées`,
      },
      {
        title: 'Distance Totale',
        value: `${(totalDistance / 1000).toFixed(1)} km`,
        icon: '📍',
        description: 'Distance cumulée',
      },
      {
        title: 'Durée Totale',
        value: `${Math.floor(totalDuration / 3600)}h`,
        icon: '⏱️',
        description: `${Math.floor(totalDuration / 60)} minutes`,
      },
    ];

    // Add best distances for each activity type
    Object.entries(bestsByType).forEach(([type, activity]) => {
      achievementsList.push({
        title: `Plus Long ${ACTIVITY_LABELS[type as ActivityType] || type}`,
        value: `${(activity.distance / 1000).toFixed(2)} km`,
        icon: '🥇',
        description: `Votre meilleur ${ACTIVITY_LABELS[type as ActivityType] || type}`,
      });
    });

    setAchievements(achievementsList);
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { padding: 0 }]}>
      <ScrollView
        style={[globalStyles.scrollable_container, { padding: 0 }]}
        contentContainerStyle={globalStyles.scrollable_container}
      >
        <Text style={globalStyles.title_centered}>Statistiques</Text>

        {activities.length > 0 && (
          <StatsLineChart activities={activities} />
        )}

        <View style={globalStyles.card_transparent}>
          <Text style={globalStyles.card_title}>Réalisations</Text>
          <AchievementsList achievements={achievements} />
        </View>

        {activities.length > 0 && (
          <View style={globalStyles.section_spacing}>
            <View style={globalStyles.card_transparent}>
              <Text style={globalStyles.card_title}>Statistiques par Type</Text>
              <StatsByType activities={activities} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
