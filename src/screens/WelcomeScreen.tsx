/**
 * Écran d'accueil expliquant les permissions de localisation
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../constants/globalStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[globalStyles.container, { paddingTop: insets.top }]} >
      <Text style={globalStyles.big_title}>Strive</Text>
      <Text style={[globalStyles.card_text, { textAlign: 'center', marginBottom: 24 }]}>
        Suivez vos activités sportives
      </Text>
      <View style={globalStyles.card}>
        <Text style={globalStyles.card_title}>Permissions nécessaires</Text>
        <Text style={globalStyles.card_text}>
          Strive a besoin d'accéder à votre localisation pour :
        </Text>
        <View style={globalStyles.list}>
          {[
            'Enregistrer vos parcours (course, vélo, marche...)',
            'Calculer distance, durée et vitesse en temps réel',
            "Continuer le suivi même écran éteint ou app en arrière-plan",
          ].map((p) => (
            <View key={p} style={globalStyles.list_item}>
              <View style={globalStyles.list_bullet} />
              <Text style={globalStyles.list_text}>{p}</Text>
            </View>
          ))}
        </View>
        <Text style={globalStyles.card_text}>
          Vos données restent stockées localement sur votre appareil.
        </Text>
      </View>
      <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_primary,]} onPress={onContinue}>
        <Text style={globalStyles.btn_primary_text}>Compris, continuer</Text>
      </TouchableOpacity>
    </SafeAreaView >
  );
}
