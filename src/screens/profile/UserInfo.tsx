import React, { useState, useEffect, useCallback } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';

import { colors, typography, shadows } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { UserInfoSkeleton } from '../../components/Skeleton';
import { useAppSelector } from '../../redux/hook';
import { ProfileStackParamList } from '../../Navigation/stacks/Profilestack';
import { getDriverApi, DriverProfileData } from '../../api';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';

interface InfoItemProps {
    icon: string;
    title: string;
    value: string;
    valueColor?: string;
    iconBg: string;
    iconColor: string;
    onPress?: () => void;
}

type UserInfoRouteProp = RouteProp<ProfileStackParamList, 'UserInfo'>;

const UserInfo = () => {
    const route = useRoute<UserInfoRouteProp>();
    const user = useAppSelector(state => state.auth.user);
    const [driverProfile, setDriverProfile] = useState<DriverProfileData | null>(
        route.params?.driverProfile || null
    );
    const [isLoading, setIsLoading] = useState(!route.params?.driverProfile);
    const [refreshing, setRefreshing] = useState(false);

    const extractDriverFromResponse = (res: any): DriverProfileData | null => {
        if (!res) return null;
        const body = res?.data !== undefined ? res.data : res;
        if (!body) return null;

        if (Array.isArray(body)) {
            return body.length > 0 ? body[0] : null;
        }
        if (Array.isArray(body.data)) {
            return body.data.length > 0 ? body.data[0] : null;
        }
        if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
            return body.data;
        }
        if (Array.isArray(body.result)) {
            return body.result.length > 0 ? body.result[0] : null;
        }
        if (body.result && typeof body.result === 'object' && !Array.isArray(body.result)) {
            return body.result;
        }
        if (Array.isArray(body.drivers)) {
            return body.drivers.length > 0 ? body.drivers[0] : null;
        }
        if (body.driver && typeof body.driver === 'object' && !Array.isArray(body.driver)) {
            return body.driver;
        }
        if (Array.isArray(body.records)) {
            return body.records.length > 0 ? body.records[0] : null;
        }
        if (Array.isArray(body.rows)) {
            return body.rows.length > 0 ? body.rows[0] : null;
        }
        if (
            typeof body === 'object' &&
            !Array.isArray(body) &&
            (body.name || body.driver_name || body.full_name || body.mobile_no || body.mobile_number || body.phone || body.vehicle_no)
        ) {
            return body;
        }
        return null;
    };

    const fetchDriverProfile = useCallback(async (isPullToRefresh = false) => {
        if (!isPullToRefresh && !driverProfile) {
            setIsLoading(true);
        }

        try {
            let driverUserId = user?.id || user?.user_id || user?.userId || user?.driver_id;
            if (!driverUserId && driverUserId !== 0) {
                try {
                    const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
                    driverUserId = storedUser?.id || storedUser?.user_id || storedUser?.userId || storedUser?.driver_id;
                } catch {
                    // ignore
                }
            }

            if (!driverUserId && driverUserId !== 0) {
                console.warn('⚠️ [USER INFO] No driver ID found to fetch profile');
                return;
            }

            console.log('📡 [USER INFO] Calling /api/driver/get with id:', driverUserId);
            const res = await getDriverApi({
                id: driverUserId,
            });

            console.log('📡 [USER INFO] Response from /api/driver/get:', res?.data);

            const fetchedDriver = extractDriverFromResponse(res);
            console.log('✅ [USER INFO] Extracted Driver Profile from API:', fetchedDriver);

            if (fetchedDriver) {
                setDriverProfile(fetchedDriver);
            }
        } catch (err: any) {
            console.warn('❌ [USER INFO DRIVER API ERROR]:', err?.response?.data || err?.message || err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user, driverProfile]);

    useEffect(() => {
        if (!route.params?.driverProfile) {
            fetchDriverProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDriverProfile(true);
    };

    const handleVehicle = () => {
        console.log('Vehicle Info');
    };

    const handleExperience = () => {
        console.log('Experience');
    };

    const handleDocuments = () => {
        console.log('Documents');
    };

    const renderInfoItem = ({
        icon,
        title,
        value,
        valueColor,
        iconBg,
        iconColor,
        onPress,
    }: InfoItemProps) => {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.infoRow}
                onPress={onPress}
            >
                {/* ICON */}

                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: iconBg },
                    ]}
                >
                    <AppIcon
                        family="material"
                        name={icon}
                        size={19}
                        color={iconColor}
                    />
                </View>

                {/* TEXT */}

                <View style={styles.infoContent}>
                    <Text
                        style={styles.infoTitle}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    <Text
                        style={[
                            styles.infoValue,
                            valueColor ? { color: valueColor } : null,
                        ]}
                        numberOfLines={1}
                    >
                        {value}
                    </Text>
                </View>

                {/* ARROW */}

                <View style={styles.chevronContainer}>
                    <AppIcon
                        family="material"
                        name="chevron-right"
                        size={19}
                        color={colors.textLight}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* ================= HEADER ================= */}

            <Header
                backEnabled
                title="User Information"
                showRightIcon={false}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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
                    <UserInfoSkeleton />
                ) : (
                    <>
                        {/* ================= PROFILE ================= */}

                        {/* ================= PROFILE ================= */}

                        <View style={styles.profileSection}>

                            <View style={styles.avatarContainer}>
                                {(() => {
                                    const avatarUri =
                                        driverProfile?.profile_image_url ||
                                        driverProfile?.profile_image ||
                                        driverProfile?.profile_photo ||
                                        driverProfile?.photo ||
                                        driverProfile?.image ||
                                        driverProfile?.avatar ||
                                        driverProfile?.driver_image ||
                                        driverProfile?.driver_photo ||
                                        driverProfile?.image_url ||
                                        driverProfile?.photo_url ||
                                        null;

                                    return avatarUri ? (
                                        <Image
                                            source={{ uri: avatarUri }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <AppIcon
                                            family="material"
                                            name="account"
                                            size={40}
                                            color={colors.primary}
                                        />
                                    );
                                })()}
                            </View>

                            {(() => {
                                const driverName =
                                    driverProfile?.name ||
                                    driverProfile?.driver_name ||
                                    driverProfile?.full_name ||
                                    (driverProfile?.first_name ? `${driverProfile.first_name} ${driverProfile.last_name || ''}`.trim() : '') ||
                                    driverProfile?.username ||
                                    driverProfile?.user_name ||
                                    '';

                                return driverName ? (
                                    <Text style={styles.userName}>
                                        {driverName}
                                    </Text>
                                ) : null;
                            })()}

                            {(() => {
                                const rawPhone =
                                    driverProfile?.mobile_number ||
                                    driverProfile?.mobile_no ||
                                    driverProfile?.driver_mobile_no ||
                                    driverProfile?.phone ||
                                    driverProfile?.phone_number ||
                                    driverProfile?.contact_no ||
                                    driverProfile?.contact_number ||
                                    '';

                                const displayPhone = rawPhone
                                    ? (rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`)
                                    : '';

                                return displayPhone ? (
                                    <Text style={styles.phoneNumber}>
                                        {displayPhone}
                                    </Text>
                                ) : null;
                            })()}

                        </View>

                        {/* ================= INFORMATION CARD ================= */}

                        <Text style={styles.sectionTitle}>
                            Driver Details
                        </Text>

                        <View style={styles.infoCard}>

                            {/* VEHICLE */}

                            {renderInfoItem({
                                icon: 'car-outline',
                                title: 'Vehicle Info',
                                value: driverProfile?.vehicle_number || driverProfile?.vehicle_no || driverProfile?.ambulance_no || 'Not Assigned',
                                iconBg: colors.primaryLight,
                                iconColor: colors.primary,
                                onPress: handleVehicle,
                            })}

                            <View style={styles.divider} />

                            {/* EXPERIENCE */}

                            {renderInfoItem({
                                icon: 'briefcase-outline',
                                title: 'Experience',
                                value: driverProfile?.experience ? `${driverProfile.experience} Years` : '3 Years',
                                iconBg: colors.warningLight,
                                iconColor: colors.warning,
                                onPress: handleExperience,
                            })}

                            <View style={styles.divider} />

                            {/* DOCUMENTS */}

                            {renderInfoItem({
                                icon: 'file-document-outline',
                                title: 'Documents',
                                value: (driverProfile?.document_status?.toLowerCase() === 'verified' || driverProfile?.is_verified === 1 || driverProfile?.is_verified === true)
                                    ? 'Verified'
                                    : (driverProfile?.document_status ? (driverProfile.document_status.charAt(0).toUpperCase() + driverProfile.document_status.slice(1)) : 'Pending'),
                                valueColor: (driverProfile?.document_status?.toLowerCase() === 'verified' || driverProfile?.is_verified === 1 || driverProfile?.is_verified === true)
                                    ? colors.successDark
                                    : colors.warning,
                                iconBg: (driverProfile?.document_status?.toLowerCase() === 'verified' || driverProfile?.is_verified === 1 || driverProfile?.is_verified === true)
                                    ? colors.successLight
                                    : colors.warningLight,
                                iconColor: (driverProfile?.document_status?.toLowerCase() === 'verified' || driverProfile?.is_verified === 1 || driverProfile?.is_verified === true)
                                    ? colors.successDark
                                    : colors.warning,
                                onPress: handleDocuments,
                            })}

                            {driverProfile?.email_id ? (
                                <>
                                    <View style={styles.divider} />

                                    {/* EMAIL */}

                                    {renderInfoItem({
                                        icon: 'email-outline',
                                        title: 'Email',
                                        value: driverProfile.email_id,
                                        iconBg: colors.infoLight,
                                        iconColor: colors.info,
                                    })}
                                </>
                            ) : null}

                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserInfo;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileSection: {
        alignItems: 'center',

        paddingTop: 8,
        paddingBottom: 16,
    },

    avatarContainer: {
        width: 76,
        height: 76,

        borderRadius: 38,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        borderWidth: 1,
        borderColor: colors.border,

        marginBottom: 8,
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,

        marginTop: 3,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textSecondary,

        marginTop: 3,
    },

    // =====================================================
    // SECTION TITLE
    // =====================================================

    sectionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textLight,
        letterSpacing: 0.6,
        textTransform: 'uppercase',

        marginBottom: 8,
        marginLeft: 2,
    },

    // =====================================================
    // INFORMATION CARD
    // =====================================================

    infoCard: {
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

    // =====================================================
    // INFO ROW
    // =====================================================

    infoRow: {
        height: 56,

        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 38,
        height: 38,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 10,
    },

    // =====================================================
    // CONTENT
    // =====================================================

    infoContent: {
        flex: 1,

        justifyContent: 'center',
    },

    infoTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,

        marginBottom: 2,
    },

    infoValue: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textSecondary,
    },

    chevronContainer: {
        width: 26,
        height: 26,

        borderRadius: 13,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.background,
    },

    // =====================================================
    // DIVIDER
    // =====================================================

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 48,
    },
});