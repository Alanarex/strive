/**
 * Écran détail d'une activité - Carte et métriques
 */

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../constants/globalStyles';
import { getActivityById } from '../services/database';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';
import { formatActivityDetailDate } from '../utils/formatters';
import { ACTIVITY_LABELS } from '../constants/activities';
import { useLocation, useMapRegion } from '../hooks';
import { StatPanel, ActivityMap } from '../components';

interface Props {
  activityId: string;
  userId: string;
}

export default function ActivityDetailScreen({ activityId, userId }: Props) {
  const navigation = useNavigation();
  const [activity, setActivity] = useState<Awaited<
    ReturnType<typeof getActivityById>
  >>(null);
  const [loading, setLoading] = useState(true);

  // Get current location for initial map position
  const { region: currentLocation } = useLocation();

  // Calculate region from activity GPS points
  const activityRegion = useMapRegion(activity?.gpsPoints ?? []);

  useEffect(() => {
    getActivityById(activityId, userId).then((a) => {
      setActivity(a);
      setLoading(false);
    });
  }, [activityId, userId]);

  useEffect(() => {
    if (activity) {
      const title = ACTIVITY_LABELS[activity.type] ?? activity.type ?? 'Détail activité';
      // @ts-ignore - navigation typed as any here
      navigation.setOptions?.({ headerTitle: title });
    }
  }, [activity, navigation]);

  if (loading || !activity) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ActivityMap
        gpsPoints={activity.gpsPoints}
        currentLocation={currentLocation}
        trackRegion={activityRegion}
      />

      <View style={globalStyles.card}>
        <Text style={globalStyles.card_title}>
          {ACTIVITY_LABELS[activity.type] ?? activity.type}
        </Text>
        <Text style={globalStyles.date}>{formatActivityDetailDate(activity.startTime)}</Text>

        <StatPanel 
          items={[
            { value: formatDistance(activity.distance), label: 'Distance' },
            { value: formatDuration(activity.duration), label: 'Durée' },
            { value: `${msToKmh(activity.averageSpeed).toFixed(1)} km/h`, label: 'Vitesse moy.' }
          ]}
          withCard={false}
        />
      </View>
    </SafeAreaView>
  );
}

