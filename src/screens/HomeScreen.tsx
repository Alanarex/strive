/**
 * Écran d'accueil - Historique et statistiques
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  getForegroundPermissionStatus,
  getBackgroundPermissionStatus,
  requestForegroundPermissions,
  requestBackgroundPermissions,
} from '../services/locationService';
import globalStyles from '../constants/globalStyles';
import { getActivitiesByUserId, deleteActivity } from '../services/database';
import {
  formatDistance,
  formatDuration,
  msToKmh,
} from '../utils/gps';
import { Alert, ActivityIndicator } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import type { ActivitySummary, GlobalStats } from '../types';
import { useRecording } from '../context/RecordingContext';

const ACTIVITY_LABELS: Record<string, string> = {
  run: 'Course',
  walk: 'Marche',
  bike: 'Vélo',
  hike: 'Randonnée',
  other: 'Autre',
};

interface Props {
  userId: string;
  onNavigateToDetail: (activityId: string) => void;
  onNavigateToRecord: () => void;
}

export default function HomeScreen({
  userId,
  onNavigateToDetail,
  onNavigateToRecord,
}: Props) {
  const { state: recordingState, activityType } = useRecording();
  const insets = useSafeAreaInsets();
  const [hasForegroundPerm, setHasForegroundPerm] = useState<boolean | null>(null);
  const [hasBackgroundPerm, setHasBackgroundPerm] = useState<boolean | null>(null);
  const [showPermissionSection, setShowPermissionSection] = useState(true);
  const [dismissedPermissions, setDismissedPermissions] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);
  const anim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
  const screenW = Dimensions.get('window').width;
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalDistance: 0,
    totalDuration: 0,
    totalActivities: 0,
    averageSpeed: 0,
  });
  const [activeCard, setActiveCard] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const list = await getActivitiesByUserId(userId);
    setActivities(
      list.map((a) => ({
        id: a.id,
        type: a.type,
        distance: a.distance,
        duration: a.duration,
        averageSpeed: a.averageSpeed,
        startTime: a.startTime,
      }))
    );
    const totalDist = list.reduce((s, a) => s + a.distance, 0);
    const totalDur = list.reduce((s, a) => s + a.duration, 0);
    setStats({
      totalDistance: totalDist,
      totalDuration: totalDur,
      totalActivities: list.length,
      averageSpeed: totalDur > 0 ? totalDist / totalDur : 0,
    });
  }, [userId]);

  const checkPermissions = useCallback(async () => {
    try {
      const fg = await getForegroundPermissionStatus();
      const bg = await getBackgroundPermissionStatus();
      setHasForegroundPerm(fg);
      setHasBackgroundPerm(bg);
    } catch (e) {
      setHasForegroundPerm(false);
      setHasBackgroundPerm(false);
    }
  }, []);

  // auto-advance and collapse logic
  useEffect(() => {
    const missing = [] as string[];
    if (hasForegroundPerm !== true) missing.push('foreground');
    if (hasBackgroundPerm !== true) missing.push('background');

    if (missing.length === 0) {
      // animate out then hide
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setShowPermissionSection(false);
      });
      return;
    }

    // ensure visible
    setShowPermissionSection(true);
    anim.setValue(1);

    // always show the first missing permission (scroll to 0 because we render only missing cards)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  }, [hasForegroundPerm, hasBackgroundPerm, anim]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Flashing animation for recording badge
  useEffect(() => {
    if (recordingState === 'recording' || recordingState === 'paused') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [recordingState, flashAnim]);

  const openSettings = () => {
    Linking.openSettings();
  };

  const dismissPermission = (key: string) => {
    setDismissedPermissions((prev) => {
      const next = prev.includes(key) ? prev : [...prev, key];

      // determine remaining visible missing permissions
      const remaining: string[] = [];
      if (hasForegroundPerm !== true && !next.includes('foreground')) remaining.push('foreground');
      if (hasBackgroundPerm !== true && !next.includes('background')) remaining.push('background');

      if (remaining.length === 0) {
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowPermissionSection(false);
        });
      } else {
        // small feedback animation and reset active card
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.9, duration: 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        setActiveCard(0);
      }

      return next;
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (activityId: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette activité ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await deleteActivity(activityId, userId);
            await loadData();
          } catch (e) {
            console.warn('Failed to delete activity', e);
          }
        }
      }
    ]);
  };

  const renderRightActions = (id: string) => (
    <RectButton style={globalStyles.delete_button} onPress={() => handleDelete(id)}>
      <MaterialIcons name="delete" size={22} color={COLORS.text} accessibilityLabel="Supprimer" />
    </RectButton>
  );

  return (
    <SafeAreaView style={globalStyles.container}>

      {showPermissionSection && ((hasForegroundPerm !== true) || (hasBackgroundPerm !== true)) ? (
        <Animated.View style={[{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }, { paddingVertical: 0, paddingHorizontal: 0, marginHorizontal: -SPACING.md }]}>
          {/* Build list of missing permission cards dynamically */}
          {(() => {
            const items: Array<{ key: string; title: string; text: string; action: () => Promise<void> }> = [];
            if (hasForegroundPerm !== true && !dismissedPermissions.includes('foreground')) {
              items.push({
                key: 'foreground',
                title: 'Localisation',
                text: 'Autorisez la localisation pour permettre l\'enregistrement en temps réel.',
                action: async () => { await requestForegroundPermissions(); setTimeout(checkPermissions, 400); },
              });
            }
            if (hasBackgroundPerm !== true && !dismissedPermissions.includes('background')) {
              items.push({
                key: 'background',
                title: 'Localisation en arrière-plan',
                text: "Autorisez le suivi en arrière-plan pour continuer lorsque l'app est fermée ou en appel.",
                action: async () => { await requestBackgroundPermissions(); setTimeout(checkPermissions, 400); },
              });
            }

            if (items.length === 0) return null;

            return (
              <View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  ref={(r) => { scrollRef.current = r; }}
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={screenW}
                  snapToAlignment="start"
                  contentContainerStyle={{ width: screenW * items.length, paddingHorizontal: 0 }}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / screenW);
                    setActiveCard(idx);
                  }}
                >
                  {items.map((it) => (
                    <View key={it.key} style={{ width: screenW, alignItems: 'center', paddingHorizontal: 0 }}>
                      <View style={[globalStyles.card, globalStyles.flex_column, { width: screenW - (SPACING.sm * 2), marginHorizontal: 0, paddingHorizontal: SPACING.md }]}>

                        <Text style={globalStyles.card_title}>{it.title}</Text>

                        <Text style={globalStyles.card_text}>{it.text}</Text>

                        <View style={globalStyles.flex_row}>
                          <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_info, { flex: 1 }]} onPress={openSettings}>
                            <Text style={globalStyles.btn_info_text}>Paramètres</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_primary, { flex: 1, marginLeft: SPACING.sm }]} onPress={it.action}>
                            <Text style={globalStyles.btn_primary_text}>Autoriser</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_danger, { flex: 1, marginLeft: SPACING.sm }]} onPress={() => dismissPermission(it.key)}>
                            <Text style={globalStyles.btn_danger_text}>Ignorer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* pagination dots */}
                <View style={globalStyles.pagination_dots}>
                  {Array.from({ length: items.length }).map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor: i === activeCard ? COLORS.primary : COLORS.border,
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })()}
        </Animated.View>
      ) : null}

      <Text style={globalStyles.title}>Mes activités</Text>

      <View style={[globalStyles.card, globalStyles.panel_row]}>
        <View style={globalStyles.panel_item}>
          <Text style={globalStyles.panel_value}>
            {formatDistance(stats.totalDistance)}
          </Text>
          <Text style={globalStyles.panel_label}>Distance totale</Text>
        </View>
        <View style={globalStyles.separator} />
        <View style={globalStyles.panel_item}>
          <Text style={globalStyles.panel_value}>
            {formatDuration(stats.totalDuration)}
          </Text>
          <Text style={globalStyles.panel_label}>Temps total</Text>
        </View>
        <View style={globalStyles.separator} />
        <View style={globalStyles.panel_item}>
          <Text style={globalStyles.panel_value}>{stats.totalActivities}</Text>
          <Text style={globalStyles.panel_label}>Activités</Text>
        </View>
      </View>

      <View style={[globalStyles.card, globalStyles.panel_row]}>
        <Text style={globalStyles.panel_label}>Vitesse moyenne globale</Text>
        <Text style={globalStyles.panel_value_large}>
          {stats.averageSpeed > 0
            ? `${msToKmh(stats.averageSpeed).toFixed(1)} km/h`
            : '-'}
        </Text>
      </View>

      {recordingState === 'recording' || recordingState === 'paused' ? (
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_flashing]} onPress={onNavigateToRecord}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View
              style={[globalStyles.status_dot, globalStyles.status_dot_primary, { opacity: flashAnim }]}
            />
            <Text style={globalStyles.btn_flashing_text}>
              {ACTIVITY_LABELS[activityType] ?? activityType} en cours
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_primary]} onPress={onNavigateToRecord}>
          <Text style={globalStyles.btn_primary_text}>+ Nouvelle activité</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          globalStyles.list,
          { paddingBottom: (globalStyles.list_content.padding || 0) + insets.bottom + 8 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.surface}
          />
        }

        ListEmptyComponent={
          <Text style={[globalStyles.card_text, { textAlign: 'center', marginTop: SPACING.md }]}>
            Aucune activité enregistrée.{'\n'}Lancez une nouvelle activité !
          </Text>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity
              style={globalStyles.card}
              onPress={() => onNavigateToDetail(item.id)}
            >
              <View>
                <Text style={globalStyles.card_title}>
                  {ACTIVITY_LABELS[item.type] ?? item.type}
                </Text>
                <Text style={globalStyles.card_text}>{formatDate(item.startTime)}</Text>
              </View>
              <View style={globalStyles.panel_row}>
                <Text style={globalStyles.panel_value}>
                  {formatDistance(item.distance)}
                </Text>
                <Text style={globalStyles.panel_value}>
                  {formatDuration(item.duration)}
                </Text>
                <Text style={globalStyles.panel_value}>
                  {msToKmh(item.averageSpeed).toFixed(1)} km/h
                </Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </SafeAreaView >
  );
}


