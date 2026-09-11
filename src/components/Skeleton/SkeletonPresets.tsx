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
                    style={styles.mb2}
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

/**
 * Skeleton placeholder for the ProfileScreen.
 */
export const ProfileScreenSkeleton: React.FC = () => {
    return (
        <>
            {/* PROFILE SECTION SKELETON */}
            <View style={styles.profileSection}>
                {/* Avatar Ring */}
                <View style={styles.profileImageRing}>
                    <View style={styles.profileImageContainer}>
                        <Skeleton
                            variant="circle"
                            width={82}
                            height={82}
                            borderRadius={41}
                        />
                    </View>
                    <View style={styles.profileEditBadgeSkeleton}>
                        <Skeleton
                            variant="circle"
                            width={26}
                            height={26}
                            borderRadius={13}
                        />
                    </View>
                </View>

                {/* Name */}
                <Skeleton
                    variant="text"
                    width={140}
                    height={16}
                    style={styles.mb2}
                />

                {/* Phone Number */}
                <Skeleton
                    variant="text"
                    width={105}
                    height={12}
                    style={styles.mb6}
                />

                {/* Verified Badge Pill */}
                <Skeleton
                    variant="rounded"
                    width={105}
                    height={22}
                    borderRadius={11}
                />
            </View>

            {/* OPTIONS CARD SKELETON */}
            <View style={styles.profileOptionsCard}>
                {[1, 2, 3, 4].map((item, index) => (
                    <React.Fragment key={item}>
                        <View style={styles.profileOptionRow}>
                            {/* Option Icon Container */}
                            <Skeleton
                                variant="rounded"
                                width={40}
                                height={40}
                                borderRadius={13}
                                style={styles.mr12}
                            />

                            {/* Option Content (Title + Subtitle) */}
                            <View style={styles.profileOptionContent}>
                                <Skeleton
                                    variant="text"
                                    width={index % 2 === 0 ? '52%' : '60%'}
                                    height={14}
                                    style={styles.mb2}
                                />
                                <Skeleton
                                    variant="text"
                                    width={index % 2 === 0 ? '80%' : '72%'}
                                    height={12}
                                />
                            </View>

                            {/* Chevron Right Circle */}
                            <View style={styles.profileChevronContainer}>
                                <Skeleton
                                    variant="circle"
                                    width={16}
                                    height={16}
                                    borderRadius={8}
                                />
                            </View>
                        </View>

                        {/* Divider between items */}
                        {index < 3 && <View style={styles.profileDivider} />}
                    </React.Fragment>
                ))}
            </View>

            {/* LOGOUT BUTTON SKELETON */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={48}
                borderRadius={16}
                style={styles.mt12}
            />

            {/* VERSION SKELETON */}
            <View style={styles.profileVersionContainer}>
                <Skeleton
                    variant="text"
                    width={78}
                    height={12}
                />
            </View>
        </>
    );
};

/**
 * Skeleton placeholder for UserInfo screen.
 */
export const UserInfoSkeleton: React.FC = () => {
    return (
        <>
            {/* PROFILE SECTION SKELETON */}
            <View style={styles.userInfoProfileSection}>
                {/* Avatar */}
                <View style={styles.userInfoAvatarContainer}>
                    <Skeleton
                        variant="circle"
                        width={76}
                        height={76}
                        borderRadius={38}
                    />
                </View>

                {/* Name */}
                <Skeleton
                    variant="text"
                    width={130}
                    height={16}
                    style={styles.mt3}
                />

                {/* Phone Number */}
                <Skeleton
                    variant="text"
                    width={95}
                    height={12}
                    style={styles.mt3}
                />
            </View>

            {/* SECTION TITLE */}
            <Skeleton
                variant="text"
                width={85}
                height={11}
                style={styles.userInfoSectionTitleSkeleton}
            />

            {/* INFO CARD SKELETON */}
            <View style={styles.userInfoCard}>
                {[1, 2, 3].map((item, index) => (
                    <React.Fragment key={item}>
                        <View style={styles.userInfoRow}>
                            {/* Icon */}
                            <Skeleton
                                variant="rounded"
                                width={38}
                                height={38}
                                borderRadius={12}
                                style={styles.mr10}
                            />

                            {/* Content */}
                            <View style={styles.userInfoContent}>
                                <Skeleton
                                    variant="text"
                                    width={index === 0 ? '45%' : index === 1 ? '40%' : '38%'}
                                    height={13}
                                    style={styles.mb2}
                                />
                                <Skeleton
                                    variant="text"
                                    width={index === 0 ? '60%' : index === 1 ? '30%' : '35%'}
                                    height={11}
                                />
                            </View>

                            {/* Arrow */}
                            <View style={styles.userInfoChevronContainer}>
                                <Skeleton
                                    variant="circle"
                                    width={16}
                                    height={16}
                                    borderRadius={8}
                                />
                            </View>
                        </View>

                        {/* Divider */}
                        {index < 2 && <View style={styles.userInfoDivider} />}
                    </React.Fragment>
                ))}
            </View>
        </>
    );
};

/**
 * Skeleton placeholder for VehicleDocumentsScreen.
 */
export const VehicleDocumentsSkeleton: React.FC = () => {
    return (
        <>
            {/* VEHICLE CARD SKELETON */}
            <View style={styles.vehicleCardSkeleton}>
                <View style={styles.vehicleInfoSkeleton}>
                    <Skeleton
                        variant="text"
                        width={90}
                        height={10}
                        style={styles.mb4}
                    />
                    <Skeleton
                        variant="text"
                        width={115}
                        height={16}
                        style={styles.mb3}
                    />
                    <Skeleton
                        variant="text"
                        width={85}
                        height={12}
                    />
                </View>
                <Skeleton
                    variant="rounded"
                    width={118}
                    height={78}
                    borderRadius={14}
                />
            </View>

            {/* SECTION HEADING SKELETON */}
            <Skeleton
                variant="text"
                width={70}
                height={11}
                style={styles.vehicleSectionHeadingSkeleton}
            />

            {/* DOCUMENTS CARD SKELETON */}
            <View style={styles.documentsCardSkeleton}>
                {[1, 2, 3, 4].map((item, index) => (
                    <React.Fragment key={item}>
                        <View style={styles.documentRowSkeleton}>
                            {/* Icon */}
                            <Skeleton
                                variant="rounded"
                                width={36}
                                height={36}
                                borderRadius={12}
                                style={styles.mr10}
                            />

                            {/* Document Info */}
                            <View style={styles.documentInfoSkeleton}>
                                <Skeleton
                                    variant="text"
                                    width={index % 2 === 0 ? '55%' : '45%'}
                                    height={12}
                                    style={index >= 2 ? styles.mb2 : undefined}
                                />
                                {index >= 2 && (
                                    <Skeleton
                                        variant="text"
                                        width="40%"
                                        height={10}
                                    />
                                )}
                            </View>

                            {/* Status Pill */}
                            <Skeleton
                                variant="rounded"
                                width={62}
                                height={22}
                                borderRadius={10}
                            />
                        </View>

                        {/* Divider */}
                        {index < 3 && <View style={styles.documentDividerSkeleton} />}
                    </React.Fragment>
                ))}
            </View>
        </>
    );
};

/**
 * Skeleton placeholder for SettingsScreen.
 */
export const SettingsScreenSkeleton: React.FC = () => {
    return (
        <>
            {/* GENERAL HEADING */}
            <Skeleton
                variant="text"
                width={55}
                height={11}
                style={styles.settingsSectionHeadingSkeleton}
            />

            {/* GENERAL CARD SKELETON */}
            <View style={styles.settingsCardSkeleton}>
                {[
                    { titleWidth: '40%', right: 'nav' },
                    { titleWidth: '55%', right: 'switch' },
                    { titleWidth: '35%', right: 'switch' },
                ].map((item, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.settingRowSkeleton}>
                            <Skeleton
                                variant="rounded"
                                width={36}
                                height={36}
                                borderRadius={12}
                                style={styles.mr10}
                            />
                            <Skeleton
                                variant="text"
                                width={item.titleWidth as any}
                                height={13}
                                style={styles.flex1}
                            />
                            {item.right === 'nav' ? (
                                <View style={styles.settingsRightNavSkeleton}>
                                    <Skeleton
                                        variant="text"
                                        width={40}
                                        height={11}
                                        style={styles.mr6}
                                    />
                                    <Skeleton
                                        variant="circle"
                                        width={16}
                                        height={16}
                                        borderRadius={8}
                                    />
                                </View>
                            ) : (
                                <Skeleton
                                    variant="rounded"
                                    width={38}
                                    height={22}
                                    borderRadius={11}
                                />
                            )}
                        </View>
                        {index < 2 && <View style={styles.settingDividerSkeleton} />}
                    </React.Fragment>
                ))}
            </View>

            {/* ABOUT HEADING */}
            <Skeleton
                variant="text"
                width={45}
                height={11}
                style={styles.settingsSectionHeadingSkeleton}
            />

            {/* ABOUT CARD SKELETON */}
            <View style={styles.settingsCardSkeleton}>
                {['50%', '60%', '55%'].map((width, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.settingRowSkeleton}>
                            <Skeleton
                                variant="rounded"
                                width={36}
                                height={36}
                                borderRadius={12}
                                style={styles.mr10}
                            />
                            <Skeleton
                                variant="text"
                                width={width as any}
                                height={13}
                                style={styles.flex1}
                            />
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                borderRadius={8}
                            />
                        </View>
                        {index < 2 && <View style={styles.settingDividerSkeleton} />}
                    </React.Fragment>
                ))}
            </View>

            {/* LOGOUT BUTTON SKELETON */}
            <Skeleton
                variant="rounded"
                width="100%"
                height={48}
                borderRadius={16}
                style={styles.mt16}
            />

            {/* VERSION SKELETON */}
            <View style={styles.settingsVersionContainer}>
                <Skeleton
                    variant="text"
                    width={78}
                    height={12}
                />
            </View>
        </>
    );
};

