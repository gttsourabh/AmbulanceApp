import React, { useState, useEffect, useCallback, cacheSignal } from 'react';
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
import {
    Skeleton,
    TripCardSkeleton,
    DateRangePickerModal,
    ExportTripModal,
    formatDisplayDate,
} from '../../components';
import { useAppSelector } from '../../redux/hook';
import {
    getAmbulanceRequestApi,
    AmbulanceRequestItem,
    GetAmbulanceRequestPayload,
    RequestFilterItem,
} from '../../api/driverApi';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';

type FilterType = 'All' | 'Completed' | 'Cancelled';

interface Trip {
    id: number;
    name: string;
    time: string;
    pickupTime: string;
    distance: string;
    amount?: string;
    status: string;
    rawStatus: string;
    icon: string;
    dateCategory: 'Today' | 'Yesterday' | 'Earlier';
    address?: string;
    emergencyType?: string;
    phone?: string;
    dropAddress?: string;
    ambulanceNo?: string;
    driverName?: string;
    cancellationReason?: string;
    createdAt?: string;
}

// Static mock trips commented out for dynamic API integration:
/*
const staticTrips: Trip[] = [
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
    ...
];
*/

const TripsScreen = () => {
    const user = useAppSelector(state => state.auth.user);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const currentYear = new Date().getFullYear();
    const [startDate, setStartDate] = useState<string>(`${currentYear}-01-01`);
    const [endDate, setEndDate] = useState<string>(`${currentYear}-12-31`);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrips = useCallback(
        async (
            filter: FilterType = selectedFilter,
            start: string = startDate,
            end: string = endDate,
        ) => {
            try {
                console.log(`📡 [TRIPS API] Fetching trips with filter: ${filter}, dates: ${start} to ${end}`);

                // 1. Status filter based on request: All, Completed, Cancelled
                const statusFilter: RequestFilterItem =
                    filter === 'Completed'
                        ? { column: 'status', operator: '=', value: 'completed' }
                        : filter === 'Cancelled'
                            ? { column: 'status', operator: '=', value: 'cancelled' }
                            : { column: 'status', operator: 'IN', value: ['completed', 'cancelled', "assigned", "dispatched", "arriving"] };

                // 2. Date range filter for created_at (dynamic between dates from Date Picker)
                const dateFilter: RequestFilterItem = {
                    column: 'created_at',
                    operator: 'BETWEEN',
                    value: [start, end],
                };

                // 3. Build payload in the requested format
                const payload: GetAmbulanceRequestPayload = {
                    pageIndex: 1,
                    pageSize: 10,
                    sortKey: 'created_at',
                    sortValue: 'DESC',
                    filters: [statusFilter, dateFilter],
                };

                console.log('📡 [TRIPS API PAYLOAD]:', JSON.stringify(payload, null, 2));

                const res = await getAmbulanceRequestApi(payload);
                console.log('📡 [TRIPS API RESPONSE]:', res?.data);

                let dataItems: AmbulanceRequestItem[] = [];
                const rawData: any = res?.data?.data;
                const rawRes: any = res?.data;
                if (Array.isArray(rawData)) {
                    dataItems = rawData;
                } else if (Array.isArray(rawData?.records)) {
                    dataItems = rawData.records;
                } else if (Array.isArray(rawData?.items)) {
                    dataItems = rawData.items;
                } else if (Array.isArray(rawData?.rows)) {
                    dataItems = rawData.rows;
                } else if (Array.isArray(rawRes?.result)) {
                    dataItems = rawRes.result;
                } else if (Array.isArray(rawRes?.records)) {
                    dataItems = rawRes.records;
                } else if (Array.isArray(rawRes)) {
                    dataItems = rawRes;
                }

                console.log(`✅ [TRIPS API SUCCESS] Received ${dataItems.length} trips`);

                const mapped: Trip[] = dataItems.map(item => {
                    const rawSt = String(item.status || 'requested').toLowerCase();
                    const isCancelled = rawSt.includes('cancel');
                    const isCompleted = rawSt.includes('complete');
                    const isAssigned = rawSt.includes('assign');
                    const isDispatched = rawSt.includes('dispatch');
                    const isArriving = rawSt.includes('arriv');

                    let displayStatus = 'Active';
                    if (isCancelled) displayStatus = 'Cancelled';
                    else if (isCompleted) displayStatus = 'Completed';
                    else if (isArriving) displayStatus = 'Arriving';
                    else if (isDispatched) displayStatus = 'Dispatched';
                    else if (isAssigned) displayStatus = 'Assigned';
                    else displayStatus = rawSt.charAt(0).toUpperCase() + rawSt.slice(1);

                    let dateCategory: 'Today' | 'Yesterday' | 'Earlier' = 'Earlier';
                    let timeStr = '--';
                    if (item.created_at) {
                        const d = new Date(item.created_at);
                        if (!isNaN(d.getTime())) {
                            const now = new Date();
                            const isToday = d.toDateString() === now.toDateString();
                            const yesterday = new Date();
                            yesterday.setDate(now.getDate() - 1);
                            const isYesterday = d.toDateString() === yesterday.toDateString();

                            dateCategory = isToday ? 'Today' : isYesterday ? 'Yesterday' : 'Earlier';
                            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        }
                    }

                    // Format ETA / pickup time
                    const pickupTimeStr = item.time || (item.eta_minutes ? `${item.eta_minutes} mins` : timeStr);

                    // Real distance from np_distance or ph_distance or distance
                    const rawDist = item.np_distance || item.ph_distance || item.distance;
                    let distanceStr = '';
                    if (rawDist) {
                        const num = parseFloat(String(rawDist));
                        distanceStr = !isNaN(num) ? `${num.toFixed(1)} km` : `${rawDist} km`;
                    }

                    return {
                        id: item.id,
                        name: item.patient_name ? item.patient_name.trim() : 'Emergency Patient',
                        time: timeStr,
                        pickupTime: pickupTimeStr,
                        distance: distanceStr,
                        amount: '',
                        status: displayStatus,
                        rawStatus: rawSt,
                        icon: isCancelled ? 'close-circle' : isCompleted ? 'check-circle' : 'ambulance',
                        dateCategory,
                        address: item.pickup_address || '',
                        emergencyType: item.emergency_type ? item.emergency_type.trim() : '',
                        phone: item.requester_phone || '--',
                        dropAddress: item.drop_address || '--',
                        ambulanceNo: item.ambulance_no || '--',
                        driverName: item.driver_name || '--',
                        cancellationReason: item.cancellation_reason || '--',
                        createdAt: item.created_at || '',
                    };
                });

                setTrips(mapped);
            } catch (error) {
                console.warn('❌ [TRIPS API ERROR]:', error);
            } finally {
                setIsLoading(false);
                setRefreshing(false);
            }
        },
        [selectedFilter, startDate, endDate],
    );

    useEffect(() => {
        fetchTrips(selectedFilter, startDate, endDate);
    }, [fetchTrips, selectedFilter, startDate, endDate]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTrips(selectedFilter, startDate, endDate);
    };

    const handleFilterChange = (filter: FilterType) => {
        if (filter === selectedFilter) return;
        setSelectedFilter(filter);
        setIsLoading(true);
        fetchTrips(filter, startDate, endDate);
    };

    const handleApplyDateRange = (newStart: string, newEnd: string) => {
        setStartDate(newStart);
        setEndDate(newEnd);
        setIsLoading(true);
        fetchTrips(selectedFilter, newStart, newEnd);
    };

    const filteredTrips = trips.filter(trip => {
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Completed') return trip.rawStatus === 'completed';
        if (selectedFilter === 'Cancelled') return trip.rawStatus.includes('cancel');
        return true;
    });

    const todayTrips = filteredTrips.filter(t => t.dateCategory === 'Today');
    const yesterdayTrips = filteredTrips.filter(t => t.dateCategory === 'Yesterday');
    const earlierTrips = filteredTrips.filter(t => t.dateCategory === 'Earlier');

    const renderTrip = (trip: Trip) => {
        const isCancelled = trip.status === 'Cancelled';
        const isCompleted = trip.status === 'Completed';
        const isAssigned = trip.status === 'Assigned';

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
                            ? styles.rejectedIcon
                            : isCompleted
                            ? styles.completedIcon
                            : isAssigned
                            ? styles.assignedIcon
                            : styles.dispatchedIcon,
                    ]}
                >
                    <AppIcon
                        family="material"
                        name={trip.icon}
                        size={20}
                        color={
                            isCancelled
                                ? colors.danger
                                : isCompleted
                                ? colors.successDark
                                : isAssigned
                                ? colors.warning
                                : colors.primary
                        }
                    />
                </View>

                {/* =====================================================
            TRIP INFO
        ===================================================== */}

                <View style={styles.tripInfo}>
                    <View style={styles.passengerNameRow}>
                        <Text
                            style={styles.passengerName}
                            numberOfLines={1}
                        >
                            {trip.name}
                        </Text>
                        <Text style={styles.tripIdBadge}>#{trip.id}</Text>
                    </View>

                    <View style={styles.tripDetailsRow}>
                        {trip.emergencyType ? (
                            <>
                                <Text style={styles.emergencyTypeText} numberOfLines={1}>
                                    {trip.emergencyType}
                                </Text>
                                <View style={styles.dotSeparator} />
                            </>
                        ) : null}

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
            RIGHT (Time + Status Pill, NO EARNINGS)
        ===================================================== */}

                <View style={styles.tripRight}>
                    <Text style={styles.tripTime}>
                        {trip.time}
                    </Text>

                    <View
                        style={[
                            styles.statusPill,
                            isCancelled
                                ? styles.rejectedPill
                                : isCompleted
                                ? styles.acceptedPill
                                : isAssigned
                                ? styles.assignedPill
                                : styles.dispatchedPill,
                        ]}
                    >
                        <Text
                            style={[
                                styles.status,
                                isCancelled
                                    ? styles.rejectedStatus
                                    : isCompleted
                                    ? styles.acceptedStatus
                                    : isAssigned
                                    ? styles.assignedStatus
                                    : styles.dispatchedStatus,
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

                <View style={styles.headerRightButtons}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.headerIconButton, styles.exportIconButton]}
                        onPress={() => setIsExportModalVisible(true)}
                    >
                        <AppIcon
                            family="material"
                            name="file-excel-box"
                            size={20}
                            color="#107C41"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.headerIconButton}
                        onPress={() => setIsDatePickerVisible(true)}
                    >
                        <AppIcon
                            family="material"
                            name="calendar-month"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.headerIconButton}
                        onPress={handleRefresh}
                    >
                        <AppIcon
                            family="material"
                            name="refresh"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* =====================================================
          DATE RANGE SELECTOR
      ===================================================== */}

            <View style={styles.dateBarContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dateBarButton}
                    onPress={() => setIsDatePickerVisible(true)}
                >
                    <View style={styles.dateBarLeft}>
                        <View style={styles.calendarIconCircle}>
                            <AppIcon
                                family="material"
                                name="calendar-range"
                                size={17}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.dateBarTexts}>
                            <Text style={styles.dateBarLabel}>DATE RANGE (BETWEEN)</Text>
                            <Text style={styles.dateBarValue}>
                                {formatDisplayDate(startDate)} — {formatDisplayDate(endDate)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dateBarRight}>
                        <View style={styles.filterChip}>
                            <Text style={styles.filterChipText}>Filter</Text>
                            <AppIcon
                                family="material"
                                name="chevron-down"
                                size={14}
                                color={colors.primary}
                            />
                        </View>
                    </View>
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

                        {/* EARLIER */}

                        {earlierTrips.length > 0 && (
                            <View style={styles.section}>

                                <Text style={styles.sectionTitle}>
                                    Earlier
                                </Text>

                                {earlierTrips.map(renderTrip)}

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
                                    Your completed and cancelled trips will show up here
                                </Text>

                            </View>
                        )}
                    </>
                )}

            </ScrollView>

            <DateRangePickerModal
                visible={isDatePickerVisible}
                initialStartDate={startDate}
                initialEndDate={endDate}
                onClose={() => setIsDatePickerVisible(false)}
                onApply={handleApplyDateRange}
            />

            <ExportTripModal
                visible={isExportModalVisible}
                onClose={() => setIsExportModalVisible(false)}
                currentTrips={trips}
                startDate={startDate}
                endDate={endDate}
                onOpenDatePicker={() => setIsDatePickerVisible(true)}
            />
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
        justifyContent: 'space-between',
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.lg,
        lineHeight: 22,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    headerIconButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryLight,
    },

    exportIconButton: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },

    // =====================================================
    // DATE RANGE BAR
    // =====================================================

    dateBarContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },

    dateBarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E8EFF1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    dateBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    calendarIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },

    dateBarTexts: {
        justifyContent: 'center',
    },

    dateBarLabel: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 2,
        includeFontPadding: false,
    },

    dateBarValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        includeFontPadding: false,
    },

    dateBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
    },

    filterChipText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
        includeFontPadding: false,
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

    completedIcon: {
        backgroundColor: colors.successLight,
    },

    assignedIcon: {
        backgroundColor: colors.warningLight,
    },

    dispatchedIcon: {
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

    passengerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3,
    },

    passengerName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 13.5,
        lineHeight: 17,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    tripIdBadge: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textLight,
    },

    emergencyTypeText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11.5,
        lineHeight: 15,
        includeFontPadding: false,
        color: colors.danger,
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
        minWidth: 72,

        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    tripTime: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textLight,

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

    assignedPill: {
        backgroundColor: colors.warningLight,
    },

    dispatchedPill: {
        backgroundColor: colors.infoLight,
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

    assignedStatus: {
        color: colors.warning,
    },

    dispatchedStatus: {
        color: colors.primary,
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