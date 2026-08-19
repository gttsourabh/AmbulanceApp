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
import { colors, typography, shadows, spacing } from '../../theme';

type FilterType = 'All' | 'Completed' | 'Cancelled';

interface Trip {
    id: number;
    name: string;
    time: string;
    pickupTime: string;
    distance: string;
    amount: string;
    status: 'Completed' | 'Cancelled';
    icon: string;
}

const trips: Trip[] = [
    {
        id: 1,
        name: 'John Doe',
        time: '12:00 PM',
        pickupTime: '2:30 PM',
        distance: '12.4 km',
        amount: '₹350',
        status: 'Completed',
        icon: 'account',
    },
    {
        id: 2,
        name: 'Alice Smith',
        time: '10:15 AM',
        pickupTime: '2:20 PM',
        distance: '8.6 km',
        amount: '₹280',
        status: 'Completed',
        icon: 'account',
    },
    {
        id: 3,
        name: 'Robert Brown',
        time: '10:20 AM',
        pickupTime: '6:45 PM',
        distance: '10.2 km',
        amount: '₹310',
        status: 'Completed',
        icon: 'account',
    },
    {
        id: 4,
        name: 'Cancelled Trip',
        time: '11:30 AM',
        pickupTime: '3:20 PM',
        distance: '',
        amount: '₹0',
        status: 'Cancelled',
        icon: 'close-circle',
    },
];

