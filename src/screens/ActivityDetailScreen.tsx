/**
 * Écran détail d'une activité - Carte et métriques
 */

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';
import { getActivityById } from '../services/database';
import {
  formatDistance,
  formatDuration,
  msToKmh,
} from '../utils/gps';
import { COLORS } from '../constants/theme';
import globalStyles from '../constants/globalStyles';

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [initialRegionState, setInitialRegionState] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
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

  useEffect(() => {
    if (activity) {
      const title = ACTIVITY_LABELS[activity.type] ?? activity.type ?? 'Détail activité';
      // @ts-ignore - navigation typed as any here
      navigation.setOptions?.({ headerTitle: title });
    }
  }, [activity, navigation]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted || !pos) return;
        setInitialRegionState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        console.warn('Failed to get initial location for ActivityDetail', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading || !activity) {
    return (
      <View style={globalStyles.centered}>
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
    <SafeAreaView style={globalStyles.container}>
      <MapView
        style={globalStyles.map}
        initialRegion={
          initialRegionState ?? region ?? {
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

      <View style={globalStyles.card}>
        <Text style={globalStyles.card_title}>
          {ACTIVITY_LABELS[activity.type] ?? activity.type}
        </Text>
        <Text style={globalStyles.date}>{formatDate(activity.startTime)}</Text>

        <View style={globalStyles.panel_row}>
          <View style={globalStyles.panel_item}>
            <Text style={globalStyles.panel_value}>
              {formatDistance(activity.distance)}
            </Text>
            <Text style={globalStyles.panel_label}>Distance</Text>
          </View>
          <View style={globalStyles.panel_item  }>
            <Text style={globalStyles.panel_value}>
              {formatDuration(activity.duration)}
            </Text>
            <Text style={globalStyles.panel_label }>Durée</Text>
          </View>
          <View style={globalStyles.panel_item}>
            <Text style={globalStyles.panel_value}>
              {msToKmh(activity.averageSpeed).toFixed(1)} km/h
            </Text>
            <Text style={globalStyles.panel_label}>Vitesse moy.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

