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
                    <Text style={styles.summaryLabel}>
                        Today's Earnings
                    </Text>

                    <Text style={styles.totalAmount}>
                        ₹ 1,250
                    </Text>

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

                            <Text style={styles.transactionAmount}>
                                {transaction.amount}
                            </Text>

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
        backgroundColor: colors.white,
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
        height: 55,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.white,
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: colors.textPrimary,
    },

    // =====================================================
    // PERIOD FILTER
    // =====================================================

    periodContainer: {
        flexDirection: 'row',

        paddingHorizontal: 18,

        marginTop: 5,
        marginBottom: 14,

        justifyContent: 'space-between',

        backgroundColor: colors.white,
    },

    periodButton: {
        width: '30%',
        height: 36,

        borderRadius: 20,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#F1F3F7',
    },

    activePeriodButton: {
        backgroundColor: colors.primary,
    },

    periodText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,

        color: colors.textSecondary,
    },

    activePeriodText: {
        fontFamily: 'GoogleSans-Bold',
        color: colors.textWhite,
    },

    // =====================================================
    // SCROLL
    // =====================================================

    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 100,

        backgroundColor: colors.white,
    },

    // =====================================================
    // EARNINGS SUMMARY CARD
    // =====================================================

    summaryCard: {
        backgroundColor: colors.white,

        borderRadius: 14,

        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 14,

        marginBottom: 20,

        elevation: 3,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    summaryLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,

        color: colors.textSecondary,

        marginBottom: 3,
    },

    totalAmount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 25,

        color: colors.textPrimary,

        marginBottom: 18,
    },

    // =====================================================
    // STATS
    // =====================================================

    statsContainer: {
        flexDirection: 'row',

        alignItems: 'center',
    },

    statItem: {
        flex: 1,
    },

    statLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,

        color: colors.textSecondary,

        marginBottom: 4,
    },

    statValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 15,

        color: colors.textPrimary,
    },

    statDivider: {
        width: 1,
        height: 38,

        backgroundColor: colors.divider,

        marginHorizontal: 15,
    },

    // =====================================================
    // RECENT TRANSACTIONS
    // =====================================================

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,

        color: colors.textPrimary,

        marginBottom: 9,
    },

    transactionCard: {
        backgroundColor: colors.white,

        borderRadius: 14,

        paddingHorizontal: 13,

        elevation: 3,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    transactionRow: {
        minHeight: 68,

        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    lastTransaction: {
        borderBottomWidth: 0,
    },

    // =====================================================
    // TRANSACTION ICON
    // =====================================================

    transactionIcon: {
        width: 36,
        height: 36,

        borderRadius: 18,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 11,
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

    transactionAmount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,

        color: colors.successDark,
    },
});