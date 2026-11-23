import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Alert,
    BackHandler,
    Image,
    ImageBackground,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    colors,
    typography,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { HomeScreenSkeleton } from '../../components/Skeleton';
import { PermissionModal, GpsInfoModal } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hook';
import {
    checkAllPermissions,
    AppPermissionsStatus,
    isDeviceLocationEnabled,
    promptEnableDeviceLocation,
    checkAllPermissionsAndLocation,
    getCurrentCoordinates,
} from '../../utils/locationPermission';
import {
    getDriverApi,
    getRouteOverviewApi,
    getActiveTripApi,
    extractDriverFromResponse,
    DriverProfileData,
} from '../../api';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { getProfileImageUrl, IMAGE_FOLDERS } from '../../utils/imageUtils';
import { ShowImage } from '../../components';
import {
    sendDriverStatusUpdate,
    startPeriodicStatusUpdates,
    stopPeriodicStatusUpdates,
    isPeriodicStatusRunning,
} from '../../services/driverStatusService';

const getGreetingText = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const HomeScreen = () => {
    const user = useAppSelector(state => state.auth.user);
    const navigation = useNavigation<any>();
    // By default, header status is ONLINE after login
    const [isOnline, setIsOnline] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [driverProfile, setDriverProfile] = useState<DriverProfileData | null>(null);
    const [overviewData, setOverviewData] = useState<{
        total_count: string | number;
        assigned_count: string | number;
        completed_count: string | number;
    }>({
        total_count: 0,
        assigned_count: 0,
        completed_count: 0,
    });
    const [activeTrip, setActiveTrip] = useState<any | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<AppPermissionsStatus | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showGpsModal, setShowGpsModal] = useState(false);
    const initialStatusSentRef = useRef(false);
    const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'disabled'>('acquiring');
    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
    const gpsWatchIdRef = useRef<number | null>(null);

    // Helper to get userId from Redux or storage fallback
    const getEffectiveUserId = async (): Promise<number | string | null> => {
        const isValidId = (v: any): boolean => {
            if (v === undefined || v === null || v === '' || v === 0 || v === '0') return false;
            const num = Number(v);
            return !isNaN(num) && num > 0;
        };

        if (isValidId(user?.id)) return Number(user.id);
        if (isValidId(user?.user_id)) return Number(user.user_id);
        if (isValidId(user?.userId)) return Number(user.userId);
        if (isValidId(user?.driver_id)) return Number(user.driver_id);

        try {
            const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
            if (isValidId(storedUser?.id)) return Number(storedUser.id);
            if (isValidId(storedUser?.user_id)) return Number(storedUser.user_id);
            if (isValidId(storedUser?.userId)) return Number(storedUser.userId);
            if (isValidId(storedUser?.driver_id)) return Number(storedUser.driver_id);
        } catch {
            // ignore
        }
        return null;
    };

    const fetchHomeData = useCallback(async (driverId: number | string) => {
        try {
            // 1. Fetch driver profile from /api/driver/get
            console.log('📡 [HomeScreen] Calling /api/driver/get with id:', driverId);
            const profilePromise = getDriverApi({
                id: driverId,
            }).then(res => {
                console.log('📡 [HomeScreen] /api/driver/get response:', res?.data);
                const fetched = extractDriverFromResponse(res);
                console.log('✅ [HomeScreen] Extracted Driver Profile from API:', fetched);
                if (fetched) {
                    setDriverProfile(fetched);
                }
            }).catch(err => {
                console.warn('❌ [HomeScreen] Error fetching driver profile:', err?.response?.data || err?.message || err);
            });

            // 2. Fetch route overview from /api/ambulance/getRouteOverview with driver_id
            console.log('📡 [HomeScreen] Calling /api/ambulance/getRouteOverview with driver_id:', driverId);
            const overviewPromise = getRouteOverviewApi({
                driver_id: driverId,
            }).then(res => {
                console.log('📡 [HomeScreen] /api/ambulance/getRouteOverview response:', res?.data);
                const raw = res?.data?.data !== undefined ? res.data.data : (res?.data?.result !== undefined ? res.data.result : res?.data);
                if (raw) {
                    let obj = raw;
                    if (Array.isArray(raw) && raw.length > 0) {
                        obj = raw[0];
                    }
                    console.log('✅ [HomeScreen] Parsed Route Overview Data:', obj);
                    setOverviewData({
                        total_count: obj.total_count ?? obj.total_trips ?? obj.total ?? 0,
                        assigned_count: obj.assigned_count ?? obj.assigned ?? 0,
                        completed_count: obj.completed_count ?? obj.completed ?? obj.completed_trips ?? 0,
                    });
                }
            }).catch(err => {
                console.warn('❌ [HomeScreen] Error fetching route overview:', err?.response?.data || err?.message || err);
            });

            // 3. Fetch active trip from /api/ambulance/driver/active-trip
            console.log('📡 [HomeScreen] Calling /api/ambulance/driver/active-trip with driver_id:', driverId);
            const activeTripPromise = getActiveTripApi({
                driver_id: driverId,
            }).then(res => {
                console.log('📡 [HomeScreen] /api/ambulance/driver/active-trip response:', res?.data);
                const hasActive = res?.data?.has_active_trip === true;
                const tripData = res?.data?.data;
                if (hasActive && tripData) {
                    console.log('✅ [HomeScreen] Ongoing Active Trip found:', tripData);
                    setActiveTrip(tripData);
                } else {
                    console.log('ℹ️ [HomeScreen] No active trip');
                    setActiveTrip(null);
                }
            }).catch(err => {
                console.warn('❌ [HomeScreen] Error fetching active trip:', err?.response?.data || err?.message || err);
                setActiveTrip(null);
            });

            await Promise.all([profilePromise, overviewPromise, activeTripPromise]);
        } catch (err) {
            console.warn('❌ [HomeScreen] Error in fetchHomeData:', err);
        }
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        const userId = await getEffectiveUserId();
        if (userId || userId === 0) {
            await Promise.all([
                sendStatusUpdate(isOnline),
                fetchHomeData(userId),
            ]);
            if (isOnline) {
                startPeriodicStatusUpdates(userId);
            }
        }
        setRefreshing(false);
    };

    const sendStatusUpdate = async (online: boolean, coordsOverride?: { lat: number; lng: number } | null) => {
        const userId = await getEffectiveUserId();
        const coordsToUse = coordsOverride || currentCoords;
        return await sendDriverStatusUpdate(online, userId, coordsToUse);
    };

    const handleGpsIconPress = () => {
        setShowGpsModal(true);
    };

    const handleEnableGpsFromModal = () => {
        promptEnableDeviceLocation(
            'Enable GPS',
            'Device Location (GPS) is turned off. Please turn on GPS so the ambulance dispatch system can track your vehicle.'
        ).then(nowOn => {
            if (nowOn) {
                setGpsStatus('acquiring');
                startGpsWatcher();
            }
        });
    };

    const startGpsWatcher = useCallback((targetUserId?: number | string | null) => {
        // 1. Check storage for fast non-zero cached location
        storage.get<{ lat: number; lng: number }>(STORAGE_KEYS.LAST_DRIVER_LOCATION).then(saved => {
            if (saved && saved.lat && saved.lng && saved.lat !== 0 && saved.lng !== 0) {
                setCurrentCoords(saved);
                setGpsStatus('locked');
            }
        });

        // 2. Clear any active watch
        if (gpsWatchIdRef.current !== null) {
            Geolocation.clearWatch(gpsWatchIdRef.current);
            gpsWatchIdRef.current = null;
        }

        // 3. Start Geolocation.watchPosition
        try {
            gpsWatchIdRef.current = Geolocation.watchPosition(
                async pos => {
                    const lat = pos?.coords?.latitude;
                    const lng = pos?.coords?.longitude;
                    if (typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0) {
                        const freshCoords = { lat, lng };
                        setCurrentCoords(freshCoords);
                        setGpsStatus('locked');
                        storage.set(STORAGE_KEYS.LAST_DRIVER_LOCATION, freshCoords).catch(() => {});

                        // When coordinates lock for the first time, send status update if online
                        const uid = targetUserId || (await getEffectiveUserId());
                        if (!initialStatusSentRef.current && isOnline && uid) {
                            initialStatusSentRef.current = true;
                            console.log('🛰️ [HomeScreen] GPS Locked! Dispatching online status update with real coords:', freshCoords);
                            await sendDriverStatusUpdate(true, uid, freshCoords);
                            startPeriodicStatusUpdates(uid);
                        }
                    }
                },
                err => {
                    console.log('📡 [HomeScreen] GPS watch notice:', err?.code, err?.message);
                    if (err?.code === 2) {
                        setGpsStatus('disabled');
                    }
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 3,
                    interval: 3000,
                    fastestInterval: 1500,
                }
            );
        } catch (err) {
            console.warn('⚠️ [HomeScreen] Failed to start Geolocation.watchPosition:', err);
        }
    }, [isOnline]);

    useEffect(() => {
        return () => {
            if (gpsWatchIdRef.current !== null) {
                Geolocation.clearWatch(gpsWatchIdRef.current);
                gpsWatchIdRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const initOnlineStatus = async () => {
            // Check all permissions (Foreground Location, Background Location, Notifications) & hardware GPS
            const perms = await checkAllPermissions();
            setPermissionStatus(perms);
            const gpsEnabled = await isDeviceLocationEnabled();

            if (!gpsEnabled || !perms.allGranted) {
                setGpsStatus('disabled');
            } else {
                setGpsStatus('acquiring');
                startGpsWatcher();
            }

            // Only show permission modal if permissions missing AND no pending emergency request
            const pendingReq = await storage.get(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST);
            if (!perms.allGranted && !pendingReq) {
                setShowPermissionModal(true);
            } else if (perms.allGranted && !gpsEnabled && !pendingReq) {
                promptEnableDeviceLocation().then(async nowOn => {
                    if (nowOn) {
                        setIsOnline(true);
                        storage.set(STORAGE_KEYS.IS_DRIVER_ONLINE, true);
                        setGpsStatus('acquiring');
                        startGpsWatcher();
                        const coords = await getCurrentCoordinates();
                        if (coords) {
                            setCurrentCoords(coords);
                            setGpsStatus('locked');
                            await sendStatusUpdate(true, coords);
                        }
                        const uid = await getEffectiveUserId();
                        if (uid) startPeriodicStatusUpdates(uid);
                    }
                });
            }

            const canBeOnline = Boolean(perms.allGranted && gpsEnabled);
            const savedOnlinePref = await storage.get<boolean>(STORAGE_KEYS.IS_DRIVER_ONLINE);
            const shouldBeOnline = savedOnlinePref !== null && savedOnlinePref !== undefined
                ? (savedOnlinePref && canBeOnline)
                : canBeOnline;

            setIsOnline(shouldBeOnline);

            const userId = await getEffectiveUserId();
            if (userId) {
                if (shouldBeOnline) {
                    // Try getting coordinates immediately
                    const coords = await getCurrentCoordinates();
                    if (coords) {
                        setCurrentCoords(coords);
                        setGpsStatus('locked');
                        if (!initialStatusSentRef.current) {
                            initialStatusSentRef.current = true;
                            await sendStatusUpdate(true, coords);
                            startPeriodicStatusUpdates(userId);
                        }
                    } else {
                        // GPS is still warming up; startGpsWatcher will fire the status update as soon as coordinates lock!
                        console.log('⏳ [HomeScreen] GPS warming up. Status update will dispatch as soon as coordinates lock.');
                    }
                } else {
                    stopPeriodicStatusUpdates();
                }
                await fetchHomeData(userId);
            }
        };

        initOnlineStatus();
    }, [fetchHomeData, startGpsWatcher]);

    const handleToggleOnline = async (nextValue: boolean) => {
        if (nextValue) {
            const perms = await checkAllPermissions();
            setPermissionStatus(perms);
            if (!perms.allGranted) {
                setShowPermissionModal(true);
                return;
            }

            const gpsEnabled = await isDeviceLocationEnabled();
            if (!gpsEnabled) {
                const turnedOn = await promptEnableDeviceLocation();
                if (!turnedOn) {
                    setShowPermissionModal(true);
                    return;
                }
            }

            setGpsStatus('acquiring');
            startGpsWatcher();
        }

        setIsOnline(nextValue);
        await storage.set(STORAGE_KEYS.IS_DRIVER_ONLINE, nextValue);
        const userId = await getEffectiveUserId();
        if (nextValue) {
            if (currentCoords) {
                await sendStatusUpdate(true, currentCoords);
            }
            if (userId) startPeriodicStatusUpdates(userId);
        } else {
            await sendStatusUpdate(false);
            stopPeriodicStatusUpdates();
        }
    };

    const handleNotifications = () => {
        navigation.navigate('Notifications');
    };

    // Auto-refresh active trip whenever the home screen comes into focus
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            if (isOnline && !isPeriodicStatusRunning()) {
                startPeriodicStatusUpdates();
            }
            getEffectiveUserId().then(userId => {
                if ((userId || userId === 0) && isActive) {
                    getActiveTripApi({ driver_id: userId })
                        .then(res => {
                            if (!isActive) return;
                            const hasActive = res?.data?.has_active_trip === true;
                            const tripData = res?.data?.data;
                            if (hasActive && tripData) {
                                setActiveTrip(tripData);
                            } else {
                                setActiveTrip(null);
                            }
                        })
                        .catch(() => {
                            if (isActive) setActiveTrip(null);
                        });
                }
            });
            return () => {
                isActive = false;
                setShowPermissionModal(false);
            };
        }, [isOnline])
    );

    // Prevent hardware back button from navigating back to TripCompleted or other trip screens.
    // Allow double-tap back within 2 seconds to exit the app smoothly.
    useFocusEffect(
        useCallback(() => {
            let lastBackPress = 0;

            const onBackPress = () => {
                const now = Date.now();
                if (now - lastBackPress < 2000) {
                    BackHandler.exitApp();
                    return true;
                }
                lastBackPress = now;
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const formatTripStatus = (status?: string) => {
        if (!status) return 'In Progress';
        const s = status.toLowerCase();
        if (s.includes('dispatch')) return 'Dispatched';
        if (s.includes('accept')) return 'Accepted';
        if (s.includes('assign')) return 'Assigned';
        if (s.includes('reach') || s.includes('arrive')) return 'Reached Pickup';
        if (s.includes('pick') || s.includes('picked')) return 'Patient Picked Up';
        if (s.includes('en_route') || s.includes('enroute') || s.includes('transit')) return 'En Route to Hospital';
        if (s.includes('on_the_way') || s.includes('on_way')) return 'On the Way';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleResumeActiveTrip = async () => {
        
        if (!activeTrip) return;

        const { canProceed, permissions, isGpsEnabled: gpsOn } = await checkAllPermissionsAndLocation();

        if (!canProceed) {
            setPermissionStatus(permissions);
            if (!permissions.allGranted) {
                setShowPermissionModal(true);
                return;
            }
            if (!gpsOn) {
                const turnedOn = await promptEnableDeviceLocation();
                if (!turnedOn) {
                    setShowPermissionModal(true);
                    return;
                }
            }
        }

        const reqId = Number(activeTrip.id || activeTrip.request_id || activeTrip.ambulance_request_id || 0);
        const pLat = Number(activeTrip.pickup_lat || activeTrip.latitude || activeTrip.lat || 0);
        const pLng = Number(activeTrip.pickup_lng || activeTrip.longitude || activeTrip.lng || 0);
        const dLat = Number(activeTrip.drop_lat || activeTrip.destination_lat || 0);
        const dLng = Number(activeTrip.drop_lng || activeTrip.destination_lng || 0);

        const tripParams = {
            requestId: reqId,
            driverId: activeTrip.driver_id || driverProfile?.id || driverProfile?.driver_id,
            patientName: activeTrip.patient_name || activeTrip.name || 'Emergency Patient',
            contactNo: activeTrip.requester_phone || activeTrip.contact_no || activeTrip.mobile_no || '',
            address: activeTrip.pickup_address || activeTrip.address || 'Pickup Location',
            pickupAddress: activeTrip.pickup_address || activeTrip.address || 'Pickup Location',
            patientAddress: activeTrip.pickup_address || activeTrip.address || 'Pickup Location',
            pickupLocation: {
                latitude: pLat,
                longitude: pLng,
            },
            patientLocation: {
                latitude: pLat,
                longitude: pLng,
            },
            destination: activeTrip.drop_address || activeTrip.destination || 'Nearest Emergency Hospital',
            drop_address: activeTrip.drop_address || activeTrip.destination || '',
            emergencyType: activeTrip.emergency_type || 'Emergency',
            estimatedEarnings: String(activeTrip.amount || activeTrip.fare || ''),
            status: activeTrip.status,
        };

        const currentStatus = String(activeTrip.status || '').toLowerCase();

        // If driver already picked up patient or is en route to hospital
        if (currentStatus.includes('en_route') || currentStatus.includes('transit') || (dLat !== 0 && dLng !== 0)) {
            navigation.navigate('EnRoute', {
                ...tripParams,
                hospitalLocation: {
                    latitude: dLat,
                    longitude: dLng,
                },
                hospitalName: activeTrip.drop_address || activeTrip.destination || 'Hospital',
            });
            return;
        }

        // If driver reached pickup point
        if (currentStatus.includes('reach') || currentStatus.includes('arrive') || currentStatus.includes('pick')) {
            navigation.navigate('ChooseHospital', tripParams);
            return;
        }

        // Default: Navigate to Pickup
        navigation.navigate('NavigationToPickup', tripParams);
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <Header
                leftImage={require('../../assets/images/app_logo_round.png')}
                leftImageStyle={styles.headerLogo}
                rightContent={
                    <View style={styles.headerRightContainer}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleGpsIconPress}
                            style={[
                                styles.headerGpsButton,
                                gpsStatus === 'locked'
                                    ? styles.headerGpsActive
                                    : styles.headerGpsInactive,
                            ]}
                        >
                            <AppIcon
                                family="material"
                                name="map-marker"
                                size={20}
                                color={
                                    gpsStatus === 'locked'
                                        ? '#16A34A'
                                        : '#DC2626'
                                }
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.headerBellButton}
                            onPress={handleNotifications}
                        >
                            <AppIcon
                                family="material"
                                name="bell-outline"
                                size={22}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </View>
                }
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
                                    {getGreetingText()},
                                </Text>

                                <Text style={styles.userName} numberOfLines={1}>
                                    {driverProfile?.name || driverProfile?.driver_name || ''}
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('Profile')}
                                style={styles.profileAvatar}
                            >
                                {(() => {
                                    const rawAvatar =
                                        driverProfile?.profile_image_url ||
                                        driverProfile?.profile_image ||
                                        driverProfile?.profile_photo ||
                                        driverProfile?.photo ||
                                        driverProfile?.image ||
                                        null;

                                    return (
                                        <ShowImage
                                            folderName={IMAGE_FOLDERS.PROFILE}
                                            filename={rawAvatar}
                                            style={styles.avatarImage}
                                            resizeMode="cover"
                                            fallbackComponent={
                                                <AppIcon
                                                    family="material"
                                                    name="account"
                                                    size={26}
                                                    color={colors.primary}
                                                />
                                            }
                                        />
                                    );
                                })()}
                            </TouchableOpacity>
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
                                {/* 1. Total Trips */}
                                <View style={styles.overviewRow}>
                                    <View style={styles.rowLeft}>
                                        <View
                                            style={[
                                                styles.iconBox,
                                                {
                                                    backgroundColor: colors.primaryLight,
                                                },
                                            ]}
                                        >
                                            <AppIcon
                                                family="material"
                                                name="format-list-bulleted"
                                                size={18}
                                                color={colors.primary}
                                            />
                                        </View>

                                        <Text style={styles.rowLabel}>
                                            Total Trips
                                        </Text>
                                    </View>

                                    <Text style={styles.rowValue}>
                                        {String(overviewData.total_count).padStart(2, '0')}
                                    </Text>
                                </View>

                                {/* 2. Assigned Trips */}
                                <View style={styles.overviewRow}>
                                    <View style={styles.rowLeft}>
                                        <View
                                            style={[
                                                styles.iconBox,
                                                {
                                                    backgroundColor: colors.warningLight,
                                                },
                                            ]}
                                        >
                                            <AppIcon
                                                family="material"
                                                name="clock-outline"
                                                size={18}
                                                color={colors.warning}
                                            />
                                        </View>

                                        <Text style={styles.rowLabel}>
                                            Assigned
                                        </Text>
                                    </View>

                                    <Text style={styles.rowValue}>
                                        {String(overviewData.assigned_count).padStart(2, '0')}
                                    </Text>
                                </View>

                                {/* 3. Completed Trips */}
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
                                                    backgroundColor: colors.successLight,
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
                                        {String(overviewData.completed_count).padStart(2, '0')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* =====================================================
                    ACTIVE TRIP ONGOING SECTION (BELOW TODAY'S OVERVIEW)
                ===================================================== */}
                        {activeTrip && (
                            <View style={styles.activeTripSection}>
                                <View style={styles.activeTripHeaderRow}>
                                    <View style={styles.liveIndicatorContainer}>
                                        <View style={styles.livePulseDot} />
                                        <Text style={styles.sectionTitle}>
                                            Ongoing Active Trip
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.activeStatusPill,
                                            (activeTrip.status || '').toLowerCase().includes('assign')
                                                ? styles.activeStatusPillAssigned
                                                : styles.activeStatusPillAccepted,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.activeStatusPillText,
                                                (activeTrip.status || '').toLowerCase().includes('assign')
                                                    ? styles.activeStatusPillAssignedText
                                                    : styles.activeStatusPillAcceptedText,
                                            ]}
                                        >
                                            {formatTripStatus(activeTrip.status)}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.92}
                                    onPress={handleResumeActiveTrip}
                                    style={styles.activeTripCard}
                                >
                                    {/* Top Row: Emergency Type Badge & Request ID */}
                                    <View style={styles.activeTripTopRow}>
                                        <View style={styles.activeTripEmergencyBadge}>
                                            <AppIcon
                                                family="material"
                                                name="ambulance"
                                                size={14}
                                                color={colors.danger}
                                            />
                                            <Text style={styles.activeTripEmergencyText} numberOfLines={1}>
                                                {activeTrip.emergency_type || 'Emergency Trip'}
                                            </Text>
                                        </View>
                                        <Text style={styles.activeTripIdText}>
                                            #{activeTrip.id || activeTrip.request_id || ''}
                                        </Text>
                                    </View>

                                    {/* Patient Info Row */}
                                    <View style={styles.activeTripPatientRow}>
                                        <View style={styles.activeTripAvatar}>
                                            <AppIcon
                                                family="material"
                                                name="account"
                                                size={18}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View style={styles.activeTripPatientDetails}>
                                            <Text style={styles.activeTripPatientName} numberOfLines={1}>
                                                {activeTrip.patient_name || 'Emergency Patient'}
                                            </Text>
                                            {!!(activeTrip.requester_phone || activeTrip.contact_no) && (
                                                <Text style={styles.activeTripPatientPhone}>
                                                    {activeTrip.requester_phone || activeTrip.contact_no}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Route Box */}
                                    <View style={styles.activeTripRouteBox}>
                                        <View style={styles.routeItemRow}>
                                            <View style={styles.routeDotGreen} />
                                            <View style={styles.routeTextCol}>
                                                <Text style={styles.routeHeaderLabel}>PICKUP LOCATION</Text>
                                                <Text style={styles.routeAddressText} numberOfLines={1}>
                                                    {activeTrip.pickup_address || activeTrip.address || 'Pickup Point'}
                                                </Text>
                                            </View>
                                        </View>

                                        {(activeTrip.drop_address || activeTrip.destination) && (
                                            <>
                                                <View style={styles.routeDottedLine} />
                                                <View style={styles.routeItemRow}>
                                                    <View style={styles.routeDotRed} />
                                                    <View style={styles.routeTextCol}>
                                                        <Text style={styles.routeHeaderLabel}>HOSPITAL / DESTINATION</Text>
                                                        <Text style={styles.routeAddressText} numberOfLines={1}>
                                                            {activeTrip.drop_address || activeTrip.destination}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    {/* Resume Navigation CTA Button */}
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={handleResumeActiveTrip}
                                        style={styles.resumeTripBtn}
                                    >
                                        <AppIcon
                                            family="material"
                                            name="navigation"
                                            size={15}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.resumeTripBtnText}>
                                            Resume Trip & Navigation
                                        </Text>
                                        <AppIcon
                                            family="feather"
                                            name="arrow-right"
                                            size={14}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <PermissionModal
                visible={showPermissionModal}
                status={permissionStatus}
                onClose={() => {
                    setShowPermissionModal(false);
                    checkAllPermissionsAndLocation().then(({ canProceed }) => {
                        setIsOnline(canProceed);
                        storage.set(STORAGE_KEYS.IS_DRIVER_ONLINE, canProceed);
                        sendStatusUpdate(canProceed);
                        if (canProceed) {
                            startPeriodicStatusUpdates();
                        } else {
                            stopPeriodicStatusUpdates();
                        }
                    });
                }}
                onPermissionsUpdated={async (updated, gpsOn) => {
                    setPermissionStatus(updated);
                    const canGoOnline = Boolean(updated.allGranted && gpsOn);
                    setIsOnline(canGoOnline);
                    await storage.set(STORAGE_KEYS.IS_DRIVER_ONLINE, canGoOnline);
                    await sendStatusUpdate(canGoOnline);
                    if (canGoOnline) {
                        startPeriodicStatusUpdates();
                    } else {
                        stopPeriodicStatusUpdates();
                    }
                }}
            />

            <GpsInfoModal
                visible={showGpsModal}
                gpsStatus={gpsStatus}
                coords={currentCoords}
                onClose={() => setShowGpsModal(false)}
                onEnableGps={handleEnableGpsFromModal}
            />

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
        paddingBottom: 112,
    },

    headerLogo: {
        width: 40,
        height: 40,
    },

    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    headerGpsButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },

    headerGpsActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
    },

    headerGpsInactive: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },

    headerBellButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
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

    avatarImage: {
        width: '100%',
        height: '100%',
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

    // =========================
    // Active Trip Ongoing Styles
    // =========================
    activeTripSection: {
        marginTop: 14,
        marginBottom: 20,
    },
    activeTripHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    liveIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    livePulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.successDark,
    },
    activeStatusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2.5,
        borderRadius: 8,
        borderWidth: 1,
    },
    activeStatusPillAssigned: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    activeStatusPillAssignedText: {
        color: '#D97706',
    },
    activeStatusPillAccepted: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    activeStatusPillAcceptedText: {
        color: '#059669',
    },
    activeStatusPillText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10.5,
        includeFontPadding: false,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    activeTripCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    activeTripTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    activeTripEmergencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.dangerLight,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    activeTripEmergencyText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        includeFontPadding: false,
        color: colors.danger,
        textTransform: 'capitalize',
    },
    activeTripIdText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        includeFontPadding: false,
        color: colors.textSecondary,
    },
    activeTripPatientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        marginBottom: 8,
    },
    activeTripAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTripPatientDetails: {
        flex: 1,
    },
    activeTripPatientName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13.5,
        lineHeight: 17,
        includeFontPadding: false,
        color: colors.textPrimary,
    },
    activeTripPatientPhone: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11.5,
        lineHeight: 15,
        includeFontPadding: false,
        color: colors.textSecondary,
        marginTop: 2,
    },
    activeTripRouteBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: colors.divider,
        paddingHorizontal: 10,
        paddingVertical: 7,
        marginBottom: 10,
    },
    routeItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    routeDotGreen: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: colors.successDark,
    },
    routeDotRed: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: colors.danger,
    },
    routeDottedLine: {
        width: 1.5,
        height: 7,
        backgroundColor: '#CBD5E1',
        marginLeft: 2.75,
        marginVertical: 1.5,
    },
    routeTextCol: {
        flex: 1,
    },
    routeHeaderLabel: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8.5,
        lineHeight: 11,
        includeFontPadding: false,
        color: colors.textLight,
        letterSpacing: 0.4,
    },
    routeAddressText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textPrimary,
        marginTop: 1.5,
    },
    resumeTripBtn: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9.5,
        borderRadius: 10,
        gap: 6,
    },
    resumeTripBtnText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12.5,
        includeFontPadding: false,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});
