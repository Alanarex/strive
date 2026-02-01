/**
 * Permission Section Component - Manages location permission requests
 * Handles all permission UI, state, and logic
 */

import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Linking,
} from 'react-native';
import globalStyles from '../constants/globalStyles';
import { COLORS, SPACING } from '../constants/theme';
import { usePermissions } from '../hooks';

export default function PermissionSection() {
    const { permissions, requestForeground, requestBackground, hasAllPermissions } = usePermissions();
    const scrollRef = useRef<ScrollView | null>(null);
    const screenW = Dimensions.get('window').width;
    const [dismissedPermissions, setDismissedPermissions] = useState<string[]>([]);
    const [activeCard, setActiveCard] = useState(0);

    const openSettings = () => {
        Linking.openSettings();
    };

    const dismissPermission = useCallback((key: string) => {
        setDismissedPermissions((prev) => {
            const next = prev.includes(key) ? prev : [...prev, key];

            // Determine remaining visible missing permissions
            const remaining: string[] = [];
            if (permissions.foreground !== true && !next.includes('foreground')) remaining.push('foreground');
            if (permissions.background !== true && !next.includes('background')) remaining.push('background');

            if (remaining.length === 0) {
                // All permissions dismissed, this component will be hidden by parent
            } else {
                setActiveCard(0);
            }

            return next;
        });
    }, [permissions]);

    // Build permission items
    const items: Array<{ key: string; title: string; text: string; action: () => Promise<void> }> = [];
    if (permissions.foreground !== true && !dismissedPermissions.includes('foreground')) {
        items.push({
            key: 'foreground',
            title: 'Localisation',
            text: 'Autorisez la localisation pour permettre l\'enregistrement en temps réel.',
            action: requestForeground,
        });
    }
    if (permissions.background !== true && !dismissedPermissions.includes('background')) {
        items.push({
            key: 'background',
            title: 'Localisation en arrière-plan',
            text: "Autorisez le suivi en arrière-plan pour continuer lorsque l'app est fermée ou en appel.",
            action: requestBackground,
        });
    }

    // Don't render if no items or all permissions granted
    if (items.length === 0 || hasAllPermissions) {
        return null;
    }

    return (
        <View style={{ paddingVertical: 0, paddingHorizontal: 0, marginHorizontal: -SPACING.md }}>
            <ScrollView
                horizontal
                pagingEnabled
                ref={(r) => { scrollRef.current = r; }}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={screenW}
                snapToAlignment="start"
                contentContainerStyle={{ width: screenW * items.length, paddingHorizontal: 0 }}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / screenW);
                    setActiveCard(idx);
                }}
            >
                {items.map((it) => (
                    <View key={it.key} style={{ width: screenW, alignItems: 'center', paddingHorizontal: 0 }}>
                        <View style={[globalStyles.card, globalStyles.flex_column, { width: screenW - (SPACING.sm * 2), marginHorizontal: 0, paddingHorizontal: SPACING.md }]}>

                            <Text style={globalStyles.card_title}>{it.title}</Text>

                            <Text style={globalStyles.card_text}>{it.text}</Text>

                            <View style={globalStyles.flex_row}>
                                <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_info, globalStyles.fill]} onPress={openSettings}>
                                    <Text style={globalStyles.btn_info_text}>Paramètres</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_primary, globalStyles.fill]} onPress={it.action}>
                                    <Text style={globalStyles.btn_primary_text}>Autoriser</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[globalStyles.btn, globalStyles.btn_danger, globalStyles.fill]} onPress={() => dismissPermission(it.key)}>
                                    <Text style={globalStyles.btn_danger_text}>Ignorer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination dots */}
            <View style={globalStyles.pagination_dots}>
                {Array.from({ length: items.length }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginHorizontal: 4,
                            backgroundColor: i === activeCard ? COLORS.primary : COLORS.border,
                        }}
                    />
                ))}
            </View>
        </View>
    );
}
