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
        time: '12:00 AM',
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
        time: '',
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
            <View key={trip.id} style={styles.tripCard}>

                {/* LEFT ICON */}
                <View
                    style={[
                        styles.tripIcon,
                        isCancelled
                            ? styles.cancelledIcon
                            : styles.completedIcon,
                    ]}>
                    <AppIcon
                        family="material"
                        name={trip.icon}
                        size={18}
                        color={
                            isCancelled
                                ? colors.danger
                                : colors.primary
                        }
                    />
                </View>

                {/* MIDDLE CONTENT */}
                <View style={styles.tripInfo}>

                    <Text style={styles.passengerName}>
                        {trip.name}
                    </Text>

                    <View style={styles.tripDetailsRow}>
                        <Text style={styles.pickupTime}>
                            {trip.pickupTime}
                        </Text>

                        {trip.distance ? (
                            <Text style={styles.distance}>
                                {trip.distance}
                            </Text>
                        ) : null}
                    </View>

                </View>

                {/* RIGHT CONTENT */}
                <View style={styles.tripRight}>

                    {trip.time ? (
                        <Text style={styles.tripTime}>
                            {trip.time}
                        </Text>
                    ) : null}

                    <Text style={styles.amount}>
                        {trip.amount}
                    </Text>

                    <Text
                        style={[
                            styles.status,
                            isCancelled
                                ? styles.cancelledStatus
                                : styles.completedStatus,
                        ]}>
                        {trip.status}
                    </Text>

                </View>

            </View>
        );
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}>

            {/* ================= HEADER ================= */}

            <View style={styles.header}>

                <Text style={styles.headerTitle}>
                    Trip History
                </Text>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.filterIconButton}>

                    <AppIcon
                        family="material"
                        name="filter-variant"
                        size={20}
                        color={colors.primary}
                    />

                </TouchableOpacity>

            </View>

            {/* ================= FILTERS ================= */}

            <View style={styles.filterContainer}>

                {(['All', 'Completed', 'Cancelled'] as FilterType[]).map(
                    filter => {

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
                                ]}>

                                <Text
                                    style={[
                                        styles.filterText,
                                        isActive &&
                                        styles.activeFilterText,
                                    ]}>
                                    {filter}
                                </Text>

                            </TouchableOpacity>
                        );
                    },
                )}

            </View>

            {/* ================= TRIPS ================= */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

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

                        <AppIcon
                            family="material"
                            name="clipboard-text-outline"
                            size={45}
                            color={colors.textLight}
                        />

                        <Text style={styles.emptyText}>
                            No trips found
                        </Text>

                    </View>
                )}

            </ScrollView>

        </SafeAreaView>
    );
};

export default TripsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    // ================= HEADER =================

    header: {
        height: 55,

        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: colors.textPrimary,
    },

    filterIconButton: {
        position: 'absolute',
        right: 20,

        width: 36,
        height: 36,

        alignItems: 'center',
        justifyContent: 'center',
    },

    // ================= FILTER =================

    filterContainer: {
        flexDirection: 'row',

        paddingHorizontal: 18,
        marginTop: 4,
        marginBottom: 12,

        justifyContent: 'space-between',
    },

    filterButton: {
        width: '30%',

        height: 36,

        borderRadius: 20,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#F1F3F7',
    },

    activeFilterButton: {
        backgroundColor: colors.primary,
    },

    filterText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        color: colors.textSecondary,
    },

    activeFilterText: {
        color: colors.textWhite,
        fontFamily: 'GoogleSans-Bold',
    },

    // ================= CONTENT =================

    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 100,
    },

    section: {
        marginTop: 8,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        color: colors.textSecondary,

        marginBottom: 7,
        marginLeft: 2,
    },

    // ================= TRIP CARD =================

    tripCard: {
        minHeight: 82,

        backgroundColor: colors.card,

        borderRadius: 12,

        marginBottom: 7,

        paddingHorizontal: 10,
        paddingVertical: 10,

        flexDirection: 'row',
        alignItems: 'center',
    },

    tripIcon: {
        width: 38,
        height: 38,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 10,
    },

    completedIcon: {
        backgroundColor: colors.infoLight,
    },

    cancelledIcon: {
        backgroundColor: colors.dangerLight,
    },

    // ================= TRIP INFO =================

    tripInfo: {
        flex: 1,

        justifyContent: 'center',
    },

    passengerName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        color: colors.textPrimary,

        marginBottom: 5,
    },

    tripDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    pickupTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textSecondary,

        marginRight: 14,
    },

    distance: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textSecondary,
    },

    // ================= RIGHT =================

    tripRight: {
        minWidth: 70,

        alignItems: 'flex-end',
    },

    tripTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,
        color: colors.textLight,

        marginBottom: 2,
    },

    amount: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: colors.textPrimary,

        marginBottom: 3,
    },

    status: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
    },

    completedStatus: {
        color: colors.successDark,
    },

    cancelledStatus: {
        color: colors.danger,
    },

    // ================= EMPTY =================

    emptyContainer: {
        flex: 1,

        alignItems: 'center',
        justifyContent: 'center',

        paddingTop: 100,
    },

    emptyText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        color: colors.textLight,

        marginTop: 10,
    },
});