import React, { useState, useRef, useEffect } from 'react';
import {
    Image,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    colors,
    typography,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { HomeScreenSkeleton } from '../../components/Skeleton';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hook';
import { requestLocationPermission, checkLocationPermission } from '../../utils/locationPermission';
import { updateDriverOnlineStatus } from '../../api';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';

const HomeScreen = () => {
    const user = useAppSelector(state => state.auth.user);
    const navigation = useNavigation<any>();
    // By default, header status is ONLINE after login
    const [isOnline, setIsOnline] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const initialStatusSentRef = useRef(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        setIsLoading(true);
        const userId = await getEffectiveUserId();
        if (userId || userId === 0) {
            await sendStatusUpdate(isOnline);
        }
        setTimeout(() => {
            setRefreshing(false);
            setIsLoading(false);
        }, 1000);
    };

    // Helper to get userId from Redux or storage fallback
    const getEffectiveUserId = async (): Promise<number | string | null> => {
        if (user?.id !== undefined && user?.id !== null) return user.id;
        if (user?.driver_id !== undefined && user?.driver_id !== null) return user.driver_id;
        if (user?.userId !== undefined && user?.userId !== null) return user.userId;
        try {
            const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
            if (storedUser?.id !== undefined && storedUser?.id !== null) return storedUser.id;
            if (storedUser?.driver_id !== undefined && storedUser?.driver_id !== null) return storedUser.driver_id;
            if (storedUser?.userId !== undefined && storedUser?.userId !== null) return storedUser.userId;
        } catch {
            // ignore
        }
        return null;
    };

    const sendStatusUpdate = async (online: boolean) => {
        const userId = await getEffectiveUserId();
        if (!userId && userId !== 0) {
            console.log('⚠️ [HomeScreen] user_id not available, skipping status update');
            return;
        }
        try {
            console.log(`📡 [HomeScreen] Sending PUT driver status: user_id=${userId}, is_online=${online}`);
            const res = await updateDriverOnlineStatus({
                user_id: userId,
                is_online: online,
            });
            console.log('✅ [HomeScreen] Driver online status updated:', res.data);
        } catch (error) {
            console.error('❌ [HomeScreen] Failed to update driver status:', error);
        }
    };

    // By default after login when user arrives on homescreen:
    // 1. Set header status to ONLINE (isOnline = true)
    // 2. Send PUT API call with is_online: true
    // 3. Ensure location permission is requested/checked
    useEffect(() => {
        const initOnlineStatus = async () => {
            // Check / request location permission
            checkLocationPermission().then(hasPermission => {
                if (!hasPermission) {
                    requestLocationPermission();
                }
            });

            // Ensure header reflects ONLINE
            setIsOnline(true);

            // Send API call with is_online: true once userId is available
            const userId = await getEffectiveUserId();
            if ((userId || userId === 0) && !initialStatusSentRef.current) {
                initialStatusSentRef.current = true;
                await sendStatusUpdate(true);
            }
        };

        initOnlineStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleToggleOnline = async (nextValue: boolean) => {
        setIsOnline(nextValue);
        await sendStatusUpdate(nextValue);

        if (nextValue) {
            const hasPermission = await checkLocationPermission();
            if (!hasPermission) {
                await requestLocationPermission();
            }
        }
    };

    const handleNotifications = () => {
        navigation.navigate('Notifications');
    };
    const handleEmergencyRequest = () => {
        const parent1 = navigation.getParent();
        const parent2 = parent1?.getParent();

        parent2?.navigate('IncomingRequests');
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <Header
                leftImage={require('../../assets/images/app_logo_tra.png')}
                leftImageStyle={styles.headerLogo}
                rightIcon="bell-outline"
                onRightPress={handleNotifications}
                centerContent={
                    <View style={styles.headerToggleContainer}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleToggleOnline(!isOnline)}
                            style={[
                                styles.headerStatusPill,
                                {
                                    backgroundColor: isOnline
                                        ? '#DCFCE7'
                                        : '#F1F5F9',
                                    borderColor: isOnline
                                        ? '#86EFAC'
                                        : '#CBD5E1',
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.headerOnlineDot,
                                    {
                                        backgroundColor: isOnline
                                            ? colors.success
                                            : colors.textLight,
                                    },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.headerOnlineText,
                                    {
                                        color: isOnline
                                            ? colors.successDark
                                            : colors.textSecondary,
                                    },
                                ]}
                            >
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Text>
                        </TouchableOpacity>

                        <Switch
                            value={isOnline}
                            onValueChange={handleToggleOnline}
                            trackColor={{
                                false: '#CBD5E1',
                                true: '#86EFAC',
                            }}
                            thumbColor={isOnline ? colors.success : colors.white}
                            ios_backgroundColor="#CBD5E1"
                            style={styles.headerSwitch}
                        />
                    </View>
                }
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
                    <HomeScreenSkeleton />
                ) : (
                    <>
                        <View style={styles.greetingSection}>
                    <View style={styles.greetingContent}>
                        <Text style={styles.greeting}>
                            Good Morning,
                        </Text>

                        <Text style={styles.userName}>
                            {user?.name || 'Driver'}
                        </Text>
                    </View>

                    <View style={styles.profileAvatar}>
                        <AppIcon
                            family="material"
                            name="account"
                            size={26}
                            color={colors.textSecondary}
                        />
                    </View>
                </View>

                <View style={styles.emergencyCardOuterWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                            if (!isOnline) {
                                handleToggleOnline(true);
                            }
                        }}
                        style={styles.emergencyCardContainer}
                    >
                        <ImageBackground
                            source={require('../../assets/images/waiting_for_bg.jpg')}
                            style={styles.emergencyCardBg}
                            imageStyle={styles.emergencyCardBgImage}
                            resizeMode="cover"
                        >
                            <View style={styles.cardContentRow}>
                                <View style={styles.statusTextContainer}>
                                    <Text style={styles.statusSubtitleText}>
                                        {isOnline ? 'Waiting for new' : 'You are currently'}
                                    </Text>
                                    <Text style={styles.statusTitleText}>
                                        {isOnline ? 'Emergency Request' : 'Offline'}
                                    </Text>
                                    {!isOnline && (
                                        <Text style={styles.statusTapHint}>
                                            Tap to go Online
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.ambulancePlaceholder} />
                            </View>

                            {!isOnline && (
                                <View style={styles.offlineOverlay}>
                                    <View style={styles.offlinePill}>
                                        <View style={styles.offlineDot} />
                                        <Text style={styles.offlinePillText}>
                                            OFFLINE
                                        </Text>
                                    </View>
                                    <Text style={styles.offlinePrompt}>
                                        Tap to Go Online
                                    </Text>
                                </View>
                            )}
                        </ImageBackground>
                    </TouchableOpacity>

                    <Image
                        source={require('../../assets/images/ambulnace3d-removebg-preview.png')}
                        style={[
                            styles.statusCardAmbulancePopOut,
                            !isOnline && styles.statusCardAmbulanceOffline,
                        ]}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.overviewSection}>
                    <Text style={styles.sectionTitle}>
                        Today's Overview
                    </Text>

                    <View style={styles.overviewCard}>
                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.successLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="check-circle"
                                        size={18}
                                        color={colors.successDark}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Completed
                                </Text>
                            </View>

                            <Text style={styles.rowValue}>
                                04
                            </Text>
                        </View>

                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>

                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.dangerLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="close-circle"
                                        size={18}
                                        color={colors.danger}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Cancelled
                                </Text>

                            </View>

                            <Text style={styles.rowValue}>
                                01
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.overviewRow,
                                styles.lastRow,
                            ]}
                        >
                            <View style={styles.rowLeft}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.warningLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="cash"
                                        size={18}
                                        color={colors.warning}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Earnings
                                </Text>
                            </View>

                            <Text style={styles.rowValue}>
                                ₹1,250
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.emergencyButton}
                    onPress={handleEmergencyRequest}
                >
                    <AppIcon
                        family="material"
                        name="alert-circle-outline"
                        size={20}
                        color={colors.danger}
                    />

                    <Text style={styles.emergencyButtonText}>
                        Emergency Request
                    </Text>
                </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 96,
    },

    headerLogo: {
        width: 55,
        height: 55,
        // borderRadius: 10,
    },

    headerToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    headerStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
    },

    headerOnlineDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 6,
    },

    headerOnlineText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.xs,
        letterSpacing: 0.4,
    },

    headerSwitch: {
        transform: [
            {
                scaleX: 0.8,
            },
            {
                scaleY: 0.8,
            },
        ],
    },

    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },

    greetingContent: {
        flex: 1,
    },

    greeting: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        lineHeight: 15,
        includeFontPadding: false,
        color: colors.textSecondary,
        letterSpacing: 0.2,
        marginBottom: 4,
    },

    userName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        lineHeight: 22,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    profileAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },

    emergencyCardOuterWrapper: {
        position: 'relative',
        marginTop: 0,
        marginBottom: 14,
        overflow: 'visible',
    },

    emergencyCardContainer: {
        height: 114,
        borderRadius: 16,
        backgroundColor: '#F0F5F8',
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: '#E1EBF2',
        shadowColor: '#1E3A8A',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },

    emergencyCardBg: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    emergencyCardBgImage: {
        borderRadius: 16,
        opacity: 0.35,
    },

    cardContentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 14,
        paddingRight: 8,
    },

    statusTextContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 4,
    },

    statusSubtitleText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12.5,
        lineHeight: 16,
        includeFontPadding: false,
        color: '#0A2027',
        letterSpacing: 0.2,
        marginBottom: 4,
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    statusTitleText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        lineHeight: 22,
        includeFontPadding: false,
        fontWeight: 'bold',
        color: '#05161A',
        letterSpacing: -0.2,
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    statusTapHint: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        lineHeight: 15,
        includeFontPadding: false,
        color: colors.primaryDark,
        marginTop: 3,
    },

    ambulancePlaceholder: {
        width: 100,
        height: 70,
    },

    statusCardAmbulancePopOut: {
        position: 'absolute',
        right: 20,
        top: 6,
        width: 120,
        height: 95,
        zIndex: 10,
    },

    statusCardAmbulanceOffline: {
        opacity: 0.4,
    },

    offlineOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 38, 43, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    offlinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        marginBottom: 4,
    },

    offlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#94A3B8',
        marginRight: 6,
    },

    offlinePillText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.xs,
        lineHeight: 15,
        includeFontPadding: false,
        color: '#3d4b5eff',
        letterSpacing: 0.4,
    },

    offlinePrompt: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
        lineHeight: 15,
        includeFontPadding: false,
        color: '#FFFFFF',
    },

    overviewSection: {
        marginTop: 0,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: 8,
    },

    overviewCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
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

    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    rowLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 13,
        lineHeight: 17,
        includeFontPadding: false,
        color: colors.textSecondary,
        letterSpacing: 0.1,
    },

    rowValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    emergencyButton: {
        minHeight: 46,
        marginTop: 12,
        paddingHorizontal: 16,
        borderRadius: 13,
        backgroundColor: colors.dangerLight,
        borderWidth: 1,
        borderColor: colors.danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    emergencyButtonText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 13.5,
        lineHeight: 18,
        includeFontPadding: false,
        color: colors.danger,
    },

});