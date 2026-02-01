/**
 * ActivityTypeSelector Component - Reusable activity type selection UI
 */

import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import { ACTIVITY_TYPES } from '../constants/activities';
import type { ActivityType } from '../types';

interface Props {
  selectedType: ActivityType | 'all';
  onSelectType: (type: ActivityType | 'all') => void;
  showAllOption?: boolean;
  editable?: boolean;
}

export default function ActivityTypeSelector({
  selectedType,
  onSelectType,
  showAllOption = true,
  editable = true,
}: Props) {
  if (!editable) return null;

  return (
    <ScrollView
      horizontal
      style={globalStyles.tags_scrollview}
      contentContainerStyle={globalStyles.tags_container}
      showsHorizontalScrollIndicator={false}
    >
      {showAllOption && (
        <TouchableOpacity
          style={[
            globalStyles.tag_chip,
            selectedType === 'all' && globalStyles.tag_chip_active,
          ]}
          onPress={() => onSelectType('all')}
        >
          <Text
            style={[
              globalStyles.tag_chip_text,
              selectedType === 'all' && globalStyles.tag_chip_text_active,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
      )}

      {ACTIVITY_TYPES.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[
            globalStyles.tag_chip,
            selectedType === t.key && globalStyles.tag_chip_active,
          ]}
          onPress={() => onSelectType(t.key)}
        >
          <Text
            style={[
              globalStyles.tag_chip_text,
              selectedType === t.key && globalStyles.tag_chip_text_active,
            ]}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
