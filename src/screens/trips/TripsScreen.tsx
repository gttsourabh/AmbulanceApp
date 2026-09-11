import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../icons';
import { colors, typography } from '../../theme';
import { Skeleton, TripCardSkeleton } from '../../components/Skeleton';

type FilterType = 'All' | 'Accepted' | 'Rejected';

interface Trip {
    id: number;
    name: string;
    time: string;
    pickupTime: string;
    distance: string;
    amount: string;
    status: 'Accepted' | 'Rejected';
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
        status: 'Accepted',
        icon: 'account',
    },
    {
        id: 2,
        name: 'Alice Smith',
        time: '10:15 AM',
        pickupTime: '2:20 PM',
        distance: '8.6 km',
        amount: '₹280',
        status: 'Accepted',
        icon: 'account',
    },
    {
        id: 3,
        name: 'Robert Brown',
        time: '10:20 AM',
        pickupTime: '6:45 PM',
        distance: '10.2 km',
        amount: '₹310',
        status: 'Accepted',
        icon: 'account',
    },
    {
        id: 4,
        name: 'Rejected Trip',
        time: '11:30 AM',
        pickupTime: '3:20 PM',
        distance: '',
        amount: '₹0',
        status: 'Rejected',
        icon: 'close-circle',
    },
];

const TripsScreen = () => {
    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('All');
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setIsLoading(true);
        setTimeout(() => {
            setRefreshing(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleFilterChange = (filter: FilterType) => {
        if (filter === selectedFilter) return;
        setSelectedFilter(filter);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 450);
    };

    const filteredTrips = trips.filter(trip => {
        if (selectedFilter === 'All') {
            return true;
        }

        return trip.status === selectedFilter;
    });

    const todayTrips = filteredTrips.slice(0, 2);
    const yesterdayTrips = filteredTrips.slice(2);

    const renderTrip = (trip: Trip) => {
        const isRejected = trip.status === 'Rejected';

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
                        isRejected
                            ? styles.rejectedIcon
                            : styles.acceptedIcon,
                    ]}
                >
                    <AppIcon
                        family="material"
                        name={trip.icon}
                        size={20}
                        color={
                            isRejected
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
                            isRejected
                                ? styles.rejectedPill
                                : styles.acceptedPill,
                        ]}
                    >
                        <Text
                            style={[
                                styles.status,
                                isRejected
                                    ? styles.rejectedStatus
                                    : styles.acceptedStatus,
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
                    ['All', 'Accepted', 'Rejected'] as FilterType[]
                ).map(filter => {

                    const isActive =
                        selectedFilter === filter;

                    return (
                        <TouchableOpacity
                            key={filter}
                            activeOpacity={0.8}
                            onPress={() =>
                                handleFilterChange(filter)
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {isLoading ? (
                    <View style={styles.section}>
                        <Skeleton
                            variant="text"
                            width={50}
                            height={11}
                            style={styles.sectionTitleSkeleton}
                        />
                        <TripCardSkeleton />
                        <TripCardSkeleton />
                        <TripCardSkeleton />
                        <TripCardSkeleton />
                    </View>
                ) : (
                    <>
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
                                    Your accepted and rejected trips will show up here
                                </Text>

                            </View>
                        )}
                    </>
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

        paddingHorizontal: 16,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.lg,
        lineHeight: 22,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    filterIconButton: {
        position: 'absolute',
        right: 16,

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

        marginHorizontal: 16,

        marginTop: 4,
        marginBottom: 10,

        padding: 3,

        borderRadius: 14,

        backgroundColor: colors.divider,
    },

    filterButton: {
        flex: 1,

        height: 34,

        borderRadius: 11,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'transparent',
    },

    activeFilterButton: {
        backgroundColor: colors.card,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
        elevation: 2,
    },

    filterText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.textSecondary,
    },

    activeFilterText: {
        color: colors.primary,
        fontFamily: 'GoogleSans-Bold',
        lineHeight: 16,
        includeFontPadding: false,
    },

    // =====================================================
    // CONTENT
    // =====================================================

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 96,
    },

    section: {
        marginTop: 6,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textLight,
        letterSpacing: 0.6,
        textTransform: 'uppercase',

        marginBottom: 8,
        marginLeft: 2,
    },

    sectionTitleSkeleton: {
        marginBottom: 8,
        marginLeft: 2,
    },

    // =====================================================
    // TRIP CARD
    // =====================================================

    tripCard: {
        backgroundColor: colors.card,

        borderRadius: 14,

        marginBottom: 10,

        paddingHorizontal: 12,
        paddingVertical: 11,

        borderWidth: 1,
        borderColor: colors.border,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    // =====================================================
    // TRIP ICON
    // =====================================================

    tripIcon: {
        width: 40,
        height: 40,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 10,
    },

    acceptedIcon: {
        backgroundColor: colors.infoLight,
    },

    rejectedIcon: {
        backgroundColor: colors.dangerLight,
    },

    // =====================================================
    // TRIP INFO
    // =====================================================

    tripInfo: {
        flex: 1,

        justifyContent: 'center',

        paddingRight: 6,
    },

    passengerName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 13.5,
        lineHeight: 17,
        includeFontPadding: false,
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
        fontSize: 11.5,
        lineHeight: 15,
        includeFontPadding: false,
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
        fontSize: 11.5,
        lineHeight: 15,
        includeFontPadding: false,
        color: colors.textSecondary,
    },

    // =====================================================
    // RIGHT
    // =====================================================

    tripRight: {
        minWidth: 80,

        alignItems: 'flex-end',
    },

    tripTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textLight,

        marginBottom: 3,
    },

    amount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14.5,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.textPrimary,

        marginBottom: 4,
    },

    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2.5,

        borderRadius: 6,
    },

    acceptedPill: {
        backgroundColor: colors.successLight,
    },

    rejectedPill: {
        backgroundColor: colors.dangerLight,
    },

    status: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        lineHeight: 13,
        includeFontPadding: false,
        letterSpacing: 0.2,
    },

    acceptedStatus: {
        color: colors.successDark,
    },

    rejectedStatus: {
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

        marginBottom: 12,
    },

    emptyText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.textPrimary,
    },

    emptySubtext: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.textLight,

        marginTop: 4,
    },
});