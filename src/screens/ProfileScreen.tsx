/**
 * Écran Profil / Réglages - Gestion des infos et permissions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={globalStyles.container}>

      <Text style={globalStyles.title}>Profil</Text>

      <View style={globalStyles.card}>
        <Text style={globalStyles.card_title}>Informations personnelles</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Nom"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
          editable={editing}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={editing}
        />
        {editing ? (
          <View style={globalStyles.flex_row}>

            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_info]}
              onPress={() => {
                setName(userName);
                setEmail(userEmail);
                setEditing(false);
              }}
            >
              <Text style={globalStyles.btn_info_text}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_primary, globalStyles.fill]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={globalStyles.btn_primary_text}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        )
          :
          (
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_primary]}
              onPress={() => setEditing(true)}
            >
              <Text style={globalStyles.btn_primary_text}>Modifier</Text>
            </TouchableOpacity>
          )}
      </View>

      <View style={globalStyles.card}>

        <Text style={globalStyles.card_title}>Autorisations</Text>

        <Text style={globalStyles.card_text}>Strive utilise les autorisations suivantes :</Text>

        <View style={globalStyles.list}>
          {[
            'Localisation : enregistrement des parcours GPS',
            "Localisation en arrière-plan : suivi écran éteint",
            'Notifications (optionnel) : rappels',
          ].map((p) => (
            <View key={p} style={globalStyles.list_item}>
              <View style={globalStyles.list_bullet} />
              <Text style={globalStyles.list_text}>{p}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[globalStyles.btn, globalStyles.btn_info]}
          onPress={openSettings}>
          <Text style={globalStyles.btn_info_text}>Paramètres</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.btn, globalStyles.btn_secondary, { marginTop: SPACING.sm }]}
          onPress={() => {
            Alert.alert(
              'Afficher l\'écran de bienvenue',
              "Cette action réinitialisera l'écran d'accueil de bienvenue et rechargera l'application.",
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Afficher',
                  style: 'default',
                  onPress: async () => {
                    try {
                      await AsyncStorage.removeItem('strive_welcome_seen');
                      if (Updates.reloadAsync) {
                        await Updates.reloadAsync();
                      } else {
                        DevSettings.reload();
                      }
                    } catch (e) {
                      console.warn('Failed to reset welcome flag', e);
                      try { DevSettings.reload(); } catch {}
                    }
                  },
                },
              ]
            );
          }}
        >
          <Text style={globalStyles.btn_secondary_text}>Afficher l'écran Bienvenue</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[globalStyles.btn, globalStyles.btn_danger]}
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
        <Text style={globalStyles.btn_danger_text}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}