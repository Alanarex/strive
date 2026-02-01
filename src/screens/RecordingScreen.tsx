/**
 * Écran d'enregistrement - Suivi GPS en temps réel
 */

import React, { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
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
  const [initialRegionState, setInitialRegionState] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(1));
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);
  const mapRef = useRef<MapView | null>(null);

  // Do not auto-start recording on mount. User must press Start.

  // fetch device current location for initial map region
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        if (!mounted || !pos) return;
        setInitialRegionState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        // animate map to the fetched location if map is mounted
        if (mapRef.current) {
          try {
            mapRef.current.animateToRegion({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 500);
          } catch (err) {
            // ignore animation errors
          }
        }
      } catch (e) {
        console.warn('Failed to get initial location', e);
        setLocationWarning('Impossible de récupérer la position initiale. Vérifiez vos permissions.');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ensure map recenters if initialRegionState changes later
  useEffect(() => {
    if (initialRegionState && mapRef.current) {
      try {
        mapRef.current.animateToRegion(initialRegionState, 500);
      } catch (e) {
        // ignore
      }
    }
  }, [initialRegionState]);

  // While idle and not started, poll current position every 4s and refresh the map
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      timer = setInterval(async () => {
        try {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!mounted || !pos) return;
          const region = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setInitialRegionState(region);
          if (mapRef.current) {
            try { mapRef.current.animateToRegion(region, 500); } catch (e) { /* ignore */ }
          }
        } catch (e) {
          // ignore position errors while polling
        }
      }, 4000);
    };

    if (state === 'idle' && !started) startPolling();

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [state, started]);

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
      ? 'En Cours'
      : state === 'paused'
        ? 'En Pause'
        : !started
          ? 'Prêt'
          : 'Préparation...';

  // animate pulse while recording
  useEffect(() => {
    if (state === 'recording') {
      pulseAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse.current, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse.current, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.current.start();
    } else {
      if (pulseAnim.current) {
        pulseAnim.current.stop();
        pulseAnim.current = null;
      }
      Animated.timing(pulse.current, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
    return () => {
      if (pulseAnim.current) pulseAnim.current.stop();
    };
  }, [state]);

  const animatedDotStyle = React.useMemo(() => ({
    transform: [{ scale: pulse.current }],
    opacity: pulse.current.interpolate({ inputRange: [1, 1.3], outputRange: [0.5, 1] }),
  }), [pulse]);

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
      <View style={[globalStyles.status_badge, state === 'recording' ? globalStyles.badge_primary : state === 'paused' ? globalStyles.badge_warning : null]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View
            style={[globalStyles.status_dot, animatedDotStyle, state === 'recording' ? globalStyles.status_dot_primary : state === 'paused' ? globalStyles.status_dot_warning : null]}
          />

          <Text style={{
            color: state === 'recording' ? COLORS.primary : state === 'paused' ? COLORS.warning : COLORS.text,
            fontWeight: '700',
          }}>{statusLabel}</Text>
        </View>
      </View>

      <MapView
        ref={(r) => { mapRef.current = r; }}
        style={globalStyles.map}
        initialRegion={initialRegionState ?? {
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

      {locationWarning && (
        <View style={[globalStyles.warning_banner, { top: insets.top + 56 }]}>
          <Text style={globalStyles.warning_banner_text}>{locationWarning}</Text>
        </View>
      )}

      <View style={globalStyles.card}>
        <View style={globalStyles.panel_row}>
          <View style={globalStyles.panel_item}>
            <Text style={globalStyles.panel_value}>{formatDuration(duration)}</Text>
            <Text style={globalStyles.panel_label}>Durée</Text>
          </View>
          <View style={globalStyles.panel_item}>
            <Text style={globalStyles.panel_value}>{formatDistance(distance)}</Text>
            <Text style={globalStyles.panel_label}>Distance</Text>
          </View>
          <View style={globalStyles.panel_item}>
            <Text style={globalStyles.panel_value}>
              {duration > 0 ? `${msToKmh(averageSpeed).toFixed(1)} km/h` : '-'}
            </Text>
            <Text style={globalStyles.panel_label}>Vitesse</Text>
          </View>
        </View>

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

