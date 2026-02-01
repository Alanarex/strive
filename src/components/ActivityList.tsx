/**
 * ActivityList Component - Displays list of activities with swipe-to-delete
 * Handles activity list rendering, refresh, and deletion logic
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import globalStyles from '../constants/globalStyles';
import { deleteActivity } from '../services/database';
import { formatDistance, formatDuration, msToKmh } from '../utils/gps';
import { formatActivityDate } from '../utils/formatters';
import { ACTIVITY_LABELS } from '../constants/activities';
import { COLORS, SPACING } from '../constants/theme';
import { StatPanel } from '../components';
import type { ActivitySummary } from '../types';

interface Props {
  activities: ActivitySummary[];
  userId: string;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onNavigateToDetail: (activityId: string) => void;
  onActivityDeleted: () => Promise<void>;
}

export default function ActivityList({
  activities,
  userId,
  refreshing,
  onRefresh,
  onNavigateToDetail,
  onActivityDeleted,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleDelete = (activityId: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette activité ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteActivity(activityId, userId);
            await onActivityDeleted();
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

  const renderItem = ({ item }: { item: ActivitySummary }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={globalStyles.card}
        onPress={() => onNavigateToDetail(item.id)}
      >
        <View>
          <Text style={globalStyles.card_title}>
            {ACTIVITY_LABELS[item.type] ?? item.type}
          </Text>
          <Text style={globalStyles.card_text}>{formatActivityDate(item.startTime)}</Text>
        </View>
        <StatPanel 
          items={[
            { value: formatDistance(item.distance), label: '' },
            { value: formatDuration(item.duration), label: '' },
            { value: `${msToKmh(item.averageSpeed).toFixed(1)} km/h`, label: '' }
          ]}
          withCard={false}
        />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        globalStyles.list,
        { paddingBottom: (typeof globalStyles.list_content.padding === 'number' ? globalStyles.list_content.padding : 24) + insets.bottom + 8 },
      ]}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
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
      renderItem={renderItem}
    />
  );
}