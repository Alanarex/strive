/**
 * Écran Profil / Réglages - Gestion des infos et permissions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface Props {
  userName: string;
  userEmail: string;
  onUpdateProfile: (updates: {
    name?: string;
    email?: string;
  }) => Promise<void>;
  onLogout: () => void;
}

export default function ProfileScreen({
  userName,
  userEmail,
  onUpdateProfile,
  onLogout,
}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
  }, [userName, userEmail]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Nom et email requis');
      return;
    }
    setSaving(true);
    await onUpdateProfile({ name: name.trim(), email: email.trim() });
    setSaving(false);
    setEditing(false);
    Alert.alert('Profil mis à jour');
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
          editable={editing}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={editing}
        />
        {editing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setName(userName);
                setEmail(userEmail);
                setEditing(false);
              }}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Autorisations</Text>
        <Text style={styles.permissionText}>
          Strive utilise les autorisations suivantes :
        </Text>
        <Text style={styles.permissionItem}>• Localisation : enregistrement des parcours GPS</Text>
        <Text style={styles.permissionItem}>• Localisation en arrière-plan : suivi écran éteint</Text>
        <Text style={styles.permissionItem}>• Notifications (optionnel) : rappels</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={openSettings}
        >
          <Text style={styles.settingsButtonText}>
            Gérer les autorisations dans Réglages
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Déconnexion',
            'Voulez-vous vous déconnecter ?',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Déconnexion', style: 'destructive', onPress: onLogout },
            ]
          );
        }}
      >
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  permissionText: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  permissionItem: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontSize: FONT_SIZES.sm,
  },
  settingsButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});
