import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../theme';

// ============================================================================
// BASIC BUILDING BLOCKS
// ============================================================================

export interface SkeletonTextProps {
    lines?: number;
    gap?: number;
    lineHeight?: number;
    lastLineWidth?: DimensionValue;
    width?: DimensionValue;
}

/**
 * Text block skeleton with natural multi-line layout (last line is shorter).
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
    lines = 2,
    gap = 6,
    lineHeight = 14,
    lastLineWidth = '60%',
    width = '100%',
}) => {
    return (
        <View style={{ width, gap }}>
            {Array.from({ length: lines }).map((_, index) => {
                const isLast = index === lines - 1;
                return (
                    <Skeleton
                        key={index}
                        variant="text"
                        height={lineHeight}
                        width={isLast && lines > 1 ? lastLineWidth : '100%'}
                    />
                );
            })}
        </View>
    );
};

export interface SkeletonCircleProps {
    size?: number;
}

/**
 * Circular avatar / icon skeleton.
 */
export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size = 44 }) => {
    return (
        <Skeleton
            variant="circle"
            width={size}
            height={size}
            borderRadius={size / 2}
        />
    );
};

// ============================================================================
// SCREEN-SPECIFIC PRESETS
// ============================================================================

/**
 * Skeleton placeholder for a single trip card in TripsScreen.
 */
export const TripCardSkeleton: React.FC = () => {
    return (
        <View style={styles.tripCardContainer}>
            {/* Left Icon */}
            <Skeleton
                variant="rounded"
                width={40}
                height={40}
                borderRadius={12}
                style={styles.mr10}
            />

            {/* Middle: Passenger info */}
            <View style={styles.tripMiddle}>
                <Skeleton
                    variant="text"
                    width="65%"
                    height={14}
                    style={styles.mb4}
                />
                <View style={styles.rowCenter}>
                    <Skeleton
                        variant="circle"
                        width={10}
                        height={10}
                        style={styles.mr6}
                    />
                    <Skeleton
                        variant="text"
                        width="45%"
                        height={11}
                    />
                </View>
            </View>

            {/* Right: Time, Fare, Status */}
            <View style={styles.tripRight}>
                <Skeleton
                    variant="text"
                    width={40}
                    height={10}
                    style={styles.mb3}
                />
                <Skeleton
                    variant="text"
                    width={50}
                    height={15}
                    style={styles.mb4}
                />
                <Skeleton
                    variant="rounded"
                    width={60}
                    height={19}
                    borderRadius={6}
                />
            </View>
        </View>
    );
};

/**
 * Skeleton placeholder for notification rows in NotificationsScreen.
 */
export const NotificationCardSkeleton: React.FC = () => {
    return (
        <View style={styles.notificationRow}>
            {/* Left circular icon */}
            <Skeleton
                variant="circle"
                width={34}
                height={34}
                borderRadius={17}
                style={styles.mr10}
            />

            {/* Content lines */}
            <View style={styles.notificationContent}>
                <Skeleton
                    variant="text"
                    width="55%"
                    height={13}
                    style={styles.mb3}
                />
                <Skeleton
                    variant="text"
                    width="85%"
                    height={11}
                />
            </View>

            {/* Time */}
            <Skeleton
                variant="text"
                width={36}
                height={10}
                style={styles.selfStart}
            />
        </View>
    );
};

/**
 * Skeleton placeholder for the EarningsScreen.
 */
