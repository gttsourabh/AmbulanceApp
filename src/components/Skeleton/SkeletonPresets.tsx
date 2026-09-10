import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing } from '../../theme';

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
                width={42}
                height={42}
                borderRadius={13}
                style={styles.mr10}
            />

            {/* Middle: Passenger info */}
            <View style={styles.tripMiddle}>
                <Skeleton
                    variant="text"
                    width="70%"
                    height={16}
                    style={styles.mb6}
                />
                <View style={styles.rowCenter}>
                    <Skeleton
                        variant="circle"
                        width={12}
                        height={12}
                        style={styles.mr6}
                    />
                    <Skeleton
                        variant="text"
                        width="50%"
                        height={12}
                    />
                </View>
            </View>

            {/* Right: Time, Fare, Status */}
            <View style={styles.tripRight}>
                <Skeleton
                    variant="text"
                    width={45}
                    height={10}
                    style={styles.mb4}
                />
                <Skeleton
                    variant="text"
                    width={55}
                    height={16}
                    style={styles.mb6}
                />
                <Skeleton
                    variant="rounded"
                    width={64}
                    height={20}
                    borderRadius={8}
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
                width={38}
                height={38}
                borderRadius={19}
                style={styles.mr12}
            />

            {/* Content lines */}
            <View style={styles.notificationContent}>
                <Skeleton
                    variant="text"
                    width="55%"
                    height={14}
                    style={styles.mb6}
                />
                <Skeleton
                    variant="text"
                    width="85%"
                    height={12}
                />
            </View>

            {/* Time */}
            <Skeleton
                variant="text"
                width={40}
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
                            width={90}
                            height={12}
                            style={styles.mb8}
                        />
                        <Skeleton
                            variant="text"
                            width={160}
                            height={28}
                        />
                    </View>
                    <Skeleton
                        variant="circle"
                        width={44}
                        height={44}
                        borderRadius={22}
                    />
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Skeleton
                            variant="text"
                            width={60}
                            height={11}
                            style={styles.mb4}
                        />
                        <Skeleton
                            variant="text"
                            width={40}
                            height={16}
                        />
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Skeleton
                            variant="text"
                            width={75}
                            height={11}
                            style={styles.mb4}
                        />
                        <Skeleton
                            variant="text"
                            width={50}
                            height={16}
                        />
                    </View>
                </View>
            </View>

            {/* Section Title */}
            <Skeleton
                variant="text"
                width={140}
                height={13}
                style={styles.mb12}
            />

            {/* 3 Transaction Cards */}
            {[1, 2, 3].map(key => (
                <View key={key} style={styles.transactionCard}>
                    <View style={styles.transactionRow}>
                        <Skeleton
                            variant="circle"
                            width={38}
                            height={38}
                            borderRadius={19}
                            style={styles.mr12}
                        />
                        <View style={styles.flex1}>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={14}
                                style={styles.mb4}
                            />
                            <Skeleton
                                variant="text"
                                width="35%"
                                height={11}
                            />
                        </View>
                        <Skeleton
                            variant="text"
                            width={65}
                            height={16}
                        />
                    </View>
                </View>
            ))}
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
                        width={100}
                        height={12}
                        style={styles.mb6}
                    />
                    <Skeleton
                        variant="text"
                        width={150}
                        height={20}
                    />
                </View>
                <Skeleton
                    variant="circle"
                    width={40}
                    height={40}
                    borderRadius={20}
                />
            </View>

            {/* Big Emergency Card placeholder */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={160}
                borderRadius={20}
                style={styles.mb20}
            />

            {/* Section title */}
            <Skeleton
                variant="text"
                width={130}
                height={16}
                style={styles.mb14}
            />

            {/* Overview Card with 3 rows */}
            <View style={styles.overviewCard}>
                {[1, 2, 3].map(item => (
                    <View key={item} style={styles.overviewRow}>
                        <View style={styles.rowLeft}>
                            <Skeleton
                                variant="rounded"
                                width={32}
                                height={32}
                                borderRadius={10}
                                style={styles.mr10}
                            />
                            <Skeleton
                                variant="text"
                                width={80}
                                height={14}
                            />
                        </View>
                        <Skeleton
                            variant="text"
                            width={40}
                            height={16}
                        />
                    </View>
                ))}
            </View>

            {/* Action button */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={52}
                borderRadius={14}
                style={styles.mt18}
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
    mb4: { marginBottom: 4 },
    mb6: { marginBottom: 6 },
    mb8: { marginBottom: 8 },
    mb12: { marginBottom: 12 },
    mb14: { marginBottom: 14 },
    mb20: { marginBottom: 20 },
    mt18: { marginTop: 18 },
    flex1: { flex: 1 },
    selfStart: { alignSelf: 'flex-start', marginTop: 4 },

    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Trip Card Skeleton
    tripCardContainer: {
        backgroundColor: colors.card,
        borderRadius: 14,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tripMiddle: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: spacing.xs,
    },
    tripRight: {
        minWidth: 82,
        alignItems: 'flex-end',
    },

    // Notification Skeleton
    notificationRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: spacing.sm,
    },

    // Earnings Skeleton
    earningsContainer: {
        paddingTop: 10,
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 16,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
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
    statDivider: {
        width: StyleSheet.hairlineWidth,
        height: 38,
        backgroundColor: colors.divider,
        marginHorizontal: 15,
    },
    transactionCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Home Skeleton
    homeContainer: {
        paddingTop: spacing.xs,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    overviewCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
