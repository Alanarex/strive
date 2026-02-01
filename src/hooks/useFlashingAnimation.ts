/**
 * Hook for creating flashing/pulsing animations
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export type AnimationType = 'flash' | 'pulse';

export interface FlashAnimationConfig {
  /** Type of animation preset (default: 'flash') */
  type?: AnimationType;
  /** Should animation be running (default: true) */
  isActive?: boolean;
}

export interface UseFlashingAnimationResult {
  animatedValue: Animated.Value;
  scaleValue: Animated.Value;
  opacityValue: Animated.Value;
}

// Preset configurations for different animation types
const ANIMATION_PRESETS: Record<AnimationType, {
  startValue: number;
  endValue: number;
  cycleDuration: number;
  useEasing: boolean;
}> = {
  flash: {
    startValue: 1,
    endValue: 0.2,
    cycleDuration: 1600, // 800ms each direction
    useEasing: false,
  },
  pulse: {
    startValue: 1,
    endValue: 1.3,
    cycleDuration: 1200, // 600ms each direction
    useEasing: true,
  },
};

/**
 * Create a reusable flashing/pulsing animation
 * @example
 * // Use pulse animation (default)
 * const { animatedValue } = useFlashingAnimation({ isActive: true });
 * 
 * // Use flash animation
 * const { animatedValue } = useFlashingAnimation({ type: 'flash', isActive: true });
 */
export function useFlashingAnimation(config: FlashAnimationConfig = {}): UseFlashingAnimationResult {
  const {
    type = 'pulse',
    isActive = true,
  } = config;

  const preset = ANIMATION_PRESETS[type];
  const { startValue, endValue, cycleDuration, useEasing: applyEasing } = preset;

  const animatedValue = useRef(new Animated.Value(startValue)).current;
  const scaleValue = useRef(new Animated.Value(startValue)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      Animated.timing(animatedValue, {
        toValue: startValue,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    const halfDuration = cycleDuration / 2;
    const easingFn = applyEasing ? Easing.inOut(Easing.quad) : undefined;

    // For pulse animations, also animate opacity independently
    if (type === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 0.5,
            duration: halfDuration,
            easing: easingFn,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: halfDuration,
            easing: easingFn,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: endValue,
          duration: halfDuration,
          easing: easingFn,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: startValue,
          duration: halfDuration,
          easing: easingFn,
          useNativeDriver: true,
        }),
      ])
    );
    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [isActive, startValue, endValue, cycleDuration, applyEasing, animatedValue, type, opacityValue]);

  return { 
    animatedValue,
    scaleValue: type === 'pulse' ? animatedValue : scaleValue,
    opacityValue,
  };
}
