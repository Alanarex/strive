/**
 * StatPanel Component - Reusable statistics panel with flexible layout
 * Supports both multi-item panels with separators and single-item panels
 */

import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../constants/globalStyles';

export interface StatItem {
  value: string;
  label: string;
  isLarge?: boolean;
}

interface Props {
  items: StatItem[];
  /** Whether to wrap in a card container (default: true) */
  withCard?: boolean;
  /** Custom style for the container */
  style?: any;
}

export default function StatPanel({ items, withCard = true, style }: Props) {
  // Check if any items have labels
  const hasLabels = items.some(item => item.label && item.label.trim() !== '');

  const renderContent = () => {
    if (items.length === 1) {
      // Single item layout (like average speed)
      const item = items[0];
      return (
        <View style={[globalStyles.panel_row, style]}>
          {hasLabels && <Text style={globalStyles.panel_label}>{item.label}</Text>}
          <Text style={item.isLarge ? globalStyles.panel_value_large : globalStyles.panel_value}>
            {item.value}
          </Text>
        </View>
      );
    }

    // Multi-item layout with separators
    return (
      <View style={[globalStyles.panel_row, style]}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <View style={globalStyles.panel_item}>
              <Text style={globalStyles.panel_value}>{item.value}</Text>
              {hasLabels && <Text style={globalStyles.panel_label}>{item.label}</Text>}
            </View>
            {index < items.length - 1 && <View style={globalStyles.separator} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  if (withCard) {
    return (
      <View style={globalStyles.card}>
        {renderContent()}
      </View>
    );
  }

  return renderContent();
}