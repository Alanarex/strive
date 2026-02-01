import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from './theme';

export default StyleSheet.create({
    // ========================================
    // LAYOUT & CONTAINERS
    // ========================================
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'stretch',
        gap: SPACING.md,
        justifyContent: 'center',
        padding: SPACING.md,
    },

    scrollable_container: {
        backgroundColor: COLORS.background,
        gap: SPACING.md,
        padding: SPACING.md,
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },

    // ========================================
    // FLEXBOX UTILITIES
    // ========================================
    flex_row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },

    flex_row_wrap: {
        flexDirection: 'row',
        gap: SPACING.md,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    flex_column: {
        flexDirection: 'column',
        gap: SPACING.md,
    },

    fill: {
        flex: 1,
    },

    stat_item_half: {
        width: '48%',
    },

    section_spacing: {
        marginTop: SPACING.lg,
    },

    separator: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.border,
    },

    // ========================================
    // CARD & SURFACE STYLES
    // ========================================
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.md,
        width: '100%',
        height: 'auto',
    },

    card_transparent: {
        backgroundColor: 'transparent',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.md,
        width: '100%',
        height: 'auto',
    },

    card_title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },

    card_text: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '400',
        color: COLORS.textSecondary,
    },

    // ========================================
    // TYPOGRAPHY & TEXT STYLES
    // ========================================
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    title_centered: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },

    big_title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },

    date: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        marginBottom: SPACING.md,
    },

    link_text: {
        color: COLORS.secondary,
        fontSize: FONT_SIZES.md,
    },

    // ========================================
    // BUTTON STYLES
    // ========================================
    btn: {
        height: 50,
        width: 'auto',
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        alignSelf: 'stretch',
    },

    btn_disabled: {
        opacity: 0.6,
    },

    btn_primary: {
        backgroundColor: COLORS.primary,
    },

    btn_primary_text: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },

    btn_secondary: {
        backgroundColor: COLORS.secondary,
    },

    btn_secondary_text: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: FONT_SIZES.md,
    },

    btn_info: {
        backgroundColor: COLORS.surfaceLight,
    },

    btn_info_text: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: FONT_SIZES.md,
    },

    btn_danger: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.error,
    },

    btn_danger_text: {
        color: COLORS.error,
        fontWeight: '600',
        fontSize: FONT_SIZES.md,
    },

    link_button: {
        padding: SPACING.md,
        alignItems: 'center',
    },

    delete_button: {
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: 'auto',
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },

    btn_flashing: {
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },

    btn_flashing_text: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // ========================================
    // INPUT STYLES
    // ========================================
    input: {
        width: '100%',
        height: 44,
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // ========================================
    // LIST STYLES
    // ========================================
    list: {
        flexDirection: 'column',
    },

    list_item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.xs,
    },

    list_bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.textSecondary,
        marginRight: SPACING.sm,
        marginVertical: 'auto',
    },

    list_text: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZES.sm,
        flex: 1,
    },

    list_content: {
        padding: SPACING.lg,
        paddingTop: 0,
    },

    // ========================================
    // PANEL & GRID STYLES
    // ========================================
    panel_row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    panel_item: {
        alignItems: 'center',
        flex: 1,
    },


    // ========================================
    // ACHIEVEMENT STYLES
    // ========================================
    achievements_container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        justifyContent: 'space-between',
    },

    achievement_card: {
        width: '50%',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        paddingVertical: SPACING.sm,
        paddingLeft: SPACING.xs,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    achievement_header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },

    achievement_icon: {
        fontSize: 32,
        marginRight: SPACING.xs,
    },

    achievement_content: {
        flex: 1,
        gap: SPACING.xs,
    },

    achievement_title: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },

    achievement_value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    achievement_description: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },
    chart_container: {
        width: '100%',
        marginTop: SPACING.md,
    },

    chart_filters_row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    panel_value: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    panel_value_large: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },

    panel_label: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },

    // ========================================
    // BADGE & STATUS STYLES
    // ========================================
    status_badge: {
        padding: SPACING.sm,
        width: 'auto',
        marginHorizontal: 'auto',
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    badge_primary: {
        borderColor: COLORS.primary,
    },

    badge_warning: {
        borderColor: COLORS.warning,
    },

    status_dot: {
        width: 12,
        height: 12,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        // Note: Animated transform/opacity must be applied from components, not in static styles
    },

    status_dot_primary: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },

    status_dot_warning: {
        borderColor: COLORS.warning,
        backgroundColor: COLORS.warning,
    },

    // ========================================
    // BANNER & ALERT STYLES
    // ========================================
    warning_banner: {
        position: 'absolute',
        left: 12,
        right: 12,
        padding: SPACING.sm,
        backgroundColor: 'rgba(255,99,71,0.95)',
        borderRadius: 8,
        zIndex: 20,
        alignItems: 'center',
    },

    warning_banner_text: {
        color: '#fff',
        fontWeight: '600',
    },

    // ========================================
    // TAG & CHIP STYLES
    // ========================================
    tags_scrollview: {
        height: 'auto',
        flexGrow: 0,
        borderRadius: BORDER_RADIUS.lg,
        alignSelf: 'stretch',
        paddingVertical: SPACING.sm,
    },

    tags_container: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },

    tag_chip: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surfaceLight,
        height: 32,
        justifyContent: 'center',
    },

    tag_chip_active: {
        backgroundColor: COLORS.primary,
    },

    tag_chip_text: {
        color: COLORS.textSecondary,
    },

    tag_chip_text_active: {
        color: COLORS.background,
        fontWeight: '600',
    },

    // ========================================
    // MAP & LOCATION STYLES
    // ========================================
    map: {
        borderRadius: BORDER_RADIUS.md,
        height: 'auto',
        width: '100%',
        flex: 1,
    },

    // ========================================
    // PAGINATION STYLES
    // ========================================
    pagination_dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.sm,
    },
});


