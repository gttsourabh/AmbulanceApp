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
                            size={28}
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
                            You are
                        </Text>

                        <View style={styles.statusRow}>

                            <View
                                style={[
                                    styles.onlineDot,
                                    {
                                        backgroundColor: isOnline
                                            ? '#22C55E'
                                            : colors.textLight,
                                    },
                                ]}
                            />

                            <Text
                                style={[
                                    styles.statusText,
                                    {
                                        color: isOnline
                                            ? '#22A06B'
                                            : colors.textSecondary,
                                    },
                                ]}
                            >
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Text>

                        </View>

                    </View>

                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{
                            false: colors.divider,
                            true: '#35C978',
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

                        <Text style={styles.statBottom}>
                            Today
                        </Text>

                    </View>

                </View>

                {/* =====================================================
            GO TO HOME
        ===================================================== */}

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.goHomeButton}
                    onPress={handleGoToHome}
                >

                    <View style={styles.goHomeLeft}>

                        <View style={styles.homeIconContainer}>
                            <AppIcon
                                family="material"
                                name="home-outline"
                                size={18}
                                color="#315EFF"
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

        marginTop: spacing.sm,
        marginBottom: spacing.lg,
    },

    greetingContent: {
        flex: 1,
    },

    greeting: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,

        marginBottom: 3,
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileAvatar: {
        width: 46,
        height: 46,

        borderRadius: 23,

        backgroundColor: '#E9EDF2',

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',
    },

    // =====================================================
    // AVAILABILITY CARD
    // =====================================================

    availabilityCard: {
        minHeight: 78,

        paddingHorizontal: spacing.md,

        borderRadius: spacing.md,

        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: colors.divider,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        ...shadows.card,
    },

    availabilityContent: {
        justifyContent: 'center',
    },

    youAreText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,

        marginBottom: spacing.xs,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    onlineDot: {
        width: 8,
        height: 8,

        borderRadius: 4,

        marginRight: spacing.xs,
    },

    statusText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
    },

    switch: {
        transform: [
            { scaleX: 0.9 },
            { scaleY: 0.9 },
        ],
    },

    // =====================================================
    // STATISTICS
    // =====================================================

    statsContainer: {
        flexDirection: 'row',

        gap: spacing.sm,

        marginTop: spacing.md,
    },

    statCard: {
        flex: 1,

        minHeight: 104,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,

        borderRadius: spacing.md,

        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: colors.divider,

        ...shadows.card,
    },

    statLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,

        marginBottom: spacing.xs,
    },

    tripValue: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xxl,
        color: colors.textPrimary,

        marginBottom: 2,
    },

    earningValue: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xl,
        color: colors.textPrimary,

        marginBottom: 3,
    },

    statBottom: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    // =====================================================
    // GO TO HOME
    // =====================================================

    goHomeButton: {
        minHeight: 54,

        marginTop: spacing.md,

        paddingHorizontal: spacing.md,

        borderRadius: spacing.md,

        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: colors.divider,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        ...shadows.card,
    },

    goHomeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    homeIconContainer: {
        width: 34,

        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    goHomeText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: '#315EFF',
    },
});