import React, { useState, useEffect, useCallback } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { logout } from '../../redux/slices/authSlice';
import { storage } from '../../storage/storage';
import { resetToLogin } from '../../utils/navigationRef';
import { updateDriverOnlineStatus, getDriverApi, DriverProfileData } from '../../api';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { unsubscribeFromTopic } from '../../services/notificationService';
import { getProfileImageUrl, normalizeDriverProfile } from '../../utils/imageUtils';

import {
    colors,
    typography,
    shadows,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { ProfileScreenSkeleton } from '../../components/Skeleton';
import { ProfileStackParamList } from '../../Navigation/stacks/Profilestack';

type ProfileNavigationProp =
    NativeStackNavigationProp<ProfileStackParamList>;

interface ProfileOption {
    title: string;
    subtitle: string;
    icon: string;
    iconFamily: 'material' | 'ionicons' | 'feather' | 'fontawesome';
    iconBg: string;
    iconColor: string;
    onPress: () => void;
}

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileNavigationProp>();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const authLoading = useAppSelector(state => state.auth.loading);
    const driverChannel = useAppSelector(state => state.auth.driverChannel);
    const userChannel = useAppSelector(state => state.auth.userChannel);

    const [driverProfile, setDriverProfile] = useState<DriverProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const extractDriverFromResponse = (res: any): DriverProfileData | null => {
        if (!res) return null;
        const body = res?.data !== undefined ? res.data : res;
        if (!body) return null;

        let rawDriver: any = null;
        if (Array.isArray(body)) {
            rawDriver = body.length > 0 ? body[0] : null;
        } else if (Array.isArray(body.data)) {
            rawDriver = body.data.length > 0 ? body.data[0] : null;
        } else if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
            rawDriver = body.data;
        } else if (Array.isArray(body.result)) {
            rawDriver = body.result.length > 0 ? body.result[0] : null;
        } else if (body.result && typeof body.result === 'object' && !Array.isArray(body.result)) {
            rawDriver = body.result;
        } else if (Array.isArray(body.drivers)) {
            rawDriver = body.drivers.length > 0 ? body.drivers[0] : null;
        } else if (body.driver && typeof body.driver === 'object' && !Array.isArray(body.driver)) {
            rawDriver = body.driver;
        } else if (Array.isArray(body.records)) {
            rawDriver = body.records.length > 0 ? body.records[0] : null;
        } else if (Array.isArray(body.rows)) {
            rawDriver = body.rows.length > 0 ? body.rows[0] : null;
        } else if (
            typeof body === 'object' &&
            !Array.isArray(body) &&
            (body.name || body.driver_name || body.full_name || body.mobile_no || body.mobile_number || body.phone || body.vehicle_no)
        ) {
            rawDriver = body;
        }
        return rawDriver ? normalizeDriverProfile(rawDriver) : null;
    };

    const fetchDriverProfile = useCallback(async (isPullToRefresh = false) => {
        if (!isPullToRefresh) {
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
                console.warn('⚠️ [DRIVER API] No driver ID found to fetch profile');
                return;
            }

            console.log('📡 [DRIVER API] Calling /api/driver/get with id:', driverUserId);
            const res = await getDriverApi({
                id: driverUserId,
            });

            // Console log the response as requested
            console.log('📡 [DRIVER API] Response from /api/driver/get:', res?.data);

            const fetchedDriver = extractDriverFromResponse(res);
            console.log('✅ [DRIVER API] Extracted Driver Profile from API:', fetchedDriver);

            if (fetchedDriver) {
                setDriverProfile(fetchedDriver);
            }
        } catch (err: any) {
            console.warn('❌ [DRIVER API ERROR]:', err?.response?.data || err?.message || err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDriverProfile();
    }, [fetchDriverProfile]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDriverProfile(true);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (user?.id !== undefined && user?.id !== null) {
                                await updateDriverOnlineStatus({
                                    user_id: user.id,
                                    is_online: false,
                                });
                            }
                        } catch (err) {
                            console.log('Failed to update offline status on logout:', err);
                        }

                        if (driverChannel) {
                            unsubscribeFromTopic(driverChannel);
                        }
                        if (userChannel) {
                            unsubscribeFromTopic(userChannel);
                        }

                        await storage.clear();
                        dispatch(logout());
                        resetToLogin();
                    },
                },
            ],
        );
    };

    const profileOptions: ProfileOption[] = [
        {
            title: 'User Information',
            subtitle: 'Manage your personal information',
            icon: 'account-outline',
            iconFamily: 'material',
            iconBg: colors.primaryLight,
            iconColor: colors.primary,
            onPress: () => navigation.navigate('UserInfo', { driverProfile }),
        },
        {
            title: 'Vehicle Information',
            subtitle: 'View and manage your vehicle details',
            icon: 'car-outline',
            iconFamily: 'material',
            iconBg: colors.infoLight,
            iconColor: colors.info,
            onPress: () => navigation.navigate('VehicleDocument', { driverProfile }),
        },
        {
            title: 'Privacy Policy',
            subtitle: 'View privacy policy & data practices',
            icon: 'shield-check-outline',
            iconFamily: 'material',
            iconBg: colors.warningLight,
            iconColor: colors.warning,
            onPress: () => navigation.navigate('PrivacyPolicy'),
        },
        {
            title: 'Terms & Conditions',
            subtitle: 'View driver terms & service conditions',
            icon: 'file-document-outline',
            iconFamily: 'material',
            iconBg: colors.successLight,
            iconColor: colors.successDark,
            onPress: () => navigation.navigate('TermsConditions'),
        },
    ];

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* HEADER */}

            <Header

                title="Profile"
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
                {isLoading || authLoading ? (
                    <ProfileScreenSkeleton />
                ) : (
                    <>
                        {/* PROFILE */}

                        <View style={styles.profileSection}>
                            <View style={styles.profileImageRing}>
                                <View style={styles.profileImageContainer}>
                                    {(() => {
                                        const rawAvatar =
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

                                        const avatarUri = getProfileImageUrl(rawAvatar);

                                        return avatarUri ? (
                                            <Image
                                                source={{ uri: avatarUri }}
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            <AppIcon
                                                family="material"
                                                name="account"
                                                size={48}
                                                color={colors.primary}
                                            />
                                        );
                                    })()}
                                </View>

                                <View style={styles.editBadge}>
                                    <AppIcon
                                        family="material"
                                        name="pencil"
                                        size={12}
                                        color={colors.white}
                                    />
                                </View>
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
                                    <Text style={styles.profileName}>
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

                            {(() => {
                                const isVerified =
                                    driverProfile?.is_verified === 1 ||
                                    driverProfile?.is_verified === true ||
                                    driverProfile?.is_verified === '1' ||
                                    driverProfile?.status?.toLowerCase() === 'verified' ||
                                    driverProfile?.status?.toLowerCase() === 'active' ||
                                    driverProfile?.status?.toLowerCase() === 'approved';

                                const statusLabel = driverProfile?.status
                                    ? `${driverProfile.status.charAt(0).toUpperCase()}${driverProfile.status.slice(1)} Driver`
                                    : (isVerified ? 'Verified Driver' : (driverProfile ? 'Driver' : ''));

                                return statusLabel ? (
                                    <View style={styles.verifiedPill}>
                                        <AppIcon
                                            family="material"
                                            name="check-decagram"
                                            size={13}
                                            color={colors.successDark}
                                        />

                                        <Text style={styles.verifiedText}>
                                            {statusLabel}
                                        </Text>
                                    </View>
                                ) : null;
                            })()}
                        </View>

                        {/* PROFILE OPTIONS */}

                        <View style={styles.optionsCard}>
                            {profileOptions.map((item, index) => (
                                <React.Fragment key={item.title}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.optionRow}
                                        onPress={item.onPress}
                                    >
                                        {/* ICON */}

                                        <View
                                            style={[
                                                styles.iconContainer,
                                                { backgroundColor: item.iconBg },
                                            ]}
                                        >
                                            <AppIcon
                                                family={item.iconFamily}
                                                name={item.icon}
                                                size={20}
                                                color={item.iconColor}
                                            />
                                        </View>

                                        {/* TEXT */}

                                        <View style={styles.optionContent}>
                                            <Text
                                                style={styles.optionTitle}
                                                numberOfLines={1}
                                            >
                                                {item.title}
                                            </Text>

                                            <Text
                                                style={styles.optionSubtitle}
                                                numberOfLines={1}
                                            >
                                                {item.subtitle}
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

                                    {/* DIVIDER */}

                                    {index !== profileOptions.length - 1 && (
                                        <View style={styles.divider} />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>

                        {/* LOGOUT */}

                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <AppIcon
                                family="material"
                                name="logout"
                                size={18}
                                color={colors.danger}
                            />

                            <Text style={styles.logoutText}>
                                Log Out
                            </Text>
                        </TouchableOpacity>

                        {/* VERSION */}

                        <Text style={styles.versionText}>
                            Version 1.0.0
                        </Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

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
        paddingBottom: 96,
    },

    // =====================================================
    // PROFILE
    // =====================================================

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

    profileImage: {
        width: '100%',
        height: '100%',
    },

    editBadge: {
        position: 'absolute',

        bottom: 0,
        right: 0,

        width: 26,
        height: 26,

        borderRadius: 13,

        backgroundColor: colors.primary,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 2,
        borderColor: colors.card,
    },

    profileName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: 2,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textSecondary,
        marginBottom: 6,
    },

    verifiedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        height: 22,
        paddingHorizontal: 10,

        borderRadius: 11,

        backgroundColor: colors.successLight,

        gap: 4,
    },

    verifiedText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.successDark,
        letterSpacing: 0.2,
    },

    // =====================================================
    // OPTIONS CARD
    // =====================================================

    optionsCard: {
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
    // OPTION ROW
    // =====================================================

    optionRow: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    // =====================================================
    // CONTENT
    // =====================================================

    optionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 6,
    },

    optionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: 2,
    },

    optionSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textSecondary,
    },

    chevronContainer: {
        width: 28,
        height: 28,

        borderRadius: 14,

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
        marginLeft: 52,
    },

    // =====================================================
    // LOGOUT
    // =====================================================

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: 6,

        height: 48,

        marginTop: 12,

        borderRadius: 16,

        backgroundColor: colors.dangerLight,
    },

    logoutText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.danger,
        letterSpacing: 0.1,
    },

    // =====================================================
    // VERSION
    // =====================================================

    versionText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 12,
    },
});