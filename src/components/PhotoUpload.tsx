/**
 * PhotoUpload Component - Avatar image picker and display
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import globalStyles from '../constants/globalStyles';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  photoUri?: string;
  onPhotoSelected: (photoUri: string) => Promise<void>;
  editable: boolean;
}

export default function PhotoUpload({
  photoUri,
  onPhotoSelected,
  editable,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        await onPhotoSelected(uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
      console.error('Image picker error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Accès à la caméra non autorisé');
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        await onPhotoSelected(uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre une photo');
      console.error('Camera error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: COLORS.surfaceLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.md,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: COLORS.border,
        }}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: '100%' }}
            onError={() =>
              Alert.alert('Erreur', 'Impossible de charger l\'image')
            }
          />
        ) : (
          <Text style={{ fontSize: 48, color: COLORS.textMuted }}>👤</Text>
        )}
        {loading && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>

      {editable && (
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <TouchableOpacity
            style={[
              globalStyles.btn,
              globalStyles.btn_info,
              { flex: 1 },
            ]}
            onPress={handlePickImage}
            disabled={loading}
          >
            <Text style={globalStyles.btn_info_text}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.btn,
              globalStyles.btn_secondary,
              { flex: 1 },
            ]}
            onPress={handleTakePhoto}
            disabled={loading}
          >
            <Text style={globalStyles.btn_secondary_text}>Caméra</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
