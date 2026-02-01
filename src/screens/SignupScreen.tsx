/**
 * Écran de création de compte
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface Props {
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  onNavigateToLogin: () => void;
}

export default function SignupScreen({ onSignup, onNavigateToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    const ok = await onSignup(name.trim(), email.trim(), password);
    setLoading(false);
    if (!ok) {
      Alert.alert('Erreur', 'Cet email est déjà utilisé');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={globalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[globalStyles.scrollable_container]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={globalStyles.big_title}>Créer un compte</Text>
          <Text style={[globalStyles.card_text, { textAlign: 'center', marginBottom: 12 }]}>Rejoignez Strive pour suivre vos activités</Text>
          <View style={globalStyles.flex_column}>
            <TextInput
              style={globalStyles.input}
              placeholder="Nom"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Mot de passe (min. 6 caractères)"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btn_primary, loading && globalStyles.btn_disabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={globalStyles.btn_primary_text}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.link_button}
              onPress={onNavigateToLogin}
            >
              <Text style={globalStyles.link_text}>
                Déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


