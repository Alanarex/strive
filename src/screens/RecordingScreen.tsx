/**
 * Écran d'enregistrement - Suivi GPS en temps réel
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';
import { useRecording } from '../context/RecordingContext';
import {
  formatDistance,
  formatDuration,
  msToKmh,
} from '../utils/gps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const ACTIVITY_TYPES = [
  { key: 'run' as const, label: 'Course' },
  { key: 'walk' as const, label: 'Marche' },
  { key: 'bike' as const, label: 'Vélo' },
  { key: 'hike' as const, label: 'Randonnée' },
  { key: 'other' as const, label: 'Autre' },
];

interface Props {
  userId: string;
  onStop: (saved: boolean) => void;
}

export default function RecordingScreen({ userId, onStop }: Props) {
  const insets = useSafeAreaInsets();
  const {
    state,
    gpsPoints,
    distance,
    duration,
    averageSpeed,
    activityType,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSaveRecording,
    discardRecording,
    setActivityType,
  } = useRecording();

  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started && state === 'idle') {
      startRecording(userId, activityType).then((ok) => {
        setStarted(ok);
        if (!ok) {
          Alert.alert(
            'Permission requise',
            'Strive a besoin d\'accéder à votre localisation pour enregistrer vos activités.'
          );
          onStop(false);
        }
      });
    }
  }, [started, state, userId]);

  const handleStop = async () => {
    Alert.alert(
      'Arrêter l\'activité',
      'Voulez-vous enregistrer cette activité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await discardRecording();
            onStop(false);
          },
        },
        {
          text: 'Enregistrer',
          onPress: async () => {
            const activity = await stopAndSaveRecording(userId);
            onStop(!!activity);
            if (activity) {
              Alert.alert('Activité enregistrée !', 'Votre parcours a été sauvegardé.');
            } else if (gpsPoints.length < 2) {
              Alert.alert(
                'Données insuffisantes',
                'Pas assez de points GPS enregistrés. Continuez à bouger pour enregistrer.'
              );
            }
          },
        },
      ]
    );
  };

  const region = React.useMemo(() => {
    if (gpsPoints.length === 0) return null;
    const lats = gpsPoints.map((p) => p.latitude);
    const lngs = gpsPoints.map((p) => p.longitude);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [gpsPoints]);

  const coordinates = gpsPoints.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  const statusLabel =
    state === 'recording'
      ? 'En cours'
      : state === 'paused'
      ? 'En pause'
      : 'Préparation...';

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={["top","bottom"]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={region ?? undefined}
        showsUserLocation
        followsUserLocation={state === 'recording'}
      >
        {coordinates.length >= 2 && (
          <Polyline
            coordinates={coordinates}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={[styles.statusBadge, state === 'paused' && styles.statusPaused, { top: insets.top + 12 }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{formatDuration(duration)}</Text>
            <Text style={styles.metricLabel}>Durée</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{formatDistance(distance)}</Text>
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {duration > 0 ? `${msToKmh(averageSpeed).toFixed(1)} km/h` : '-'}
            </Text>
            <Text style={styles.metricLabel}>Vitesse</Text>
          </View>
        </View>

        {state === 'idle' && !started ? (
          <ScrollView
            horizontal
            style={styles.typeScroll}
            contentContainerStyle={styles.typeScrollContent}
          >
            {ACTIVITY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeChip,
                  activityType === t.key && styles.typeChipActive,
                ]}
                onPress={() => setActivityType(t.key)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    activityType === t.key && styles.typeChipTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.buttons}>
          {state === 'recording' && (
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={pauseRecording}
            >
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
          )}
          {state === 'paused' && (
            <TouchableOpacity
              style={[styles.button, styles.resumeButton]}
              onPress={resumeRecording}
            >
              <Text style={styles.buttonText}>Reprendre</Text>
            </TouchableOpacity>
          )}
          {(state === 'recording' || state === 'paused') && (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={styles.buttonText}>Arrêter</Text>
            </TouchableOpacity>
          )}
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
  map: {
    flex: 1,
    width: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.lg,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  statusPaused: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  controls: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  typeScroll: {
    marginBottom: SPACING.md,
  },
  typeScrollContent: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    marginRight: SPACING.sm,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
  },
  typeChipText: {
    color: COLORS.textSecondary,
  },
  typeChipTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.secondary,
  },
  stopButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
});
