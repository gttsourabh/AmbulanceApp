import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    ActivityIndicator,
    Modal,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {
    Polyline,
    PROVIDER_GOOGLE,
    PROVIDER_DEFAULT,
    MapType,
    Region,
} from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/hook';

import { colors, typography } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';
import {
    AmbulanceMarker,
    LocationMarker,
} from '../../../components/Map';
import { getDrivingRoutesWithAlternatives, RouteResult, LatLng } from '../../../services/directionsService';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from '../../../utils/locationPermission';
import { snapToRoutePolyline, getDistanceMeters } from '../../../utils/geoUtils';
import { updateDriverLocation, updateAmbulanceStatusApi } from '../../../api';
import {
    startBackgroundLocationTracking,
    stopBackgroundLocationTracking,
} from '../../../services/backgroundLocationService';

const NavigationToPickup = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const mapRef = useRef<MapView>(null);
    const hasInitialFit = useRef(false);

    // Static IDs for location tracking API (commented for dynamic usage)
    // const STATIC_AMBULANCE_REQUEST_ID = 5;
    // const STATIC_DRIVER_ID = 4;
    // const ambulanceRequestId = Number(route?.params?.requestId) || STATIC_AMBULANCE_REQUEST_ID;

    const user = useAppSelector(state => state.auth.user);
    const dynamicDriverId = Number(user?.driver_id || user?.id || user?.userId || 0);
    const ambulanceRequestId = Number(route?.params?.requestId || 0);

    const [distanceText, setDistanceText] = useState('Calculating...');
    const [etaText, setEtaText] = useState('Finding nearest route...');
    const [mapType, setMapType] = useState<MapType>('standard');
    const [primaryRouteInfo, setPrimaryRouteInfo] = useState<RouteResult | null>(null);
    const [altRouteInfo, setAltRouteInfo] = useState<RouteResult | null>(null);
    const [activeCoordinates, setActiveCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [alternativeCoordinates, setAlternativeCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const initialTripStatus = String(route?.params?.status || '').toLowerCase();
    const [selectedRouteType, setSelectedRouteType] = useState<'nearest' | 'alternative'>('nearest');
    const [isNavigating, setIsNavigating] = useState(
        initialTripStatus.includes('dispatch') || route?.params?.isNavigating === true
    );
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const isNavigatingRef = useRef(isNavigating);
    const isStartingNavRef = useRef(false);

    // Computes the shortest distance to patient from Google Routes API (comparing primary and alternative routes)
    const getShortestNpDistance = (): string => {
        let shortestMeters = 0;
        if (primaryRouteInfo && altRouteInfo) {
            shortestMeters = Math.min(
                primaryRouteInfo.distanceMeters,
                altRouteInfo.distanceMeters
            );
        } else if (primaryRouteInfo) {
            shortestMeters = primaryRouteInfo.distanceMeters;
        } else if (driverLocation) {
            shortestMeters = getDistanceMeters(driverLocation, pickupLocation);
        }
        return (shortestMeters / 1000).toFixed(1);
    };

    const handleToggleNavigation = async () => {
        // Prevent multiple clicks / double taps or starting if already navigating
        if (isNavigating || isUpdatingStatus || isStartingNavRef.current) {
            return;
        }

        isStartingNavRef.current = true;
        setIsUpdatingStatus(true);
        const npDistance = getShortestNpDistance();
        console.log(`📡 [START NAVIGATION] Shortest Google Routes distance (np_distance): ${npDistance} km`);

        try {
            console.log('📡 [POST /api/ambulance/update-status] Updating status to dispatched:', {
                request_id: ambulanceRequestId,
                status: 'dispatched',
                np_distance: npDistance,
            });

            const statusRes = await updateAmbulanceStatusApi({
                request_id: ambulanceRequestId,
                status: 'dispatched',
                np_distance: npDistance,
            });

            console.log('✅ [/api/ambulance/update-status SUCCESS]:', statusRes?.data);
            setIsNavigating(true);
            if (driverLocation) {
                mapRef.current?.animateCamera({
                    center: driverLocation,
                    pitch: 45,
                    heading: driverHeading,
                    zoom: 17,
                });
            }
        } catch (statusErr: any) {
            console.warn('⚠️ [/api/ambulance/update-status FAILED]:', statusErr?.response?.data || statusErr?.message);
            // Allow retry if API failed
            isStartingNavRef.current = false;
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    useEffect(() => {
        isNavigatingRef.current = isNavigating;
    }, [isNavigating]);

    // =====================================================
    // LIVE DRIVER GPS LOCATION & PATIENT PICKUP LOCATION
    // =====================================================

    // Check passed driver coordinates from previous screen (Never static Sangli!)
    const passedDriverLat = Number(
        route?.params?.driverLocation?.latitude ??
        route?.params?.driver_lat ??
        0
    );
    const passedDriverLng = Number(
        route?.params?.driverLocation?.longitude ??
        route?.params?.driver_lng ??
        0
    );

    const initialDriverLoc: LatLng | null = (passedDriverLat && passedDriverLng)
        ? { latitude: passedDriverLat, longitude: passedDriverLng }
        : null;

    const [driverLocation, setDriverLocation] = useState<LatLng | null>(initialDriverLoc);
    const [driverHeading, setDriverHeading] = useState<number>(0);
    const driverLocationRef = useRef<LatLng | null>(driverLocation);
    const hasRealDriverGpsRef = useRef<boolean>(Boolean(initialDriverLoc));

    // Keep ref in sync for 10s interval logging & API updates
    useEffect(() => {
        driverLocationRef.current = driverLocation;
    }, [driverLocation]);

    // 10-second background location tracking and API update when Start Navigation is active
    useEffect(() => {
        if (isNavigating) {
            console.log(
                `🚀 [NAVIGATION STARTED] Driver Live Location -> Lat: ${driverLocationRef.current?.latitude?.toFixed(6) ?? 'N/A'}, Lng: ${driverLocationRef.current?.longitude?.toFixed(6) ?? 'N/A'} | Request ID: ${ambulanceRequestId} | Driver ID: ${dynamicDriverId}`
            );
            startBackgroundLocationTracking({
                ambulanceRequestId: ambulanceRequestId,
                driverId: dynamicDriverId,
                type: 'np',
                getCoordinates: () => driverLocationRef.current || { latitude: 0, longitude: 0 },
            });
        } else {
            stopBackgroundLocationTracking();
        }

        return () => {
            stopBackgroundLocationTracking();
        };
    }, [isNavigating, ambulanceRequestId, dynamicDriverId]);

    // Patient Pickup Location: from navigation params
    const pickupLocation: LatLng = useMemo(() => {
        if (route?.params?.pickupLocation?.latitude && route?.params?.pickupLocation?.longitude) {
            return {
                latitude: Number(route.params.pickupLocation.latitude),
                longitude: Number(route.params.pickupLocation.longitude),
            };
        }
        if (route?.params?.patientLocation?.latitude && route?.params?.patientLocation?.longitude) {
            return {
                latitude: Number(route.params.patientLocation.latitude),
                longitude: Number(route.params.patientLocation.longitude),
            };
        }
        if (route?.params?.pickup_lat && route?.params?.pickup_lng) {
            return {
                latitude: Number(route.params.pickup_lat),
                longitude: Number(route.params.pickup_lng),
            };
        }
        if (driverLocation) {
            return {
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
            };
        }
        return {
            latitude: 0,
            longitude: 0,
        };
    }, [route?.params, driverLocation]);

    // Fallback direct road polyline if offline/loading
    const fallbackRoute = useMemo(() => {
        if (driverLocation && pickupLocation.latitude && pickupLocation.longitude) {
            return [driverLocation, pickupLocation];
        }
        if (pickupLocation.latitude && pickupLocation.longitude) {
            return [pickupLocation];
        }
        return [];
    }, [driverLocation, pickupLocation]);

    const initialRegion: Region = useMemo(() => {
        if (driverLocation && pickupLocation.latitude && pickupLocation.longitude) {
            const minLat = Math.min(driverLocation.latitude, pickupLocation.latitude);
            const maxLat = Math.max(driverLocation.latitude, pickupLocation.latitude);
            const minLng = Math.min(driverLocation.longitude, pickupLocation.longitude);
            const maxLng = Math.max(driverLocation.longitude, pickupLocation.longitude);

            const latDelta = Math.max(0.04, (maxLat - minLat) * 1.6);
            const lngDelta = Math.max(0.04, (maxLng - minLng) * 1.6);

            return {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            };
        }

        if (pickupLocation.latitude && pickupLocation.longitude) {
            return {
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        if (driverLocation) {
            return {
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        return {
            latitude: 19.0760,
            longitude: 72.8777,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
        };
    }, [driverLocation, pickupLocation]);

    const currentRegionRef = useRef<Region>(initialRegion);
    const lastRouteFetchLoc = useRef<LatLng | null>(null);

    const [isInitialRouteLoading, setIsInitialRouteLoading] = useState(true);
    const [isUpdatingRoute, setIsUpdatingRoute] = useState(false);

    // Route fetcher from current driver position to pickup destination
    const updateDrivingRoute = async (currentDriverPos: LatLng, isInitial: boolean = false) => {
        if (!pickupLocation.latitude || !pickupLocation.longitude) return;
        if (isInitial) {
            setIsInitialRouteLoading(true);
        } else {
            setIsUpdatingRoute(true);
        }
        try {
            const routes = await getDrivingRoutesWithAlternatives(currentDriverPos, pickupLocation);
            if (routes?.primaryRoute && routes.primaryRoute.coordinates.length > 0) {
                setPrimaryRouteInfo(routes.primaryRoute);
                setActiveCoordinates(routes.primaryRoute.coordinates);
                setDistanceText(routes.primaryRoute.distanceText);
                if (routes.primaryRoute.durationText) {
                    setEtaText(routes.primaryRoute.durationText);
                }

                if (routes.alternativeRoute && routes.alternativeRoute.coordinates.length > 0) {
                    setAltRouteInfo(routes.alternativeRoute);
                    setAlternativeCoordinates(routes.alternativeRoute.coordinates);
                }

                if (!hasInitialFit.current) {
                    hasInitialFit.current = true;
                    mapRef.current?.fitToCoordinates(
                        [currentDriverPos, pickupLocation, ...routes.primaryRoute.coordinates],
                        {
                            edgePadding: { top: 90, right: 50, bottom: 200, left: 50 },
                            animated: true,
                        }
                    );
                }
            } else {
                const directLine = [currentDriverPos, pickupLocation];
                setActiveCoordinates(directLine);
                if (!hasInitialFit.current) {
                    hasInitialFit.current = true;
                    mapRef.current?.fitToCoordinates(directLine, {
                        edgePadding: { top: 90, right: 50, bottom: 200, left: 50 },
                        animated: true,
                    });
                }
            }
        } catch (routeErr) {
            console.warn('Driving route error in NavigationToPickup:', routeErr);
            setActiveCoordinates([currentDriverPos, pickupLocation]);
        } finally {
            if (isInitial) {
                setIsInitialRouteLoading(false);
            } else {
                setIsUpdatingRoute(false);
            }
        }
    };

    // WATCH POSITION: High-precision real-time GPS tracking for Driver
    useEffect(() => {
        let watchId: number | null = null;
        let isMounted = true;

        const applyDriverLocation = (rawCoords: LatLng, heading?: number) => {
            if (!isMounted) return;

            const isFirstFix = !hasRealDriverGpsRef.current;
            hasRealDriverGpsRef.current = true;

            // Snap to active driving route polyline if available
            let finalCoords = rawCoords;
            let currentBearing = heading;

            if (activeCoordinates.length > 0) {
                const snapResult = snapToRoutePolyline(rawCoords, activeCoordinates, 35);
                finalCoords = snapResult.point;
                if (snapResult.roadBearing !== undefined) {
                    currentBearing = snapResult.roadBearing;
                }
            }

            setDriverLocation(finalCoords);
            driverLocationRef.current = finalCoords;

            if (currentBearing !== undefined && currentBearing >= 0) {
                setDriverHeading(currentBearing);
            }

            // 1. First GPS fix: compute initial route from driver's REAL position to pickup
            if (isFirstFix) {
                console.log(
                    `📍 [DRIVER LIVE GPS ACQUIRED in NavigationToPickup]: ${finalCoords.latitude.toFixed(6)}, ${finalCoords.longitude.toFixed(6)}`
                );
                lastRouteFetchLoc.current = finalCoords;
                updateDrivingRoute(finalCoords, true);

                // Smoothly focus camera on driver's live position
                mapRef.current?.animateCamera({
                    center: finalCoords,
                    zoom: 16,
                    pitch: 35,
                }, { duration: 600 });
                return;
            }

            // 2. Ignore small GPS jitter/drift when stationary (< 2.5 meters)
            if (
                lastRouteFetchLoc.current &&
                getDistanceMeters(lastRouteFetchLoc.current, rawCoords) < 2.5
            ) {
                return;
            }

            // 3. If navigation mode is active, smoothly follow driver with camera
            if (isNavigatingRef.current) {
                mapRef.current?.animateCamera({
                    center: finalCoords,
                    pitch: 45,
                    heading: currentBearing ?? driverHeading,
                    zoom: 17,
                }, { duration: 600 });
            }

            // 4. Recalculate route if driver moved > 40 meters from last calculation point
            if (
                !lastRouteFetchLoc.current ||
                getDistanceMeters(lastRouteFetchLoc.current, rawCoords) > 40
            ) {
                lastRouteFetchLoc.current = rawCoords;
                updateDrivingRoute(rawCoords, false);
            }
        };

        const startLocationTracking = async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission || !isMounted) return;

            // Configure Geolocation to use playServices / high accuracy hardware GPS
            try {
                Geolocation.setRNConfiguration({
                    skipPermissionRequests: false,
                    authorizationLevel: 'whenInUse',
                    locationProvider: 'auto',
                    enableBackgroundLocationUpdates: false,
                });
            } catch (cfgErr) {
                console.warn('Geolocation config warning:', cfgErr);
            }

            // If initial driver location was passed in params, compute initial route immediately
            if (initialDriverLoc) {
                lastRouteFetchLoc.current = initialDriverLoc;
                updateDrivingRoute(initialDriverLoc, true);
            }

            // 1. Instant low-accuracy / cached fix (< 200ms) - Gets driver's real location immediately
            Geolocation.getCurrentPosition(
                pos => {
                    applyDriverLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }, pos.coords.heading ?? undefined);
                },
                err => console.log('Fast cached GPS info in NavigationToPickup:', err?.message),
                { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
            );

            // 2. Fresh high-accuracy GPS fix from device GPS hardware
            Geolocation.getCurrentPosition(
                pos => {
                    applyDriverLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }, pos.coords.heading ?? undefined);
                },
                err => console.warn('High-accuracy GPS fix error in NavigationToPickup:', err?.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
            );

            // 3. Continuous real-time tracking as driver moves
            watchId = Geolocation.watchPosition(
                pos => {
                    applyDriverLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    }, pos.coords.heading ?? undefined);
                },
                watchErr => {
                    console.warn('NavigationToPickup watchPosition error:', watchErr?.message);
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 3, // update every 3 meters
                    interval: 2000,    // 2 seconds
                    fastestInterval: 1000,
                    useSignificantChanges: false,
                }
            );
        };

        startLocationTracking();

        return () => {
            isMounted = false;
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectRoute = (type: 'nearest' | 'alternative') => {
        setSelectedRouteType(type);
        if (type === 'nearest' && primaryRouteInfo) {
            setDistanceText(primaryRouteInfo.distanceText);
            if (primaryRouteInfo.durationText) setEtaText(primaryRouteInfo.durationText);
            mapRef.current?.fitToCoordinates(primaryRouteInfo.coordinates, {
                edgePadding: { top: 70, right: 40, bottom: 210, left: 40 },
                animated: true,
            });
        } else if (type === 'alternative' && altRouteInfo) {
            setDistanceText(altRouteInfo.distanceText);
            if (altRouteInfo.durationText) setEtaText(altRouteInfo.durationText);
            mapRef.current?.fitToCoordinates(altRouteInfo.coordinates, {
                edgePadding: { top: 70, right: 40, bottom: 210, left: 40 },
                animated: true,
            });
        }
    };

    // =====================================================
    // MAP ACTIONS (ZOOM, RECENTER, LAYER TOGGLE)
    // =====================================================

    const handleBackToRoute = () => {
        const fallback = driverLocation ? [driverLocation, pickupLocation] : [pickupLocation];
        const coordsToFit = activeCoordinates.length > 0
            ? activeCoordinates
            : fallback;

        mapRef.current?.fitToCoordinates(coordsToFit, {
            edgePadding: { top: 70, right: 40, bottom: 210, left: 40 },
            animated: true,
        });
    };

    const handleZoomIn = () => {
        const reg = currentRegionRef.current || initialRegion;
        const newRegion: Region = {
            latitude: reg.latitude,
            longitude: reg.longitude,
            latitudeDelta: Math.max(0.001, reg.latitudeDelta * 0.5),
            longitudeDelta: Math.max(0.001, reg.longitudeDelta * 0.5),
        };
        currentRegionRef.current = newRegion;
        mapRef.current?.animateToRegion(newRegion, 250);
    };

    const handleZoomOut = () => {
        const reg = currentRegionRef.current || initialRegion;
        const newRegion: Region = {
            latitude: reg.latitude,
            longitude: reg.longitude,
            latitudeDelta: Math.min(10, reg.latitudeDelta * 2),
            longitudeDelta: Math.min(10, reg.longitudeDelta * 2),
        };
        currentRegionRef.current = newRegion;
        mapRef.current?.animateToRegion(newRegion, 250);
    };

    const toggleMapType = () => {
        setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'));
    };

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleCall = () => {
        // Commented static phone fallback:
        // const phone = route?.params?.contactNo || '9373962355';
        const phone = route?.params?.contactNo;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert('Notice', 'No contact number available for this patient.');
        }
    };

    // =====================================================
    // MANUAL ARRIVAL HANDLER (200m cap removed for manual control)
    // =====================================================
    const isProcessingArrivalRef = useRef(false);

    const handleArrived = useCallback(() => {
        if (isProcessingArrivalRef.current) return;
        isProcessingArrivalRef.current = true;

        const npDistanceKm = (() => {
            if (primaryRouteInfo?.distanceMeters) {
                return (primaryRouteInfo.distanceMeters / 1000).toFixed(1);
            }
            const shortest = getShortestNpDistance();
            const num = parseFloat(shortest);
            if (!isNaN(num) && num > 0) return num.toFixed(1);
            if (driverLocation && pickupLocation.latitude) {
                return (getDistanceMeters(driverLocation, pickupLocation) / 1000).toFixed(1);
            }
            return '0.0';
        })();

        console.log(`📍 [MANUAL ARRIVED AT PICKUP] Driver confirmed arrival at pickup location. Pickup leg distance (np_distance): ${npDistanceKm} km`);

        stopBackgroundLocationTracking();
        setIsNavigating(false);

        // Forward dynamic trip parameters to ChooseHospital screen
        (navigation.navigate as any)('ChooseHospital', {
            requestId: ambulanceRequestId,
            driverId: dynamicDriverId,
            patientName: route?.params?.patientName || 'Emergency Patient',
            contactNo: route?.params?.contactNo || '',
            address: route?.params?.address || 'Pickup Location',
            pickupAddress: route?.params?.address || 'Pickup Location',
            patientAddress: route?.params?.address || 'Pickup Location',
            pickupLocation: pickupLocation,
            patientLocation: pickupLocation,
            pickup_lat: pickupLocation.latitude,
            pickup_lng: pickupLocation.longitude,
            driverLocation: driverLocation,
            driver_lat: driverLocation?.latitude,
            driver_lng: driverLocation?.longitude,
            destination: route?.params?.destination || 'Nearest Emergency Hospital',
            emergencyType: route?.params?.emergencyType || 'Emergency',
            np_distance: `${npDistanceKm} km`,
            npDistance: `${npDistanceKm} km`,
            pickup_distance: `${npDistanceKm} km`,
            initialDriverLocation: driverLocation,
        });
    }, [
        ambulanceRequestId,
        dynamicDriverId,
        route?.params,
        pickupLocation,
        driverLocation,
        primaryRouteInfo,
        navigation,
    ]);

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
        >
            {/* HEADER */}
            <Header title='Navigation To Pickup' />

            {/* MAP VIEW */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    initialRegion={initialRegion}
                    mapType={mapType}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsCompass={true}
                    showsScale={true}
                    loadingEnabled={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    onRegionChangeComplete={(region) => {
                        currentRegionRef.current = region;
                    }}
                >
                    {/* Alternative Road Polyline (Blue when active, Gray dotted when secondary) */}
                    {alternativeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={alternativeCoordinates}
                            strokeColor={selectedRouteType === 'alternative' ? '#2563EB' : '#94A3B8'}
                            strokeWidth={selectedRouteType === 'alternative' ? 6 : 4}
                            lineDashPattern={selectedRouteType === 'alternative' ? undefined : [6, 6]}
                            lineCap="round"
                            lineJoin="round"
                            tappable={true}
                            onPress={() => selectRoute('alternative')}
                        />
                    )}

                    {/* Nearest / Primary Road Polyline (Blue when active, Gray dotted when secondary) */}
                    {activeCoordinates.length > 0 ? (
                        <Polyline
                            coordinates={activeCoordinates}
                            strokeColor={selectedRouteType === 'nearest' ? '#2563EB' : '#94A3B8'}
                            strokeWidth={selectedRouteType === 'nearest' ? 6 : 4}
                            lineDashPattern={selectedRouteType === 'nearest' ? undefined : [6, 6]}
                            lineCap="round"
                            lineJoin="round"
                            tappable={true}
                            onPress={() => selectRoute('nearest')}
                        />
                    ) : (
                        <Polyline
                            coordinates={fallbackRoute}
                            strokeColor="#2563EB"
                            strokeWidth={6}
                            lineCap="round"
                            lineJoin="round"
                        />
                    )}

                    {/* Driver Vehicle Marker */}
                    {driverLocation ? (
                        <AmbulanceMarker
                            coordinate={driverLocation}
                            title="Ambulance"
                            description="Your current location"
                            heading={driverHeading}
                        />
                    ) : null}

                    {/* Patient Pickup Destination Marker */}
                    {pickupLocation.latitude && pickupLocation.longitude ? (
                        <LocationMarker
                            coordinate={pickupLocation}
                            type="pickup"
                            title={route?.params?.patientName ? `${route.params.patientName} (Patient)` : 'Patient Pickup'}
                            description={route?.params?.address || 'Pickup Location'}
                            label="Patient Pickup"
                        />
                    ) : null}
                </MapView>

                {/* FLOATING MAP CONTROLS (SATELLITE, BACK TO ROUTE, ZOOM) */}
                <View style={styles.controlsContainer}>
                    {/* SATELLITE / NORMAL SWITCH BUTTON */}
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            mapType === 'satellite' && styles.controlButtonActive,
                        ]}
                        onPress={toggleMapType}
                        activeOpacity={0.8}
                    >
                        <AppIcon
                            family="material"
                            name={mapType === 'satellite' ? 'map' : 'satellite-variant'}
                            size={20}
                            color={mapType === 'satellite' ? colors.white : colors.primary}
                        />
                    </TouchableOpacity>

                    {/* BACK TO ROUTE / RECENTER BUTTON */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleBackToRoute}
                        activeOpacity={0.8}
                    >
                        <AppIcon
                            family="material"
                            name="crosshairs-gps"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>

                    {/* ZOOM IN */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleZoomIn}
                        activeOpacity={0.8}
                    >
                        <AppIcon
                            family="material"
                            name="plus"
                            size={20}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    {/* ZOOM OUT */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleZoomOut}
                        activeOpacity={0.8}
                    >
                        <AppIcon
                            family="material"
                            name="minus"
                            size={20}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>

                {/* UNIFIED NAVIGATION & PATIENT DISPATCH CARD */}
                <View style={styles.navigationCardShadowWrap}>
                    <View style={styles.navigationCard}>
                        {/* ROUTE STATS / ETA ROW */}
                        <View style={styles.routeStatsRow}>
                            <View style={styles.etaContainer}>
                                <View style={styles.etaIconBadge}>
                                    <AppIcon
                                        family="material"
                                        name="clock-time-four-outline"
                                        size={17}
                                        color="#2563EB"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.etaLabel}>ESTIMATED TIME</Text>
                                    <Text style={styles.etaValue}>
                                        {isInitialRouteLoading ? 'Calculating...' : etaText}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.statsSeparator} />

                            <View style={styles.distanceContainer}>
                                <View style={styles.distanceIconBadge}>
                                    <AppIcon
                                        family="material"
                                        name="navigation-variant"
                                        size={15}
                                        color="#059669"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.distanceLabel}>DISTANCE</Text>
                                    <Text style={styles.distanceValue}>
                                        {isInitialRouteLoading ? '--' : distanceText}
                                    </Text>
                                </View>
                            </View>

                            {isUpdatingRoute && (
                                <ActivityIndicator size="small" color="#2563EB" style={styles.updatingSpinner} />
                            )}
                        </View>

                        {/* 2 ROADS SELECTOR PILLS (IF ALTERNATIVE AVAILABLE) */}
                        {alternativeCoordinates.length > 0 && (
                            <View style={styles.routePillsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.routePill,
                                        selectedRouteType === 'nearest' && styles.routePillActive,
                                    ]}
                                    onPress={() => selectRoute('nearest')}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.routePillText,
                                            selectedRouteType === 'nearest' && styles.routePillTextActive,
                                        ]}
                                    >
                                        ⭐ Fastest ({primaryRouteInfo?.distanceText || 'Road 1'})
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.routePill,
                                        selectedRouteType === 'alternative' && styles.routePillActive,
                                    ]}
                                    onPress={() => selectRoute('alternative')}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.routePillText,
                                            selectedRouteType === 'alternative' && styles.routePillTextActive,
                                        ]}
                                    >
                                        Road 2 ({altRouteInfo?.distanceText || 'Alt'})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.cardDivider} />

                        {/* PATIENT INFO ROW */}
                        <View style={styles.patientRow}>
                            <View style={styles.patientIcon}>
                                <AppIcon
                                    family="ionicons"
                                    name="person-outline"
                                    size={19}
                                    color={colors.primary}
                                />
                            </View>

                            <View style={styles.patientInfo}>
                                <Text style={styles.patientName}>
                                    {/* Static name commented: {route?.params?.patientName || 'Omkar Bhosale'} */}
                                    {route?.params?.patientName || 'Emergency Patient'}
                                </Text>

                                <View style={styles.patientAddressRow}>
                                    <AppIcon
                                        family="material"
                                        name="map-marker-outline"
                                        size={12}
                                        color={colors.textLight}
                                    />

                                    <Text
                                        style={styles.patientAddress}
                                        numberOfLines={1}
                                    >
                                        {/* Static address commented: {route?.params?.address || 'Near Ganapati Temple, Vishrambag, Sangli'} */}
                                        {route?.params?.address || 'Pickup Location'}
                                    </Text>
                                </View>
                            </View>

                            <Button
                                title=""
                                onPress={handleCall}
                                icon="phone"
                                iconSize={17}
                                variant="primary"
                                style={styles.callButton}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* ACTION BUTTONS (START NAVIGATION & ARRIVED) */}
            <View style={styles.bottomContainer}>
                <View style={styles.bottomButtonsRow}>
                    <Button
                        title={isUpdatingStatus ? "Starting..." : isNavigating ? "Navigating" : "Start Navigation"}
                        onPress={handleToggleNavigation}
                        icon={isNavigating ? "navigation" : "navigation-variant"}
                        variant={isNavigating ? "secondary" : "primary"}
                        style={styles.startButton}
                        disabled={isUpdatingStatus || isNavigating}
                        loading={isUpdatingStatus}
                    />

                    <Button
                        title="Arrived"
                        onPress={handleArrived}
                        icon="map-marker-check"
                        variant="primary"
                        style={styles.arrivedButton}
                    />
                </View>
            </View>

            {/* ROUTE FINDING MODAL (CENTERED WITH BLURRED/TRANSLUCENT BACKDROP) */}
            <Modal
                visible={isInitialRouteLoading}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentCard}>
                        <View style={styles.modalIconWrap}>
                            <AppIcon
                                family="material"
                                name="navigation-variant"
                                size={28}
                                color="#2563EB"
                            />
                        </View>
                        <ActivityIndicator
                            size="large"
                            color="#2563EB"
                            style={styles.modalSpinner}
                        />
                        <Text style={styles.modalTitle}>
                            Finding Best Route
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Calculating fastest roads & live traffic...
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default NavigationToPickup;