const TripsScreen = () => {
    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('All');

    const filteredTrips = trips.filter(trip => {
        if (selectedFilter === 'All') {
            return true;
        }

        return trip.status === selectedFilter;
    });

    const todayTrips = filteredTrips.slice(0, 2);
    const yesterdayTrips = filteredTrips.slice(2);

    const renderTrip = (trip: Trip) => {
        const isCancelled = trip.status === 'Cancelled';

        return (
            <View
                key={trip.id}
                style={styles.tripCard}
            >
                {/* =====================================================
            ICON
        ===================================================== */}

                <View
                    style={[
                        styles.tripIcon,
                        isCancelled
                            ? styles.cancelledIcon
                            : styles.completedIcon,
                    ]}
                >
                    <AppIcon
                        family="material"
                        name={trip.icon}
                        size={20}
                        color={
                            isCancelled
                                ? colors.danger
                                : colors.primary
                        }
                    />
                </View>

                {/* =====================================================
            TRIP INFO
        ===================================================== */}

                <View style={styles.tripInfo}>

                    <Text
                        style={styles.passengerName}
                        numberOfLines={1}
                    >
                        {trip.name}
                    </Text>

                    <View style={styles.tripDetailsRow}>

                        <AppIcon
                            family="material"
                            name="clock-outline"
                            size={12}
                            color={colors.textLight}
                        />

                        <Text style={styles.pickupTime}>
                            {trip.pickupTime}
                        </Text>

                        {trip.distance ? (
                            <>
                                <View style={styles.dotSeparator} />

                                <Text style={styles.distance}>
                                    {trip.distance}
                                </Text>
                            </>
                        ) : null}

                    </View>

                </View>

                {/* =====================================================
            RIGHT
        ===================================================== */}

                <View style={styles.tripRight}>

                    <Text style={styles.tripTime}>
                        {trip.time}
                    </Text>

                    <Text style={styles.amount}>
                        {trip.amount}
                    </Text>

                    <View
                        style={[
                            styles.statusPill,
                            isCancelled
                                ? styles.cancelledPill
                                : styles.completedPill,
                        ]}
                    >
                        <Text
                            style={[
                                styles.status,
                                isCancelled
                                    ? styles.cancelledStatus
                                    : styles.completedStatus,
                            ]}
                        >
                            {trip.status}
                        </Text>
                    </View>

                </View>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* =====================================================
          HEADER
      ===================================================== */}

            <View style={styles.header}>

                <Text style={styles.headerTitle}>
                    Trip History
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.filterIconButton}
                >
                    <AppIcon
                        family="material"
                        name="filter-variant"
                        size={20}
                        color={colors.primary}
                    />
                </TouchableOpacity>

            </View>

            {/* =====================================================
          FILTERS
      ===================================================== */}

            <View style={styles.filterContainer}>

                {(
                    ['All', 'Completed', 'Cancelled'] as FilterType[]
                ).map(filter => {

                    const isActive =
                        selectedFilter === filter;

                    return (
                        <TouchableOpacity
                            key={filter}
                            activeOpacity={0.8}
                            onPress={() =>
                                setSelectedFilter(filter)
                            }
                            style={[
                                styles.filterButton,
                                isActive &&
                                styles.activeFilterButton,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    isActive &&
                                    styles.activeFilterText,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

            </View>

            {/* =====================================================
          TRIPS
      ===================================================== */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
            >

                {/* TODAY */}

                {todayTrips.length > 0 && (
                    <View style={styles.section}>

                        <Text style={styles.sectionTitle}>
                            Today
                        </Text>

                        {todayTrips.map(renderTrip)}

                    </View>
                )}

                {/* YESTERDAY */}

                {yesterdayTrips.length > 0 && (
                    <View style={styles.section}>

                        <Text style={styles.sectionTitle}>
                            Yesterday
                        </Text>

                        {yesterdayTrips.map(renderTrip)}

                    </View>
                )}

                {/* EMPTY */}

                {filteredTrips.length === 0 && (
                    <View style={styles.emptyContainer}>

                        <View style={styles.emptyIconCircle}>
                            <AppIcon
                                family="material"
                                name="clipboard-text-outline"
                                size={40}
                                color={colors.textLight}
                            />
                        </View>

                        <Text style={styles.emptyText}>
                            No trips found
                        </Text>

                        <Text style={styles.emptySubtext}>
                            Trips you complete will show up here
                        </Text>

                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default TripsScreen;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
         backgroundColor: colors.background,
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
        height: 58,

        paddingHorizontal: spacing.lg,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.lg,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    filterIconButton: {
        position: 'absolute',
        right: spacing.lg,

        width: 38,
        height: 38,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.primaryLight,
    },

    // =====================================================
    // FILTER
    // =====================================================

    filterContainer: {
        flexDirection: 'row',

        marginHorizontal: spacing.lg,

        marginTop: spacing.xs,
        marginBottom: spacing.md,

        padding: 4,

        borderRadius: 16,

        backgroundColor: colors.divider,
    },

    filterButton: {
        flex: 1,

        height: 38,

        borderRadius: 13,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'transparent',
    },

    activeFilterButton: {
        backgroundColor: colors.card,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    filterText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    activeFilterText: {
        color: colors.primary,
        fontFamily: 'GoogleSans-Medium',
    },

    // =====================================================
    // CONTENT
    // =====================================================

    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.huge,
    },

    section: {
        marginTop: spacing.sm,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        color: colors.textLight,
        letterSpacing: 0.6,
        textTransform: 'uppercase',

        marginBottom: spacing.sm,
        marginLeft: 2,
    },

    // =====================================================
    // TRIP CARD
    // =====================================================

    tripCard: {
        minHeight: 88,

        backgroundColor: colors.card,

        borderRadius: 16,

        marginBottom: spacing.sm,

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderColor: colors.border,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },

    // =====================================================
    // TRIP ICON
    // =====================================================

    tripIcon: {
        width: 42,
        height: 42,

        borderRadius: 13,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: spacing.sm,
    },

    completedIcon: {
        backgroundColor: colors.infoLight,
    },

    cancelledIcon: {
        backgroundColor: colors.dangerLight,
    },

    // =====================================================
    // TRIP INFO
    // =====================================================

    tripInfo: {
        flex: 1,

        justifyContent: 'center',

        paddingRight: spacing.xs,
    },

    passengerName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        letterSpacing: 0.1,

        marginBottom: 4,
    },

    tripDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    pickupTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,

        marginLeft: 4,
    },

    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,

        backgroundColor: colors.textLight,

        marginHorizontal: 6,
    },

    distance: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    // =====================================================
    // RIGHT
    // =====================================================

    tripRight: {
        minWidth: 82,

        alignItems: 'flex-end',
    },

    tripTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textLight,

        marginBottom: 3,
    },

    amount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,

        marginBottom: 6,
    },

    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,

        borderRadius: 8,
    },

    completedPill: {
        backgroundColor: colors.successLight,
    },

    cancelledPill: {
        backgroundColor: colors.dangerLight,
    },

    status: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        letterSpacing: 0.2,
    },

    completedStatus: {
        color: colors.successDark,
    },

    cancelledStatus: {
        color: colors.danger,
    },

    // =====================================================
    // EMPTY
    // =====================================================

    emptyContainer: {
        flex: 1,

        alignItems: 'center',
        justifyContent: 'center',

        paddingTop: 90,
    },

    emptyIconCircle: {
        width: 88,
        height: 88,

        borderRadius: 44,

        backgroundColor: colors.divider,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: spacing.md,
    },

    emptyText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
    },

    emptySubtext: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textLight,

        marginTop: 4,
    },
});