/**
 * Skeleton placeholder for HelpScreen.
 */
export const HelpScreenSkeleton: React.FC = () => {
    return (
        <>
            {/* QUESTION SKELETON */}
            <Skeleton
                variant="text"
                width={170}
                height={18}
                style={styles.mb8}
            />

            {/* HELP CARD SKELETON */}
            <View style={styles.helpCardSkeleton}>
                {['30%', '55%', '45%', '50%'].map((width, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.helpRowSkeleton}>
                            <Skeleton
                                variant="rounded"
                                width={36}
                                height={36}
                                borderRadius={12}
                                style={styles.mr10}
                            />
                            <Skeleton
                                variant="text"
                                width={width as any}
                                height={13}
                                style={styles.flex1}
                            />
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                borderRadius={8}
                            />
                        </View>
                        {index < 3 && <View style={styles.helpDividerSkeleton} />}
                    </React.Fragment>
                ))}
            </View>

            {/* EMERGENCY SUPPORT CARD SKELETON */}
            <View style={styles.emergencyCardSkeleton}>
                <Skeleton
                    variant="rounded"
                    width={44}
                    height={44}
                    borderRadius={14}
                    style={styles.mr10}
                />
                <View style={styles.flex1}>
                    <Skeleton
                        variant="text"
                        width={120}
                        height={10}
                        style={styles.mb6}
                    />
                    <Skeleton
                        variant="text"
                        width={130}
                        height={16}
                    />
                </View>
                <Skeleton
                    variant="circle"
                    width={44}
                    height={44}
                    borderRadius={22}
                />
            </View>
        </>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    mr6: { marginRight: 6 },
    mr10: { marginRight: 10 },
    mr12: { marginRight: 12 },
    mb2: { marginBottom: 2 },
    mb3: { marginBottom: 3 },
    mb4: { marginBottom: 4 },
    mb6: { marginBottom: 6 },
    mb8: { marginBottom: 8 },
    mb12: { marginBottom: 12 },
    mb14: { marginBottom: 14 },
    mt3: { marginTop: 3 },
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
        height: 52,
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

    // Profile Skeleton
    profileSection: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
    },
    profileImageRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.primaryLight,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    profileImageContainer: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profileEditBadgeSkeleton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        overflow: 'hidden',
    },
    profileOptionsCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    profileOptionRow: {
        minHeight: 56,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileOptionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 6,
    },
    profileChevronContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    profileDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 52,
    },
    profileVersionContainer: {
        alignItems: 'center',
        marginTop: 12,
    },

    // UserInfo Skeleton
    userInfoProfileSection: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
    },
    userInfoAvatarContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        marginBottom: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    userInfoSectionTitleSkeleton: {
        marginBottom: 8,
        marginLeft: 2,
    },
    userInfoCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    userInfoRow: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfoContent: {
        flex: 1,
        justifyContent: 'center',
    },
    userInfoChevronContainer: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    userInfoDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 48,
    },

    // Vehicle Documents Skeleton
    vehicleCardSkeleton: {
        height: 110,
        backgroundColor: colors.primaryLight,
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    vehicleInfoSkeleton: {
        flex: 1,
        justifyContent: 'center',
    },
    vehicleSectionHeadingSkeleton: {
        marginTop: 16,
        marginBottom: 8,
        marginLeft: 2,
    },
    documentsCardSkeleton: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    documentRowSkeleton: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    documentInfoSkeleton: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 6,
    },
    documentDividerSkeleton: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 46,
    },

    // Settings Skeleton
    settingsSectionHeadingSkeleton: {
        marginTop: 16,
        marginBottom: 8,
        marginLeft: 2,
    },
    settingsCardSkeleton: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    settingRowSkeleton: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsRightNavSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingDividerSkeleton: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 46,
    },
    settingsVersionContainer: {
        alignItems: 'center',
        marginTop: 12,
    },

    // Help Skeleton
    helpCardSkeleton: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    helpRowSkeleton: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpDividerSkeleton: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 46,
    },
    emergencyCardSkeleton: {
        marginTop: 16,
        height: 86,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    mt16: {
        marginTop: 16,
    },
});
