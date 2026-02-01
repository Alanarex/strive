/**
 * Recording Status Badge Component - Shows recording status with pulsing animation
 * Used on RecordingScreen to display current recording state
 */

import React from 'react';
import { View, Text, Animated } from 'react-native';
import globalStyles from '../constants/globalStyles';
import { COLORS } from '../constants/theme';
import { useRecording } from '../context/RecordingContext';
import { useFlashingAnimation } from '../hooks';

export default function RecordingStatusBadge() {
  const { state } = useRecording();

  // Pulse animation for recording status
  const { scaleValue, opacityValue } = useFlashingAnimation({
    type: 'pulse',
    isActive: state === 'recording',
  });

  const statusLabel =
    state === 'recording'
      ? 'En Cours'
      : state === 'paused'
        ? 'En Pause'
        : 'Prêt';

  return (
    <View style={[globalStyles.status_badge, state === 'recording' ? globalStyles.badge_primary : state === 'paused' ? globalStyles.badge_warning : null]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={[
            globalStyles.status_dot,
            state === 'recording' ? globalStyles.status_dot_primary : state === 'paused' ? globalStyles.status_dot_warning : null,
            {
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            },
          ]}
        />

        <Text style={{
          color: state === 'recording' ? COLORS.primary : state === 'paused' ? COLORS.warning : COLORS.text,
          fontWeight: '700',
        }}>{statusLabel}</Text>
      </View>
    </View>
  );
}
