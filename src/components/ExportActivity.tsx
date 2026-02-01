/**
 * Export Activity Component - UI for exporting activities in various formats
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import globalStyles from '../constants/globalStyles';
import {
  generateGPX,
  generateCSV,
  generateReport,
  getExportFilename,
} from '../utils/exportUtils';
import type { Activity } from '../types';

interface Props {
  activity: Activity;
}

export default function ExportActivity({ activity }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'gpx' | 'csv' | 'txt') => {
    try {
      setExporting(true);

      let content = '';
      let mimeType = 'text/plain';

      if (format === 'gpx') {
        content = generateGPX(activity);
        mimeType = 'application/gpx+xml';
      } else if (format === 'csv') {
        content = generateCSV(activity);
        mimeType = 'text/csv';
      } else {
        content = generateReport(activity);
        mimeType = 'text/plain';
      }

      const filename = getExportFilename(activity, format);
      // Use Share directly without saving to file system
      const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;

      try {
        // Try to share the data directly
        const result = await Share.share({
          message: content,
          title: `Exporter ${filename}`,
          url: dataUrl,
        });

        if (result.action === Share.dismissedAction) {
          Alert.alert('Export annulé');
        } else {
          Alert.alert('Succès', 'Fichier exporté avec succès');
        }
      } catch (error) {
        console.error('Share error:', error);
        // Fallback: show as text alert
        Alert.alert(
          'Contenu à exporter',
          `Format: ${format.toUpperCase()}\n\nVous pouvez copier le contenu ci-dessous.\n\n${content.substring(0, 100)}...`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter le fichier');
    } finally {
      setExporting(false);
    }
  };

  if (exporting) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.lg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[globalStyles.card_text, { marginTop: SPACING.md }]}>
          Export en cours...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: SPACING.md }}>
      <Text style={globalStyles.card_title}>Exporter l'activité</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm, marginTop: SPACING.md }}>
        <TouchableOpacity
          style={[globalStyles.btn, globalStyles.btn_info, globalStyles.fill]}
          onPress={() => handleExport('gpx')}
        >
          <Text style={globalStyles.btn_info_text}>GPX</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.btn, globalStyles.btn_secondary, globalStyles.fill]}
          onPress={() => handleExport('csv')}
        >
          <Text style={globalStyles.btn_secondary_text}>CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.btn, globalStyles.btn_primary, globalStyles.fill]}
          onPress={() => handleExport('txt')}
        >
          <Text style={globalStyles.btn_primary_text}>Rapport</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
