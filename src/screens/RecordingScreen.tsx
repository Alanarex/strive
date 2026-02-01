/**
 * Écran d'enregistrement - Suivi GPS en temps réel
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import globalStyles from '../constants/globalStyles';
import { useRecording } from '../context/RecordingContext';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';
import { ACTIVITY_TYPES } from '../constants/activities';
import { useLocation, useMapRegion } from '../hooks';
import { RecordingStatusBadge, StatPanel, ActivityMap } from '../components';

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
  const mapRef = useRef<MapView | null>(null);

  // Use location hook for current position (poll when idle)
  const { region: currentLocation, error: locationError } = useLocation({
    enablePolling: state === 'idle' && !started,
    pollingInterval: 4000,
  });

  // Calculate region from GPS points when recording
  const trackRegion = useMapRegion(gpsPoints);

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

  const handleStart = async () => {
    const ok = await startRecording(userId, activityType);
    setStarted(!!ok);
    if (!ok) {
      Alert.alert(
        'Permission requise',
        'Strive a besoin d\'accéder à votre localisation pour enregistrer vos activités.'
      );
      onStop(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} >
      <RecordingStatusBadge />

      <ActivityMap
        gpsPoints={gpsPoints}
        currentLocation={currentLocation}
        trackRegion={trackRegion}
        showsUserLocation
        followsUserLocation={state === 'recording'}
        isRecording
        mapRef={mapRef}
      />

      {locationError && (
        <View style={[globalStyles.warning_banner, { top: insets.top + 56 }]}>
          <Text style={globalStyles.warning_banner_text}>{locationError}</Text>
        </View>
      )}

      <View style={globalStyles.card}>
        <StatPanel 
          items={[
            { value: formatDuration(duration), label: 'Durée' },
            { value: formatDistance(distance), label: 'Distance' },
            { value: duration > 0 ? `${msToKmh(averageSpeed).toFixed(1)} km/h` : '-', label: 'Vitesse' }
          ]}
          withCard={false}
        />

        {state === 'idle' && !started ? (
          <ScrollView
            horizontal
            contentContainerStyle={globalStyles.tags_container}
            showsHorizontalScrollIndicator={false}
          >
            {ACTIVITY_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  globalStyles.tag_chip,
                  activityType === t.key && globalStyles.tag_chip_active,
                ]}
                onPress={() => setActivityType(t.key)}
              >
                <Text
                  style={[
                    globalStyles.tag_chip_text,
                    activityType === t.key && globalStyles.tag_chip_text_active,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <View style={[globalStyles.flex_row, { justifyContent: 'center' }]}>
          {state === 'idle' && !started && (
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_primary]}
              onPress={handleStart}
            >
              <Text style={globalStyles.btn_primary_text}>Démarrer</Text>
            </TouchableOpacity>
          )}
          {state === 'recording' && (
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_info]}
              onPress={pauseRecording}
            >
              <Text style={globalStyles.btn_info_text}>Pause</Text>
            </TouchableOpacity>
          )}
          {state === 'paused' && (
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_secondary]}
              onPress={resumeRecording}
            >
              <Text style={globalStyles.btn_secondary_text}>Reprendre</Text>
            </TouchableOpacity>
          )}
          {(state === 'recording' || state === 'paused') && (
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_danger]}
              onPress={handleStop}
            >
              <Text style={globalStyles.btn_danger_text}>Arrêter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

