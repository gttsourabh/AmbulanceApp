import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Button from '../../../components/Button/Button';
import { useNavigation } from '@react-navigation/native';

const TripCompletedScreen = () => {
    const navigation = useNavigation()
    const handleComplete = () => {
        navigation.navigate("MainTabs" as never)
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
        >
            {/* =====================================================
          SUCCESS HEADER
      ===================================================== */}

            <View style={styles.successHeader}>

                <View style={styles.successIconRing}>
                    <View style={styles.successIcon}>
                        <AppIcon
                            family="material"
                            name="check-bold"
                            size={26}
                            color={colors.success}
                        />
                    </View>
                </View>

                <Text style={styles.successTitle}>
                    Trip Completed
                </Text>

                <Text style={styles.successSubtitle}>
                    Great job — patient dropped off safely
                </Text>
            </View>

            {/* =====================================================
          CONTENT CARD
      ===================================================== */}

            <View style={styles.contentCardShadowWrap}>
                <View style={styles.contentCard}>

                    {/* ===================================================
                DRIVER
            =================================================== */}

                    <View style={styles.driverRow}>

                        {/* Temporary avatar */}
                        <View style={styles.avatar}>
                            <AppIcon
                                family="ionicons"
                                name="person"
                                size={26}
                                color={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.driverInfo}>
                            <Text style={styles.driverName}>
                                John Doe
                            </Text>

                            <View style={styles.ratingRow}>
                                <Text style={styles.stars}>
                                    ★★★★★
                                </Text>

                                <Text style={styles.rating}>
                                    4.8
                                </Text>
                            </View>
                        </View>

                        <View style={styles.earnedBadge}>
                            <Text style={styles.earnedLabel}>
                                EARNED
                            </Text>

                            <Text style={styles.earnedValue}>
                                ₹350
                            </Text>
                        </View>

                    </View>

                    {/* ===================================================
                TRIP DETAILS
            =================================================== */}

                    <View style={styles.detailsCard}>

                        <Text style={styles.detailsTitle}>
                            TRIP DETAILS
                        </Text>

                        {/* Distance */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelRow}>
                                <AppIcon
                                    family="material"
                                    name="map-marker-distance"
                                    size={14}
                                    color={colors.textLight}
                                />

                                <Text style={styles.detailLabel}>
                                    Distance
                                </Text>
                            </View>

                            <Text style={styles.detailValue}>
                                12.4 km
                            </Text>
                        </View>

                        {/* Trip Time */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelRow}>
                                <AppIcon
                                    family="material"
                                    name="clock-outline"
                                    size={14}
                                    color={colors.textLight}
                                />

                                <Text style={styles.detailLabel}>
                                    Trip Time
                                </Text>
                            </View>

                            <Text style={styles.detailValue}>
                                25 min
                            </Text>
                        </View>

                        <View style={styles.detailDivider} />

                        {/* Amount */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelRow}>
                                <AppIcon
                                    family="material"
                                    name="cash"
                                    size={14}
                                    color={colors.textLight}
                                />

                                <Text style={styles.detailLabel}>
                                    Amount Earned
                                </Text>
                            </View>

                            <Text style={styles.detailValueStrong}>
                                ₹350
                            </Text>
                        </View>

                        {/* Payment */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelRow}>
                                <AppIcon
                                    family="material"
                                    name="cash-multiple"
                                    size={14}
                                    color={colors.textLight}
                                />

                                <Text style={styles.detailLabel}>
                                    Payment
                                </Text>
                            </View>

                            <View style={styles.paymentPill}>
                                <Text style={styles.paymentText}>
                                    Cash
                                </Text>
                            </View>
                        </View>

                    </View>

                    {/* ===================================================
                COMPLETE BUTTON
            =================================================== */}

                    <Button
                        title="Complete"
                        icon="check"
                        onPress={handleComplete}
                        variant="primary"
                        style={styles.completeButton}
                    />

                </View>
            </View>
        </SafeAreaView>
    );
};

export default TripCompletedScreen;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // =====================================================
    // SUCCESS HEADER
    // =====================================================

    successHeader: {
        height: 175,

        backgroundColor: colors.success,

        alignItems: 'center',
        justifyContent: 'center',

        paddingTop: spacing.md,
    },

    successIconRing: {
        width: 68,
        height: 68,

        borderRadius: 34,

        backgroundColor: 'rgba(255,255,255,0.18)',

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: spacing.sm,
    },

    successIcon: {
        width: 52,
        height: 52,

        borderRadius: 26,

        backgroundColor: colors.white,

        alignItems: 'center',
        justifyContent: 'center',
    },

    successTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.lg,
        letterSpacing: 0.2,

        color: colors.white,

        marginBottom: 4,
    },

    successSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,

        color: 'rgba(255,255,255,0.85)',
    },

    // =====================================================
    // CONTENT CARD
    // =====================================================

    contentCardShadowWrap: {
        marginHorizontal: spacing.md,
        marginTop: -28,

        borderRadius: 20,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 6,
    },

    contentCard: {
        padding: spacing.md,

        backgroundColor: colors.white,

        borderRadius: 20,

        borderWidth: 1,
        borderColor: colors.border,
    },

    // =====================================================
    // DRIVER
    // =====================================================

    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,

        marginBottom: spacing.sm,
    },

    avatar: {
        width: 46,
        height: 46,

        borderRadius: 15,

        backgroundColor: colors.background,

        borderWidth: 1,
        borderColor: colors.border,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: spacing.sm,

        overflow: 'hidden',
    },

    driverInfo: {
        flex: 1,
    },

    driverName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        letterSpacing: 0.1,

        color: colors.textPrimary,

        marginBottom: 3,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    stars: {
        fontSize: 13,
        letterSpacing: 1,

        color: colors.warning,
    },

    rating: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,

        color: colors.textSecondary,

        marginLeft: spacing.xs,
    },

    earnedBadge: {
        alignItems: 'flex-end',

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 10,

        backgroundColor: colors.successLight,
    },

    earnedLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 9,
        letterSpacing: 0.4,

        color: colors.successDark,

        marginBottom: 1,
    },

    earnedValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.sm,

        color: colors.successDark,
    },

    // =====================================================
    // TRIP DETAILS
    // =====================================================

    detailsCard: {
        padding: spacing.md,

        borderRadius: 14,

        backgroundColor: colors.background,

        borderWidth: 1,
        borderColor: colors.border,

        marginBottom: spacing.md,
    },

    detailsTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        letterSpacing: 0.6,

        color: colors.textLight,

        marginBottom: spacing.sm,
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',

        justifyContent: 'space-between',

        paddingVertical: 6,
    },

    detailLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',

        gap: 6,
    },

    detailLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,

        color: colors.textSecondary,
    },

    detailValue: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,

        color: colors.textPrimary,
    },

    detailValueStrong: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.sm,

        color: colors.successDark,
    },

    detailDivider: {
        height: StyleSheet.hairlineWidth,

        backgroundColor: colors.divider,

        marginVertical: 4,
    },

    paymentPill: {
        paddingHorizontal: 9,
        paddingVertical: 3,

        borderRadius: 8,

        backgroundColor: colors.primaryLight,
    },

    paymentText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,

        color: colors.primary,
    },

    // =====================================================
    // COMPLETE BUTTON
    // =====================================================

    completeButton: {
        height: 54,
        borderRadius: 14,
    },
});