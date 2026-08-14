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

        paddingVertical: 5,
        paddingHorizontal: 10,

        borderRadius: 20,

        backgroundColor: colors.successLight,
    },

    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
        marginRight: 6,
    },

    onlineText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.xs,
        color: colors.successDark,
        letterSpacing: 0.4,
    },

    // =================================================
    // HERO CARD
    // =================================================

    heroCard: {
        minHeight: 120,

        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,

        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,

        borderRadius: 20,

        backgroundColor: colors.primaryLight,

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

    heroTextContent: {
        flex: 1,
    },

    heroSubtext: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        letterSpacing: 0.2,
        marginBottom: 4,
    },

    heroTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    heroImageContainer: {
        width: 88,
        height: 88,

        borderRadius: 44,

        backgroundColor: colors.card,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },

    // =================================================
    // OVERVIEW
    // =================================================

    overviewSection: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: spacing.sm,
    },

    // =================================================
    // OVERVIEW CARD
    // =================================================

    overviewCard: {
        backgroundColor: colors.card,

        borderRadius: 18,

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderColor: colors.border,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    // =================================================
    // ROW
    // =================================================

    overviewRow: {
        minHeight: 60,

        paddingVertical: spacing.sm,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomWidth: StyleSheet.hairlineWidth,
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
        width: 36,
        height: 36,

        borderRadius: 12,

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
        letterSpacing: 0.1,
    },

    rowValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },
});