/**
 * Écran détail d'une activité - Carte et métriques
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';
import { getActivityById } from '../services/database';
import {
  formatDistance,
  formatDuration,
  msToKmh,
} from '../utils/gps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const ACTIVITY_LABELS: Record<string, string> = {
  run: 'Course',
  walk: 'Marche',
  bike: 'Vélo',
  hike: 'Randonnée',
  other: 'Autre',
};

interface Props {
  activityId: string;
  userId: string;
}

export default function ActivityDetailScreen({ activityId, userId }: Props) {
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState<Awaited<
    ReturnType<typeof getActivityById>
  >>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityById(activityId, userId).then((a) => {
      setActivity(a);
      setLoading(false);
    });
  }, [activityId, userId]);

  if (loading || !activity) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const coordinates = activity.gpsPoints.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const region = (() => {
    if (activity.gpsPoints.length === 0) return null;
    const lats = activity.gpsPoints.map((p) => p.latitude);
    const lngs = activity.gpsPoints.map((p) => p.longitude);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  })();

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={["top","bottom"]}>
      <MapView
        style={styles.map}
        initialRegion={
          region ?? {
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
      >
        {coordinates.length >= 2 && (
          <Polyline
            coordinates={coordinates}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={[styles.details, { marginBottom: insets.bottom + 8 }]}>
        <Text style={styles.type}>
          {ACTIVITY_LABELS[activity.type] ?? activity.type}
        </Text>
        <Text style={styles.date}>{formatDate(activity.startTime)}</Text>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {formatDistance(activity.distance)}
            </Text>
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {formatDuration(activity.duration)}
            </Text>
            <Text style={styles.metricLabel}>Durée</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {msToKmh(activity.averageSpeed).toFixed(1)} km/h
            </Text>
            <Text style={styles.metricLabel}>Vitesse moy.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  map: {
    height: 250,
    width: '100%',
  },
  details: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  type: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