const styles = StyleSheet.create({
    // SCREEN
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // MAP
    mapContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: colors.background,
    },

    map: {
        width: '100%',
        height: '100%',
        ...StyleSheet.absoluteFillObject,
    },

    // UNIFIED NAVIGATION & PATIENT CARD
    navigationCardShadowWrap: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 14,
        borderRadius: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        zIndex: 5,
    },

    navigationCard: {
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    // ROUTE STATS / ETA ROW
    routeStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 6,
    },

    etaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },

    etaIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    etaLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 9,
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },

    etaValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: colors.textPrimary,
        marginTop: 1,
    },

    statsSeparator: {
        width: 1,
        height: 24,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },

    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },

    distanceIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    distanceLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 9,
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },

    distanceValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: colors.textPrimary,
        marginTop: 1,
    },

    updatingSpinner: {
        marginLeft: 4,
    },

    // ROUTE PILLS
    routePillsRow: {
        flexDirection: 'row',
        gap: 6,
        paddingTop: 4,
        paddingBottom: 4,
    },

    routePill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },

    routePillActive: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },

    routePillText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        color: colors.textSecondary,
    },

    routePillTextActive: {
        color: colors.primary,
        fontFamily: 'GoogleSans-Bold',
    },

    cardDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginVertical: 6,
    },

    // PATIENT ROW
    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 2,
    },

    // FLOATING CONTROLS (TOP RIGHT)
    controlsContainer: {
        position: 'absolute',
        top: 14,
        right: 14,
        gap: 8,
        zIndex: 10,
    },

    controlButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },

    controlButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
    },

    patientIcon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    patientInfo: {
        flex: 1,
        paddingRight: 6,
    },

    patientName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        letterSpacing: 0.1,
        color: colors.textPrimary,
        marginBottom: 3,
    },

    patientAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    patientAddress: {
        flex: 1,
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    callButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        paddingHorizontal: 0,
        gap: 0,
    },

    // BOTTOM BUTTON
    bottomContainer: {
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },

    bottomButtonsRow: {
        flexDirection: 'row',
        gap: 8,
    },

    startButton: {
        flex: 1.2,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#2563EB',
    },

    arrivedButton: {
        flex: 0.9,
        height: 52,
        borderRadius: 14,
    },

    // CENTER ROUTE FINDING MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)', // blurred dark blue backdrop
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    modalContentCard: {
        width: '84%',
        maxWidth: 320,
        backgroundColor: colors.card,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
    },

    modalIconWrap: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },

    modalSpinner: {
        marginVertical: 4,
    },

    modalTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        marginTop: 4,
        textAlign: 'center',
    },

    modalSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
});