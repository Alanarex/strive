/**
 * Écran de connexion
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
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

interface Props {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onNavigateToSignup: () => void;
}

export default function LoginScreen({ onLogin, onNavigateToSignup }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    const ok = await onLogin(email.trim(), password);
    setLoading(false);
    if (!ok) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, { paddingTop: insets.top }]} edges={["top","bottom"]}>
      <KeyboardAvoidingView
        style={globalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <Text style={globalStyles.big_title}>Strive</Text>
      <Text style={[globalStyles.card_text, { textAlign: 'center' }]}>Connectez-vous pour continuer</Text>
      <View style={globalStyles.flex_column}>
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
          placeholder="Mot de passe"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[globalStyles.btn,globalStyles.btn_primary , loading && globalStyles.btn_disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={globalStyles.btn_primary_text}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.link_button}
          onPress={onNavigateToSignup}
        >
          <Text style={globalStyles.link_text}>
            Pas de compte ? Créer un compte
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


