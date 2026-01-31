/**
 * Écran d'accueil expliquant les permissions de localisation
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

interface Props {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={["top","bottom"]}>
      <Text style={styles.title}>Strive</Text>
      <Text style={styles.subtitle}>
        Suivez vos activités sportives
      </Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Permissions nécessaires</Text>
        <Text style={styles.infoText}>
          Strive a besoin d'accéder à votre localisation pour :
        </Text>
        <Text style={styles.infoItem}>• Enregistrer vos parcours (course, vélo, marche...)</Text>
        <Text style={styles.infoItem}>• Calculer distance, durée et vitesse en temps réel</Text>
        <Text style={styles.infoItem}>• Continuer le suivi même écran éteint ou app en arrière-plan</Text>
        <Text style={styles.infoNote}>
          Vos données restent stockées localement sur votre appareil.
        </Text>
      </View>
      <TouchableOpacity style={[styles.button, { marginBottom: insets.bottom + 8 }]} onPress={onContinue}>
        <Text style={styles.buttonText}>Compris, continuer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoText: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  infoItem: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoNote: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});
