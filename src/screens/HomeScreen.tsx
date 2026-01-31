/**
 * Écran d'accueil - Historique et statistiques
 */

import React, { useCallback, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getActivitiesByUserId } from '../services/database';
import {
  formatDistance,
  formatDuration,
  msToKmh,
} from '../utils/gps';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import type { ActivitySummary, GlobalStats } from '../types';

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
  const insets = useSafeAreaInsets();
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalDistance: 0,
    totalDuration: 0,
    totalActivities: 0,
    averageSpeed: 0,
  });
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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={["top","bottom"]}>
      <Text style={styles.title}>Mes activités</Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statValue}>
            {formatDistance(stats.totalDistance)}
          </Text>
          <Text style={styles.statLabel}>Distance totale</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statRow}>
          <Text style={styles.statValue}>
            {formatDuration(stats.totalDuration)}
          </Text>
          <Text style={styles.statLabel}>Temps total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statRow}>
          <Text style={styles.statValue}>{stats.totalActivities}</Text>
          <Text style={styles.statLabel}>Activités</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statLabel}>Vitesse moyenne globale</Text>
        <Text style={styles.statValueLarge}>
          {stats.averageSpeed > 0
            ? `${msToKmh(stats.averageSpeed).toFixed(1)} km/h`
            : '-'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={onNavigateToRecord}
      >
        <Text style={styles.recordButtonText}>+ Nouvelle activité</Text>
      </TouchableOpacity>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (styles.listContent.padding || 0) + insets.bottom + 8 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucune activité enregistrée.{'\n'}Lancez une nouvelle activité !
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => onNavigateToDetail(item.id)}
          >
            <View style={styles.activityHeader}>
              <Text style={styles.activityType}>
                {ACTIVITY_LABELS[item.type] ?? item.type}
              </Text>
              <Text style={styles.activityDate}>{formatDate(item.startTime)}</Text>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityStat}>
                {formatDistance(item.distance)}
              </Text>
              <Text style={styles.activityStat}>
                {formatDuration(item.duration)}
              </Text>
              <Text style={styles.activityStat}>
                {msToKmh(item.averageSpeed).toFixed(1)} km/h
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: SPACING.lg,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statRow: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statValueLarge: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  recordButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  recordButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.xl,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityType: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  activityStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  activityStat: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
