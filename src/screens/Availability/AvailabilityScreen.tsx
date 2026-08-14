import React, { useState } from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, shadows, spacing, typography } from '../../theme';
import { AppIcon } from '../../icons';

const AvailabilityScreen = () => {
    const navigation = useNavigation();

    const [isOnline, setIsOnline] = useState(true);

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleMenu = () => {
        console.log('Menu');
    };

    const handleNotifications = () => {
        console.log('Notifications');
    };

    const handleGoToHome = () => {
        navigation.navigate('MainTabs' as never);
    };


    const handleEmergencyRequest = () => {
        navigation.navigate('IncomingRequests' as never);
    };


    // =====================================================
    // SCREEN
    // =====================================================

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <View style={styles.content}>


                {/* =====================================================
            GREETING
        ===================================================== */}

                <View style={styles.greetingSection}>

                    <View style={styles.greetingContent}>

                        <Text style={styles.greeting}>
                            Good Morning,
                        </Text>

                        <Text style={styles.userName}>
                            Ramesh Kumar
                        </Text>

                    </View>

                    {/* PROFILE */}

                    <View style={styles.profileAvatar}>
                        <AppIcon
                            family="material"
                            name="account"
                            size={26}
                            color={colors.textSecondary}
                        />
                    </View>

                </View>

                {/* =====================================================
            AVAILABILITY CARD
        ===================================================== */}

                <View style={styles.availabilityCard}>

                    <View style={styles.availabilityContent}>

                        <Text style={styles.youAreText}>
                            YOUR STATUS
                        </Text>

                        <View style={styles.statusRow}>

                            <View
                                style={[
                                    styles.statusPill,
                                    {
                                        backgroundColor: isOnline
                                            ? colors.successLight
                                            : colors.divider,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.onlineDot,
                                        {
                                            backgroundColor: isOnline
                                                ? colors.success
                                                : colors.textLight,
                                        },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: isOnline
                                                ? colors.success
                                                : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {isOnline ? 'AVAILABLE' : 'OFFLINE'}
                                </Text>
                            </View>

                        </View>

                    </View>

                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{
                            false: colors.divider,
                            true: colors.success,
                        }}
                        thumbColor={colors.white}
                        ios_backgroundColor={colors.divider}
                        style={styles.switch}
                    />

                </View>

                {/* =====================================================
            STATISTICS
        ===================================================== */}

                <View style={styles.statsContainer}>

                    {/* TODAY'S TRIPS */}

                    <View style={styles.statCard}>

                        <Text style={styles.statLabel}>
                            Today's Trips
                        </Text>

                        <Text style={styles.tripValue}>
                            04
                        </Text>

                        <View style={styles.statDivider} />

                        <Text style={styles.statBottom}>
                            Completed
                        </Text>

                    </View>

                    {/* EARNINGS */}

                    <View style={styles.statCard}>

                        <Text style={styles.statLabel}>
                            Earnings
                        </Text>

                        <Text style={styles.earningValue}>
                            ₹ 1,250
                        </Text>

                        <View style={styles.statDivider} />

                        <Text style={styles.statBottom}>
                            Today
                        </Text>

                    </View>

                </View>

                {/* =====================================================
            GO TO HOME
        ===================================================== */}

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.goHomeButton}
                    onPress={handleGoToHome}
                >

                    <View style={styles.goHomeLeft}>

                        <View style={styles.homeIconContainer}>
                            <AppIcon
                                family="material"
                                name="home-outline"
                                size={18}
                                color={colors.primary}
                            />
                        </View>

                        <Text style={styles.goHomeText}>
                            Go to Home
                        </Text>

                    </View>

                    <AppIcon
                        family="material"
                        name="chevron-right"
                        size={20}
                        color={colors.textLight}
                    />

                </TouchableOpacity>

                {/* =====================================================
    EMERGENCY REQUEST
===================================================== */}

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.emergencyButton}
                    onPress={handleEmergencyRequest}
                >
                    <AppIcon
                        family="material"
                        name="alert-circle-outline"
                        size={20}
                        color={colors.danger}
                    />

                    <Text style={styles.emergencyButtonText}>
                        Emergency Request
                    </Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
};

export default AvailabilityScreen;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },

    // =====================================================
    // TOP BAR
    // =====================================================

    topBar: {
        height: 52,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerButton: {
        width: 40,
        height: 40,

        alignItems: 'center',
        justifyContent: 'center',
    },

    // =====================================================
    // GREETING
    // =====================================================

    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },

    greetingContent: {
        flex: 1,
    },

    greeting: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        letterSpacing: 0.2,

        marginBottom: 4,
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xl,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileAvatar: {
        width: 50,
        height: 50,

        borderRadius: 25,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        borderWidth: 1,
        borderColor: colors.border,
    },

    // =====================================================
    // AVAILABILITY CARD
    // =====================================================

    availabilityCard: {
        minHeight: 84,

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,

        borderRadius: 18,

        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: colors.border,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },

    availabilityContent: {
        justifyContent: 'center',
    },

    youAreText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        color: colors.textLight,
        letterSpacing: 0.8,

        marginBottom: spacing.xs,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingVertical: 5,
        paddingHorizontal: 10,

        borderRadius: 20,
    },

    onlineDot: {
        width: 7,
        height: 7,

        borderRadius: 3.5,

        marginRight: 6,
    },

    statusText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        letterSpacing: 0.4,
    },

    switch: {
        transform: [
            { scaleX: 0.92 },
            { scaleY: 0.92 },
        ],
    },

    // =====================================================
    // STATISTICS
    // =====================================================

    statsContainer: {
        flexDirection: 'row',

        gap: spacing.sm,

        marginTop: spacing.lg,
    },

    statCard: {
        flex: 1,

        minHeight: 112,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,

        borderRadius: 16,

        backgroundColor: colors.surface,

        borderWidth: 1,
        borderColor: colors.border,

        // Soft shadow
        shadowColor: '#000',
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 8,
        shadowRadius: 10,

        elevation: 4,
    },

    statLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,

        marginBottom: 6,
    },

    tripValue: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xxl,
        color: colors.textPrimary,
        letterSpacing: 0.2,
    },

    earningValue: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xl,
        color: colors.primary,
        letterSpacing: 0.2,
    },

    statDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,

        marginVertical: 8,
    },

    statBottom: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textLight,
    },

    // =====================================================
    // GO TO HOME
    // =====================================================

    goHomeButton: {
        minHeight: 58,

        marginTop: spacing.lg,

        paddingHorizontal: spacing.md,

        borderRadius: 16,

        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: colors.border,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    goHomeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    homeIconContainer: {
        width: 34,
        height: 34,

        marginRight: 4,

        borderRadius: 10,
        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',
    },

    goHomeText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    // =====================================================
    // EMERGENCY REQUEST
    // =====================================================

    emergencyButton: {
        minHeight: 54,

        marginTop: spacing.sm,

        paddingHorizontal: spacing.md,

        borderRadius: 16,

        backgroundColor: colors.dangerLight,

        borderWidth: 1,
        borderColor: colors.danger,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: 8,
    },

    emergencyButtonText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.danger,
    },
});