export const EarningsCardSkeleton: React.FC = () => {
    return (
        <View style={styles.earningsContainer}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                    <View>
                        <Skeleton
                            variant="text"
                            width={80}
                            height={11}
                            style={styles.mb4}
                        />
                        <Skeleton
                            variant="text"
                            width={140}
                            height={25}
                        />
                    </View>
                    <Skeleton
                        variant="circle"
                        width={40}
                        height={40}
                        borderRadius={20}
                    />
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Skeleton
                            variant="text"
                            width={55}
                            height={10}
                            style={styles.mb3}
                        />
                        <Skeleton
                            variant="text"
                            width={38}
                            height={14}
                        />
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Skeleton
                            variant="text"
                            width={65}
                            height={10}
                            style={styles.mb3}
                        />
                        <Skeleton
                            variant="text"
                            width={45}
                            height={14}
                        />
                    </View>
                </View>
            </View>

            {/* Section Title */}
            <Skeleton
                variant="text"
                width={130}
                height={11}
                style={[styles.mb8, styles.ml2]}
            />

            {/* Transactions Card with Rows */}
            <View style={styles.transactionCardContainer}>
                {[1, 2, 3].map((key, index) => (
                    <View
                        key={key}
                        style={[
                            styles.transactionRow,
                            index === 2 && styles.lastRow,
                        ]}
                    >
                        <Skeleton
                            variant="rounded"
                            width={34}
                            height={34}
                            borderRadius={10}
                            style={styles.mr10}
                        />
                        <View style={styles.flex1}>
                            <Skeleton
                                variant="text"
                                width="55%"
                                height={12}
                                style={styles.mb3}
                            />
                            <Skeleton
                                variant="text"
                                width="30%"
                                height={10}
                            />
                        </View>
                        <Skeleton
                            variant="rounded"
                            width={55}
                            height={20}
                            borderRadius={6}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

/**
 * Skeleton placeholder for the HomeScreen.
 */
export const HomeScreenSkeleton: React.FC = () => {
    return (
        <View style={styles.homeContainer}>
            {/* Greeting row */}
            <View style={styles.greetingSection}>
                <View style={styles.flex1}>
                    <Skeleton
                        variant="text"
                        width={90}
                        height={12}
                        style={styles.mb4}
                    />
                    <Skeleton
                        variant="text"
                        width={140}
                        height={18}
                    />
                </View>
                <Skeleton
                    variant="circle"
                    width={44}
                    height={44}
                    borderRadius={22}
                />
            </View>

            {/* Emergency Card placeholder */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={114}
                borderRadius={16}
                style={styles.mb14}
            />

            {/* Section title */}
            <Skeleton
                variant="text"
                width={110}
                height={13}
                style={styles.mb8}
            />

            {/* Overview Card with 3 rows */}
            <View style={styles.overviewCard}>
                {[1, 2, 3].map((item, index) => (
                    <View
                        key={item}
                        style={[
                            styles.overviewRow,
                            index === 2 && styles.lastRow,
                        ]}
                    >
                        <View style={styles.rowLeft}>
                            <Skeleton
                                variant="rounded"
                                width={32}
                                height={32}
                                borderRadius={9}
                                style={styles.mr10}
                            />
                            <Skeleton
                                variant="text"
                                width={75}
                                height={13}
                            />
                        </View>
                        <Skeleton
                            variant="text"
                            width={35}
                            height={14}
                        />
                    </View>
                ))}
            </View>

            {/* Action button */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={46}
                borderRadius={13}
                style={styles.mt12}
            />
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    mr6: { marginRight: 6 },
    mr10: { marginRight: 10 },
    mr12: { marginRight: 12 },
    mb3: { marginBottom: 3 },
    mb4: { marginBottom: 4 },
    mb6: { marginBottom: 6 },
    mb8: { marginBottom: 8 },
    mb12: { marginBottom: 12 },
    mb14: { marginBottom: 14 },
    mt12: { marginTop: 12 },
    ml2: { marginLeft: 2 },
    flex1: { flex: 1 },
    selfStart: { alignSelf: 'flex-start', marginTop: 2 },

    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Trip Card Skeleton
    tripCardContainer: {
        backgroundColor: colors.card,
        borderRadius: 14,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tripMiddle: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 6,
    },
    tripRight: {
        minWidth: 80,
        alignItems: 'flex-end',
    },

    // Notification Skeleton
    notificationRow: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 6,
    },

    // Earnings Skeleton
    earningsContainer: {
        paddingTop: 0,
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 13,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },
    statItem: {
        flex: 1,
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 30,
        backgroundColor: colors.divider,
        marginHorizontal: 14,
    },
    transactionCardContainer: {
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    transactionRow: {
        minHeight: 56,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },

    // Home Skeleton
    homeContainer: {
        paddingTop: 0,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 12,
    },
    overviewCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    overviewRow: {
        minHeight: 48,
        paddingVertical: 6,
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
});
