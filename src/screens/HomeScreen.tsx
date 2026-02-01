/**
 * Écran d'accueil - Historique et statistiques
 */
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import { getActivitiesByUserId } from '../services/database';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';
import { PermissionSection, ActivityList, RecordingBadge, StatPanel, ActivityTypeSelector } from '../components';
import { useRecording } from '../context/RecordingContext';
import type { ActivitySummary, GlobalStats, ActivityType } from '../types';
interface Props {
  userId: string;
  onNavigateToRecord: () => void;
  onNavigateToDetail: (activityId: string) => void;
}
export default function HomeScreen({
  userId,
  onNavigateToDetail,
  onNavigateToRecord,
}: Props) {
  const { state: recordingState } = useRecording();
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'all'>('all');
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

  const filteredActivities = selectedActivityType === 'all'
    ? activities
    : activities.filter((a) => a.type === selectedActivityType);
  return (
    <SafeAreaView style={globalStyles.container}>
      <PermissionSection />
      <Text style={globalStyles.title}>Mes activités</Text>
      <StatPanel items={[
        { value: formatDistance(stats.totalDistance), label: 'Distance totale' },
        { value: formatDuration(stats.totalDuration), label: 'Temps total' },
        { value: stats.totalActivities.toString(), label: 'Activités' }
      ]} />
      <StatPanel items={[
        {
          value: stats.averageSpeed > 0 ? `${msToKmh(stats.averageSpeed).toFixed(1)} km/h` : '-',
          label: 'Vitesse moyenne globale',
          isLarge: true
        }
      ]} />
      <RecordingBadge onPress={onNavigateToRecord} />
      {recordingState !== 'recording' && recordingState !== 'paused' && (
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_primary]} onPress={onNavigateToRecord}>
          <Text style={globalStyles.btn_primary_text}>+ Nouvelle activité</Text>
        </TouchableOpacity>
      )}

      <ActivityTypeSelector
        selectedType={selectedActivityType}
        onSelectType={setSelectedActivityType}
        showAllOption={true}
      />

      <ActivityList
        activities={filteredActivities}
        userId={userId}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onNavigateToDetail={onNavigateToDetail}
        onActivityDeleted={loadData}
      />
    </SafeAreaView >
  );
}
