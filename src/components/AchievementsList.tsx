/**
 * AchievementsList Component - Displays list of achievements in 2-column grid
 */
import React from 'react';
import { View, Text } from 'react-native';
import globalStyles from '../constants/globalStyles';
import { SPACING } from '../constants/theme';

interface Achievement {
    title: string;
    value: string;
    icon: string;
    description: string;
}

interface Props {
    achievements: Achievement[];
}

export default function AchievementsList({ achievements }: Props) {
    if (achievements.length === 0) {
        return (
            <Text style={[globalStyles.card_text, { textAlign: 'center' }]}>
                Aucune activité pour le moment. Commencez à enregistrer vos activités!
            </Text>
        );
    }

    return (
        <View style={globalStyles.flex_column}>
            {achievements.map((achievement, index) => {
                // Render a row for every 2 items
                if (index % 2 === 0) {
                    return (
                        <View key={`row-${index}`} style={globalStyles.flex_row}>
                            <View style={globalStyles.achievement_card}>
                                <View style={globalStyles.achievement_header}>
                                    <Text style={globalStyles.achievement_icon}>{achievement.icon}</Text>
                                    <View style={globalStyles.achievement_content}>
                                        <Text style={globalStyles.achievement_title}>{achievement.title}</Text>
                                        <Text style={globalStyles.achievement_value}>{achievement.value}</Text>
                                        <Text style={globalStyles.achievement_description}>
                                            {achievement.description}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {achievements[index + 1] && (
                                <View style={globalStyles.achievement_card}>
                                    <View style={globalStyles.achievement_header}>
                                        <Text style={globalStyles.achievement_icon}>{achievements[index + 1].icon}</Text>
                                        <View style={globalStyles.achievement_content}>
                                            <Text style={globalStyles.achievement_title}>{achievements[index + 1].title}</Text>
                                            <Text style={globalStyles.achievement_value}>{achievements[index + 1].value}</Text>
                                            <Text style={globalStyles.achievement_description}>
                                                {achievements[index + 1].description}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                }
                return null;
            })}
        </View>
    );
}
