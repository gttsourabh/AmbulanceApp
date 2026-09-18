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
import { updateDriverLocation } from '../../../api';
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from '../../../services/backgroundLocationService';

const EnRouteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const user = useAppSelector(state => state.auth.user);
  const mapRef = useRef<MapView>(null);
  const hasInitialFit = useRef(false);

  // Dynamic Driver & Request IDs
  const dynamicDriverId = Number(route?.params?.driverId || user?.driver_id || user?.id || user?.userId || 0);
  const ambulanceRequestId = Number(route?.params?.requestId || 0);

  // =====================================================
  // PATIENT DETAILS & PICKUP LOCATION
  // =====================================================
  const patientName = route?.params?.patientName || 'Emergency Patient';
  const patientPhone = route?.params?.contactNo || '';
  const patientAddress =
    route?.params?.patientAddress ||
    route?.params?.pickupAddress ||
    route?.params?.address ||
    'Pickup Location';
  const emergencyType = route?.params?.emergencyType || 'Emergency';

  // Patient Location (only if coordinates were actually provided in trip params)
  const patientLat = Number(
    route?.params?.patientLocation?.latitude ??
    route?.params?.pickupLocation?.latitude ??
    route?.params?.pickup_lat ??
    0
  );
  const patientLng = Number(
    route?.params?.patientLocation?.longitude ??
    route?.params?.pickupLocation?.longitude ??
    route?.params?.pickup_lng ??
    0
  );

  const patientLocation: LatLng | null = useMemo(() => {
    if (patientLat && patientLng) {
      return { latitude: patientLat, longitude: patientLng };
    }
    return null;
  }, [patientLat, patientLng]);

  // =====================================================
  // HOSPITAL DESTINATION DETAILS & LOCATION
  // =====================================================
  const dynamicHospitalLat = Number(
    route?.params?.drop_lat ??
    route?.params?.hospitalLocation?.latitude ??
    route?.params?.destinationLocation?.latitude ??
    0
  );
  const dynamicHospitalLng = Number(
    route?.params?.drop_lng ??
    route?.params?.hospitalLocation?.longitude ??
    route?.params?.destinationLocation?.longitude ??
    0
  );

  const chosenHospitalName =
    route?.params?.hospitalName || route?.params?.destination || 'Civil Hospital Sangli';
  const chosenHospitalAddress =
    route?.params?.hospitalAddress || 'Govt. Medical College & Hospital, Sangli';
  const chosenHospitalPhone =
    route?.params?.hospitalPhone || '';

  const hospitalLocation: LatLng = useMemo(() => {
    if (dynamicHospitalLat && dynamicHospitalLng) {
      return { latitude: dynamicHospitalLat, longitude: dynamicHospitalLng };
    }
    return {
      latitude: 16.8543,
      longitude: 74.5772,
    };
  }, [dynamicHospitalLat, dynamicHospitalLng]);

  const [distanceText, setDistanceText] = useState('Calculating...');
  const [etaText, setEtaText] = useState('Finding nearest route...');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [primaryRouteInfo, setPrimaryRouteInfo] = useState<RouteResult | null>(null);
  const [altRouteInfo, setAltRouteInfo] = useState<RouteResult | null>(null);
  const [activeCoordinates, setActiveCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [alternativeCoordinates, setAlternativeCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [selectedRouteType, setSelectedRouteType] = useState<'nearest' | 'alternative'>('nearest');
  const [isNavigating, setIsNavigating] = useState(route?.params?.autoStartTracking !== false);
  const isNavigatingRef = useRef(isNavigating);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  // =====================================================
  // AMBULANCE LIVE LOCATION (Driver GPS - Never static Sangli!)
  // =====================================================
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

  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLng | null>(initialDriverLoc);
  const [ambulanceHeading, setAmbulanceHeading] = useState<number>(0);
  const ambulanceLocationRef = useRef<LatLng | null>(ambulanceLocation);
  const hasRealDriverGpsRef = useRef<boolean>(Boolean(initialDriverLoc));

  // Keep ref in sync for 10s interval logging & API updates
  useEffect(() => {
    ambulanceLocationRef.current = ambulanceLocation;
  }, [ambulanceLocation]);

  // 10-second background location tracking and API update when Start Navigation is active
  useEffect(() => {
    if (isNavigating) {
      console.log(
        `🚀 [EN-ROUTE NAVIGATION STARTED] Ambulance Live Location -> Lat: ${ambulanceLocationRef.current?.latitude?.toFixed(6) ?? 'N/A'}, Lng: ${ambulanceLocationRef.current?.longitude?.toFixed(6) ?? 'N/A'} | Request ID: ${ambulanceRequestId} | Driver ID: ${dynamicDriverId}`
      );
      startBackgroundLocationTracking({
        ambulanceRequestId: ambulanceRequestId,
        driverId: dynamicDriverId,
        type: 'ph',
        getCoordinates: () => ambulanceLocationRef.current || { latitude: 0, longitude: 0 },
      });
    } else {
      stopBackgroundLocationTracking();
    }

    return () => {
      stopBackgroundLocationTracking();
    };
  }, [isNavigating, ambulanceRequestId, dynamicDriverId]);

  // Fallback road coordinates connecting Ambulance/Driver and Hospital
  const fallbackRoute = useMemo(() => {
    if (ambulanceLocation) {
      return [ambulanceLocation, hospitalLocation];
    }
    if (patientLocation) {
      return [patientLocation, hospitalLocation];
    }
    return [hospitalLocation];
  }, [ambulanceLocation, patientLocation, hospitalLocation]);

  // Initial Region framing Ambulance/Driver and Hospital
  const initialRegion: Region = useMemo(() => {
    const origin = ambulanceLocation || patientLocation;
    if (origin) {
      const minLat = Math.min(origin.latitude, hospitalLocation.latitude);
      const maxLat = Math.max(origin.latitude, hospitalLocation.latitude);
      const minLng = Math.min(origin.longitude, hospitalLocation.longitude);
      const maxLng = Math.max(origin.longitude, hospitalLocation.longitude);

      const latDelta = Math.max(0.04, (maxLat - minLat) * 1.6);
      const lngDelta = Math.max(0.04, (maxLng - minLng) * 1.6);

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }

    return {
      latitude: hospitalLocation.latitude,
      longitude: hospitalLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [ambulanceLocation, patientLocation, hospitalLocation]);

  const currentRegionRef = useRef<Region>(initialRegion);
  const lastRouteFetchLoc = useRef<LatLng | null>(null);

  const [isRouteLoading, setIsRouteLoading] = useState(true);

  const updateHospitalRoute = async (currentAmbulancePos: LatLng) => {
    setIsRouteLoading(true);
    try {
      console.log(
        `📡 [EN ROUTE] Calculating road route from live driver GPS (${currentAmbulancePos.latitude.toFixed(5)}, ${currentAmbulancePos.longitude.toFixed(5)}) to hospital (${hospitalLocation.latitude.toFixed(5)}, ${hospitalLocation.longitude.toFixed(5)})`
      );
      const routes = await getDrivingRoutesWithAlternatives(currentAmbulancePos, hospitalLocation);
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
            [currentAmbulancePos, hospitalLocation, ...routes.primaryRoute.coordinates],
            {
              edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
              animated: true,
            }
          );
        }
      } else {
        const directLine = [currentAmbulancePos, hospitalLocation];
        setActiveCoordinates(directLine);
        if (!hasInitialFit.current) {
          hasInitialFit.current = true;
          mapRef.current?.fitToCoordinates(directLine, {
            edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
            animated: true,
          });
        }
      }
    } catch (routeErr) {
      console.warn('Driving route error in EnRoute:', routeErr);
      setActiveCoordinates([currentAmbulancePos, hospitalLocation]);
    } finally {
      setIsRouteLoading(false);
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

      setAmbulanceLocation(rawCoords);
      ambulanceLocationRef.current = rawCoords;

      if (heading !== undefined && heading >= 0) {
        setAmbulanceHeading(heading);
      }

      if (isFirstFix) {
        console.log(
          `📍 [DRIVER LIVE GPS ACQUIRED]: ${rawCoords.latitude.toFixed(6)}, ${rawCoords.longitude.toFixed(6)}`
        );
        lastRouteFetchLoc.current = rawCoords;
        updateHospitalRoute(rawCoords);

        // Center camera directly on driver's real device position
        mapRef.current?.animateCamera({
          center: rawCoords,
          zoom: 16,
          pitch: 35,
        }, { duration: 600 });
        return;
      }

      // Ignore small GPS jitter/drift when stationary (< 2.5 meters)
      if (
        lastRouteFetchLoc.current &&
        getDistanceMeters(lastRouteFetchLoc.current, rawCoords) < 2.5
      ) {
        return;
      }

      // If navigation mode is active, smoothly follow ambulance with camera
      if (isNavigatingRef.current) {
        mapRef.current?.animateCamera({
          center: rawCoords,
          pitch: 45,
          heading: heading ?? ambulanceHeading,
          zoom: 17,
        }, { duration: 600 });
      }

      // Check distance from last route calculation (> 40 meters)
      if (
        !lastRouteFetchLoc.current ||
        getDistanceMeters(lastRouteFetchLoc.current, rawCoords) > 40
      ) {
        lastRouteFetchLoc.current = rawCoords;
        updateHospitalRoute(rawCoords);
      }
    };

    const startLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission || !isMounted) return;

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

      // If initial driver location was passed from previous screen, start route calculation immediately
      if (initialDriverLoc) {
        lastRouteFetchLoc.current = initialDriverLoc;
        updateHospitalRoute(initialDriverLoc);
      }

      // 1. Instant low-accuracy / cached fix (< 200ms)
      Geolocation.getCurrentPosition(
        pos => {
          applyDriverLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }, pos.coords.heading ?? undefined);
        },
        err => console.log('Fast cached GPS info:', err?.message),
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
      );

      // 2. High-accuracy GPS fix from device GPS hardware
      Geolocation.getCurrentPosition(
        pos => {
          applyDriverLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }, pos.coords.heading ?? undefined);
        },
        err => console.warn('High-accuracy GPS fix error:', err?.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      // 3. Continuous real-time tracking
      watchId = Geolocation.watchPosition(
        pos => {
          applyDriverLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }, pos.coords.heading ?? undefined);
        },
        watchErr => {
          console.warn('EnRoute watchPosition error:', watchErr?.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 3,
          interval: 2000,
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
        edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
        animated: true,
      });
    } else if (type === 'alternative' && altRouteInfo) {
      setDistanceText(altRouteInfo.distanceText);
      if (altRouteInfo.durationText) setEtaText(altRouteInfo.durationText);
      mapRef.current?.fitToCoordinates(altRouteInfo.coordinates, {
        edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
        animated: true,
      });
    }
  };

  // =====================================================
  // MAP ACTIONS (ZOOM, RECENTER, LAYER TOGGLE)
  // =====================================================

  const handleBackToRoute = () => {
    const origin = ambulanceLocation || patientLocation;
    if (!origin) return;

    const coordsToFit = activeCoordinates.length > 0
      ? [origin, hospitalLocation, ...activeCoordinates]
      : [origin, hospitalLocation];

    mapRef.current?.fitToCoordinates(coordsToFit, {
      edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCallPatient = () => {
    if (patientPhone) {
      Linking.openURL(`tel:${patientPhone}`);
    } else {
      Alert.alert('Notice', 'No contact number available for this patient.');
    }
  };

  const handleCall = () => {
    const phone = chosenHospitalPhone || patientPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Notice', 'No contact number available.');
    }
  };

  // =====================================================
  // MANUAL REACHED HOSPITAL HANDLER (200m cap removed for manual control)
  // =====================================================
  const isProcessingReachedRef = useRef(false);

  const handleReachedHospital = useCallback(() => {
    if (isProcessingReachedRef.current) return;
    isProcessingReachedRef.current = true;

    const parseNum = (str: any): number => {
      if (!str) return 0;
      const n = parseFloat(String(str).replace(/[^0-9.]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    const resolvedPickup = patientLocation || ambulanceLocation || hospitalLocation;

    // Calculate Leg 2 distance (Pickup -> Hospital)
    const phKm = (() => {
      if (primaryRouteInfo?.distanceMeters) {
        return (primaryRouteInfo.distanceMeters / 1000).toFixed(1);
      }
      const fromText = parseNum(distanceText);
      if (fromText > 0) return fromText.toFixed(1);
      const fromParam = parseNum(route?.params?.ph_distance || route?.params?.phDistance);
      if (fromParam > 0) return fromParam.toFixed(1);
      if (resolvedPickup && hospitalLocation) {
        return (getDistanceMeters(resolvedPickup, hospitalLocation) / 1000).toFixed(1);
      }
      return '0.0';
    })();

    // Retrieve Leg 1 distance (Driver -> Pickup)
    const npKm = (() => {
      const fromParam = parseNum(route?.params?.np_distance || route?.params?.npDistance || route?.params?.pickup_distance);
      if (fromParam > 0) return fromParam.toFixed(1);
      if (route?.params?.initialDriverLocation && resolvedPickup) {
        return (getDistanceMeters(route.params.initialDriverLocation, resolvedPickup) / 1000).toFixed(1);
      }
      return '0.0';
    })();

    const npVal = parseFloat(npKm) || 0;
    const phVal = parseFloat(phKm) || 0;
    const totalVal = npVal + phVal > 0 ? (npVal + phVal).toFixed(1) : phVal.toFixed(1);

    console.log(`📍 [MANUAL REACHED HOSPITAL] Driver confirmed arrival at hospital. Trip Distances: Pickup Leg = ${npKm} km, Hospital Leg = ${phKm} km, Whole Trip Total = ${totalVal} km`);

    stopBackgroundLocationTracking();
    setIsNavigating(false);

    (navigation.navigate as any)('TripCompleted', {
      requestId: ambulanceRequestId,
      driverId: dynamicDriverId,
      patientName: patientName,
      contactNo: patientPhone,
      address: patientAddress,
      pickupAddress: patientAddress,
      patientAddress: patientAddress,
      patientLocation: resolvedPickup,
      pickupLocation: resolvedPickup,
      pickup_lat: resolvedPickup?.latitude,
      pickup_lng: resolvedPickup?.longitude,
      destination: chosenHospitalName,
      hospitalName: chosenHospitalName,
      hospitalAddress: chosenHospitalAddress,
      dropAddress: chosenHospitalAddress,
      hospitalPhone: chosenHospitalPhone,
      drop_lat: hospitalLocation.latitude,
      drop_lng: hospitalLocation.longitude,
      hospitalLocation: hospitalLocation,
      // Whole trip and individual leg distances
      np_distance: `${npVal.toFixed(1)} km`,
      ph_distance: `${phVal.toFixed(1)} km`,
      total_distance: `${totalVal} km`,
      whole_trip_distance: `${totalVal} km`,
      distance: `${totalVal} km`,
      emergencyType: emergencyType,
      initialDriverLocation: route?.params?.initialDriverLocation,
    });
  }, [
    patientLocation,
    ambulanceLocation,
    hospitalLocation,
    ambulanceRequestId,
    dynamicDriverId,
    patientName,
    patientPhone,
    patientAddress,
    chosenHospitalName,
    chosenHospitalAddress,
    chosenHospitalPhone,
    distanceText,
    primaryRouteInfo,
    route?.params,
    emergencyType,
    navigation,
  ]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* HEADER */}
      <Header backEnabled onLeftPress={handleBack} title="En-Route To Hospital" />

      {/* PATIENT TRIP CONTEXT BAR */}
      <View style={styles.patientContextBar}>
        <View style={styles.patientContextLeft}>
          <View style={styles.patientIconWrap}>
            <AppIcon
              family="material"
              name="account-alert"
              size={18}
              color={colors.white}
            />
          </View>
          <View style={styles.patientContextInfo}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName} numberOfLines={1}>
                {patientName}
              </Text>
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>
                  {emergencyType.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.patientAddressRow}>
              <AppIcon
                family="material"
                name="map-marker-radius"
                size={12}
                color={colors.textLight}
              />
              <Text style={styles.patientAddress} numberOfLines={1}>
                {patientAddress}
              </Text>
            </View>
          </View>
        </View>

        {patientPhone ? (
          <TouchableOpacity
            style={styles.patientCallButton}
            onPress={handleCallPatient}
            activeOpacity={0.7}
          >
            <AppIcon
              family="material"
              name="phone"
              size={16}
              color={colors.white}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* MAP AREA */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={true}
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

          {/* Patient Pickup Origin Marker (rendered only if valid coordinates passed) */}
          {patientLocation && (
            <LocationMarker
              coordinate={patientLocation}
              type="pickup"
              title={`${patientName} (Pickup)`}
              description={patientAddress}
              label="Pickup"
            />
          )}

          {/* Ambulance Live Location Marker */}
          {ambulanceLocation && (
            <AmbulanceMarker
              coordinate={ambulanceLocation}
              title="Ambulance (My Location)"
              description={`Heading to ${chosenHospitalName}`}
              heading={ambulanceHeading}
            />
          )}

          {/* Hospital Destination Marker */}
          <LocationMarker
            coordinate={hospitalLocation}
            type="hospital"
            title={chosenHospitalName}
            description={chosenHospitalAddress}
            label={chosenHospitalName.split(' ')[0]}
          />
        </MapView>

        {/* DISTANCE / ROUTE SELECTOR CARD */}
        <View style={styles.distanceCard}>
          <View style={styles.distanceCardHeader}>
            <View style={styles.distanceIcon}>
              <AppIcon
                family="material"
                name="navigation"
                size={16}
                color={colors.white}
              />
            </View>

            <View style={styles.distanceTextContainer}>
              {isRouteLoading ? (
                <View style={styles.routeLoadingRow}>
                  <ActivityIndicator size="small" color={colors.danger} />
                  <Text style={styles.distanceText}>
                    Finding nearest route...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.distanceText}>
                    {distanceText}
                  </Text>

                  <Text style={styles.etaText}>
                    {etaText}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* 2 ROADS SELECTOR PILLS */}
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
        </View>

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

        {/* HOSPITAL CARD */}
        <View style={styles.hospitalCardShadowWrap}>
          <View style={styles.hospitalCard}>
            <View style={styles.hospitalIcon}>
              <AppIcon
                family="material"
                name="hospital-building"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName} numberOfLines={1}>
                {chosenHospitalName}
              </Text>

              <View style={styles.hospitalAddressRow}>
                <AppIcon
                  family="material"
                  name="map-marker-outline"
                  size={12}
                  color={colors.textLight}
                />

                <Text
                  style={styles.hospitalAddress}
                  numberOfLines={1}
                >
                  {chosenHospitalAddress}
                </Text>
              </View>
            </View>

            {chosenHospitalPhone ? (
              <Button
                title=""
                onPress={handleCall}
                icon="phone"
                iconSize={17}
                variant="primary"
                style={styles.callButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      {/* ACTION BUTTONS (START NAVIGATION & REACHED HOSPITAL) */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomButtonsRow}>
          <Button
            title={isNavigating ? "Navigating..." : "Start Navigation"}
            onPress={() => {
              const nextState = !isNavigating;
              setIsNavigating(nextState);
              if (nextState && (ambulanceLocation || hospitalLocation)) {
                mapRef.current?.animateCamera({
                  center: ambulanceLocation || hospitalLocation,
                  pitch: 45,
                  heading: ambulanceHeading,
                  zoom: 17,
                });
              }
            }}
            icon={isNavigating ? "navigation" : "navigation-variant"}
            variant={isNavigating ? "secondary" : "primary"}
            style={styles.startButton}
          />

          <Button
            title="Reached"
            onPress={handleReachedHospital}
            icon="check-circle"
            variant="primary"
            style={styles.reachedButton}
          />
        </View>
      </View>

      {/* ROUTE FINDING MODAL (CENTERED WITH BLURRED/TRANSLUCENT BACKDROP) */}
      <Modal
        visible={isRouteLoading}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalIconWrap}>
              <AppIcon
                family="material"
                name="hospital-box"
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
              Finding Hospital Route
            </Text>
            <Text style={styles.modalSubtitle}>
              Calculating fastest road to {chosenHospitalName}...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EnRouteScreen;

const styles = StyleSheet.create({
  // SCREEN
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // PATIENT TRIP CONTEXT BAR
  patientContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },

  patientContextLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  patientIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  patientContextInfo: {
    flex: 1,
  },

  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  patientName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    maxWidth: '70%',
  },

  emergencyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },

  emergencyBadgeText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 9,
    color: colors.danger,
    letterSpacing: 0.5,
  },

  patientAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },

  patientAddress: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },

  patientCallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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

  // DISTANCE CARD
  distanceCard: {
    position: 'absolute',
    top: 14,
    left: 14,
    minWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 5,
  },

  distanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  distanceTextContainer: {
    flex: 1,
  },

  routeLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  routePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },

  routePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  routePillActive: {
    backgroundColor: colors.dangerLight || '#FEE2E2',
    borderColor: colors.danger,
  },

  routePillText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    color: colors.textSecondary,
  },

  routePillTextActive: {
    color: colors.danger,
    fontFamily: 'GoogleSans-Bold',
  },

  distanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  distanceText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },

  etaText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
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

  // HOSPITAL CARD
  hospitalCardShadowWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    zIndex: 5,
  },

  hospitalCard: {
    minHeight: 72,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  hospitalInfo: {
    flex: 1,
    paddingRight: 6,
  },

  hospitalName: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,
    color: colors.textPrimary,
    marginBottom: 3,
  },

  hospitalAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  hospitalAddress: {
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

  reachedButton: {
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