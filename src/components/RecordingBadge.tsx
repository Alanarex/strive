/**
 * Recording Badge Component - Self-contained recording activity badge
 * Handles animation, state, and styling internally
 */

import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import globalStyles from '../constants/globalStyles';
import { ACTIVITY_LABELS } from '../constants/activities';
import { useRecording } from '../context/RecordingContext';
import { useFlashingAnimation } from '../hooks';

interface Props {
  onPress: () => void;
}

export default function RecordingBadge({ onPress }: Props) {
  const { state: recordingState, activityType } = useRecording();
  
  // Flashing animation for recording badge
  const { animatedValue: flashAnim } = useFlashingAnimation({
    type: 'flash',
    isActive: recordingState === 'recording' || recordingState === 'paused',
  });

  // Only show badge when recording or paused
  if (recordingState !== 'recording' && recordingState !== 'paused') {
    return null;
  }

  return (
    <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_flashing]} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={[globalStyles.status_dot, globalStyles.status_dot_primary, { opacity: flashAnim }]}
        />
        <Text style={globalStyles.btn_flashing_text}>
          {ACTIVITY_LABELS[activityType] ?? activityType} en cours
        </Text>
      </View>
    </TouchableOpacity>
  );
}
