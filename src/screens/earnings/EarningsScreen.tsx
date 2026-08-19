import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../icons';
import { colors } from '../../theme';

type Period = 'Daily' | 'Weekly' | 'Monthly';

interface Transaction {
    id: number;
    name: string;
    time: string;
    amount: string;
}

const transactions: Transaction[] = [
    {
        id: 1,
        name: 'John Doe',
        time: '2:30 PM',
        amount: '+ ₹350',
    },
    {
        id: 2,
        name: 'Alice Smith',
        time: '10:15 AM',
        amount: '+ ₹280',
    },
];

const EarningsScreen = () => {
    const [selectedPeriod, setSelectedPeriod] =
        useState<Period>('Daily');

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}>

            {/* ================= HEADER ================= */}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Earnings
                </Text>
            </View>

            {/* ================= PERIOD FILTER ================= */}

            <View style={styles.periodContainer}>
                {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(
                    period => {
                        const isActive =
                            selectedPeriod === period;

                        return (
                            <TouchableOpacity
                                key={period}
                                activeOpacity={0.8}
                                onPress={() =>
                                    setSelectedPeriod(period)
                                }
                                style={[
                                    styles.periodButton,
                                    isActive &&
                                    styles.activePeriodButton,
                                ]}>
                                <Text
                                    style={[
                                        styles.periodText,
                                        isActive &&
                                        styles.activePeriodText,
                                    ]}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        );
                    },
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                {/* ================= EARNINGS SUMMARY ================= */}

                <View style={styles.summaryCard}>

                    <View style={styles.summaryTopRow}>

                        <View>
                            <Text style={styles.summaryLabel}>
                                Today's Earnings
                            </Text>

                            <Text style={styles.totalAmount}>
                                ₹ 1,250
                            </Text>
                        </View>

                        <View style={styles.summaryIconCircle}>
                            <AppIcon
                                family="material"
                                name="cash-multiple"
                                size={22}
                                color={colors.primary}
                            />
                        </View>

                    </View>

                    <View style={styles.statsContainer}>

                        {/* Trips */}

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>
                                Trips
                            </Text>

                            <Text style={styles.statValue}>
                                04
                            </Text>
                        </View>

                        <View style={styles.statDivider} />

                        {/* Cash Collected */}

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>
                                Cash Collected
                            </Text>

                            <Text style={styles.statValue}>
                                ₹ 1,250
                            </Text>
                        </View>

                    </View>
                </View>

                {/* ================= RECENT TRANSACTIONS ================= */}

                <Text style={styles.sectionTitle}>
                    Recent Transactions
                </Text>

                <View style={styles.transactionCard}>

                    {transactions.map((transaction, index) => (
                        <View
                            key={transaction.id}
                            style={[
                                styles.transactionRow,
                                index === transactions.length - 1 &&
                                styles.lastTransaction,
                            ]}>

                            {/* User Icon */}

                            <View style={styles.transactionIcon}>
                                <AppIcon
                                    family="material"
                                    name="account"
                                    size={18}
                                    color={colors.primary}
                                />
                            </View>

                            {/* User Details */}

                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionName}>
                                    {transaction.name}
                                </Text>

                                <Text style={styles.transactionTime}>
                                    {transaction.time}
                                </Text>
                            </View>

                            {/* Amount */}

                            <View style={styles.amountPill}>
                                <Text style={styles.transactionAmount}>
                                    {transaction.amount}
                                </Text>
                            </View>

                        </View>
                    ))}

                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default EarningsScreen;

const styles = StyleSheet.create({

    // =====================================================
    // CONTAINER
    // =====================================================

    container: {
        flex: 1,
         backgroundColor: colors.background,
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
        height: 55,

        alignItems: 'center',
        justifyContent: 'center',

         backgroundColor: colors.background,
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    // =====================================================
    // PERIOD FILTER
    // =====================================================

    periodContainer: {
        flexDirection: 'row',

        marginHorizontal: 18,

        marginTop: 4,
        marginBottom: 16,

        padding: 4,

        borderRadius: 16,

        backgroundColor: colors.divider,
    },

    periodButton: {
        flex: 1,
        height: 36,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'transparent',
    },

    activePeriodButton: {
        backgroundColor: colors.card,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    periodText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,

        color: colors.textSecondary,
    },

    activePeriodText: {
        fontFamily: 'GoogleSans-Bold',
        color: colors.primary,
    },

    // =====================================================
    // SCROLL
    // =====================================================

    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 100,

         backgroundColor: colors.background,
    },

    // =====================================================
    // EARNINGS SUMMARY CARD
    // =====================================================

    summaryCard: {
        backgroundColor: colors.card,

        borderRadius: 20,

        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 16,

        marginBottom: 22,

        borderWidth: 1,
        borderColor: colors.border,

        elevation: 3,

        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.06,
        shadowRadius: 16,
    },

    summaryTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',

        marginBottom: 18,
    },

    summaryIconCircle: {
        width: 44,
        height: 44,

        borderRadius: 22,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,

        color: colors.textSecondary,
        letterSpacing: 0.2,

        marginBottom: 5,
    },

    totalAmount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 27,

        color: colors.textPrimary,
        letterSpacing: 0.2,
    },

    // =====================================================
    // STATS
    // =====================================================

    statsContainer: {
        flexDirection: 'row',

        alignItems: 'center',

        paddingTop: 16,

        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },

    statItem: {
        flex: 1,
    },

    statLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,

        color: colors.textLight,

        marginBottom: 4,
    },

    statValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 15,

        color: colors.textPrimary,
    },

    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 38,

        backgroundColor: colors.divider,

        marginHorizontal: 15,
    },

    // =====================================================
    // RECENT TRANSACTIONS
    // =====================================================

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,

        color: colors.textLight,
        letterSpacing: 0.6,
        textTransform: 'uppercase',

        marginBottom: 10,
        marginLeft: 2,
    },

    transactionCard: {
        backgroundColor: colors.card,

        borderRadius: 18,

        paddingHorizontal: 14,

        borderWidth: 1,
        borderColor: colors.border,

        elevation: 3,

        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },

    transactionRow: {
        minHeight: 68,

        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },

    lastTransaction: {
        borderBottomWidth: 0,
    },

    // =====================================================
    // TRANSACTION ICON
    // =====================================================

    transactionIcon: {
        width: 38,
        height: 38,

        borderRadius: 13,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 12,
    },

    // =====================================================
    // TRANSACTION INFO
    // =====================================================

    transactionInfo: {
        flex: 1,
    },

    transactionName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,

        color: colors.textPrimary,

        marginBottom: 3,
    },

    transactionTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,

        color: colors.textLight,
    },

    // =====================================================
    // AMOUNT
    // =====================================================

    amountPill: {
        paddingHorizontal: 9,
        paddingVertical: 4,

        borderRadius: 8,

        backgroundColor: colors.successLight,
    },

    transactionAmount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,

        color: colors.successDark,
    },
});