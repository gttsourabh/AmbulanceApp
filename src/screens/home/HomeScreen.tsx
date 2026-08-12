import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
    colors,
    typography,
    shadows,
    spacing,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

// =====================================================
// HOME STACK TYPES
// =====================================================

export type HomeStackParamList = {
    Home: undefined;
    Notifications: undefined;
};

type HomeScreenProps = NativeStackScreenProps<
    HomeStackParamList,
    'Home'
>;

// =====================================================
// HOME SCREEN
// =====================================================

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >

            {/* ================= HEADER ================= */}

            <Header
                // leftIcon="menu"
                rightIcon="bell-outline"
                leftIcon='chevron-back'
                leftIconFamily='ionicons'
                onLeftPress={() => {
                    navigation.navigate("Availability")
                }}

                onRightPress={() => {
                    navigation.navigate('Notifications');
                }}

                centerContent={
                    <View style={styles.statusContainer}>
                        <View style={styles.onlineDot} />

                        <Text style={styles.onlineText}>
                            ONLINE
                        </Text>
                    </View>
                }
            />

            {/* ================= CONTENT ================= */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* ================= HERO ================= */}

                <View style={styles.heroCard}>

                    <View style={styles.heroTextContent}>

                        <Text style={styles.heroSubtext}>
                            Waiting for new
                        </Text>

                        <Text style={styles.heroTitle}>
                            Emergency Request
                        </Text>

                    </View>

                    <View style={styles.heroImageContainer}>
                        <AppIcon
                            family="material"
                            name="ambulance"
                            size={58}
                            color={colors.primary}
                        />
                    </View>

                </View>

                {/* ================= OVERVIEW ================= */}

                <View style={styles.overviewSection}>

                    <Text style={styles.sectionTitle}>
                        Today's Overview
                    </Text>

                    <View style={styles.overviewCard}>

                        {/* COMPLETED */}

                        <View style={styles.overviewRow}>

                            <View style={styles.rowLeft}>

                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.successLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="check-circle"
                                        size={18}
                                        color={colors.successDark}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Completed
                                </Text>

                            </View>

                            <Text style={styles.rowValue}>
                                04
                            </Text>

                        </View>

                        {/* CANCELLED */}

                        <View style={styles.overviewRow}>

                            <View style={styles.rowLeft}>

                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.dangerLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="close-circle"
                                        size={18}
                                        color={colors.danger}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Cancelled
                                </Text>

                            </View>

                            <Text style={styles.rowValue}>
                                01
                            </Text>

                        </View>

                        {/* EARNINGS */}

                        <View
                            style={[
                                styles.overviewRow,
                                styles.lastRow,
                            ]}
                        >

                            <View style={styles.rowLeft}>

                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.warningLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="cash"
                                        size={18}
                                        color={colors.warning}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Earnings
                                </Text>

                            </View>

                            <Text style={styles.rowValue}>
                                ₹1,250
                            </Text>

                        </View>

                    </View>

                </View>

            </ScrollView>

        </SafeAreaView>
    );
};

export default HomeScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    // =================================================
    // SCREEN
    // =================================================

    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    scrollContent: {
        paddingBottom: spacing.xxxl,
    },

    // =================================================
    // HEADER STATUS
    // =================================================

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.success,
        marginRight: spacing.xs,
    },

    onlineText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.xs,
        color: colors.successDark,
        letterSpacing: 0.3,
    },

    // =================================================
    // HERO CARD
    // =================================================

    heroCard: {
        minHeight: 115,

        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,

        paddingLeft: spacing.md,
        paddingRight: spacing.sm,

        borderRadius: spacing.md,

        backgroundColor: colors.primaryLight,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        ...shadows.card,
    },

    heroTextContent: {
        flex: 1,
    },

    heroSubtext: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 3,
    },

    heroTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
    },

    heroImageContainer: {
        width: 85,
        height: 85,

        alignItems: 'center',
        justifyContent: 'center',
    },

    // =================================================
    // OVERVIEW
    // =================================================

    overviewSection: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },

    // =================================================
    // OVERVIEW CARD
    // =================================================

    overviewCard: {
        backgroundColor: colors.white,

        borderRadius: spacing.md,

        paddingHorizontal: spacing.md,

        ...shadows.card,
    },

    // =================================================
    // ROW
    // =================================================

    overviewRow: {
        minHeight: 58,

        paddingVertical: spacing.sm,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    lastRow: {
        borderBottomWidth: 0,
    },

    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // =================================================
    // ICON
    // =================================================

    iconBox: {
        width: 34,
        height: 34,

        borderRadius: spacing.sm,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: spacing.sm,
    },

    // =================================================
    // TEXT
    // =================================================

    rowLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },

    rowValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
    },
});