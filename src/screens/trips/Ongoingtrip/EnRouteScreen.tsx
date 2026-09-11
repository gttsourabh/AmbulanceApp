import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {
  Polyline,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  MapType,
  Region,
} from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

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
  const mapRef = useRef<MapView>(null);
  const hasInitialFit = useRef(false);

  // Static IDs for location tracking API
  const STATIC_AMBULANCE_REQUEST_ID = 5;
  const STATIC_DRIVER_ID = 4;

  const [distanceText, setDistanceText] = useState('Calculating...');
  const [etaText, setEtaText] = useState('Finding nearest route...');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [primaryRouteInfo, setPrimaryRouteInfo] = useState<RouteResult | null>(null);
  const [altRouteInfo, setAltRouteInfo] = useState<RouteResult | null>(null);
  const [activeCoordinates, setActiveCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [alternativeCoordinates, setAlternativeCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [selectedRouteType, setSelectedRouteType] = useState<'nearest' | 'alternative'>('nearest');
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(isNavigating);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  // =====================================================
  // SANGLI CITY LOCATION DATA (Ambulance -> Nearest Hospital)
  // =====================================================

  // Ambulance with Patient (Default to Vishrambag, Sangli until GPS updates)
  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLng>({
    latitude: 16.8455,
    longitude: 74.6010,
  });
  const [ambulanceHeading, setAmbulanceHeading] = useState<number>(135);
  const ambulanceLocationRef = useRef<LatLng>(ambulanceLocation);

  // Keep ref in sync for 10s interval logging & API updates
  useEffect(() => {
    ambulanceLocationRef.current = ambulanceLocation;
  }, [ambulanceLocation]);

  // 10-second background location tracking and API update when Start Navigation is active
  useEffect(() => {
    if (isNavigating) {
      console.log(
        `🚀 [EN-ROUTE NAVIGATION STARTED] Ambulance Live Location -> Lat: ${ambulanceLocationRef.current.latitude.toFixed(6)}, Lng: ${ambulanceLocationRef.current.longitude.toFixed(6)}`
      );
      startBackgroundLocationTracking({
        ambulanceRequestId: STATIC_AMBULANCE_REQUEST_ID,
        driverId: STATIC_DRIVER_ID,
        getCoordinates: () => ambulanceLocationRef.current,
      });
    } else {
      stopBackgroundLocationTracking();
    }

    return () => {
      stopBackgroundLocationTracking();
    };
  }, [isNavigating]);

  // Hospital Destination: Government Medical College & Hospital (Civil Hospital), Sangli
  const hospitalLocation: LatLng = {
    latitude: 16.8543,
    longitude: 74.5772,
  };

  // Fallback road coordinates
  const fallbackRoute = [
    ambulanceLocation,
    hospitalLocation,
  ];

  const initialRegion: Region = {
    latitude: (ambulanceLocation.latitude + hospitalLocation.latitude) / 2,
    longitude: (ambulanceLocation.longitude + hospitalLocation.longitude) / 2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const currentRegionRef = useRef<Region>(initialRegion);
  const lastRouteFetchLoc = useRef<LatLng | null>(null);

  const [isRouteLoading, setIsRouteLoading] = useState(true);

  const updateHospitalRoute = async (currentAmbulancePos: LatLng) => {
    setIsRouteLoading(true);
    try {
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
          mapRef.current?.fitToCoordinates(routes.primaryRoute.coordinates, {
            edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
            animated: true,
          });
        }
      } else {
        setActiveCoordinates(fallbackRoute);
        if (!hasInitialFit.current) {
          hasInitialFit.current = true;
          mapRef.current?.fitToCoordinates([currentAmbulancePos, hospitalLocation], {
            edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
            animated: true,
          });
        }
      }
    } finally {
      setIsRouteLoading(false);
    }
  };

  // WATCH POSITION: High-precision real-time GPS tracking for Ambulance
  useEffect(() => {
    let watchId: number | null = null;
    let isMounted = true;

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

      const onLocationSuccess = (position: any) => {
        if (!isMounted) return;
        const rawCoords: LatLng = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Ignore small GPS jitter/drift when stationary (< 2.5 meters)
        if (
          lastRouteFetchLoc.current &&
          getDistanceMeters(lastRouteFetchLoc.current, rawCoords) < 2.5
        ) {
          return;
        }

        // Snap to active driving route polyline (within 35 meters)
        const currentPolyline = activeCoordinates.length > 0 ? activeCoordinates : fallbackRoute;
        const snapResult = snapToRoutePolyline(rawCoords, currentPolyline, 35);
        const finalCoords = snapResult.point;

        setAmbulanceLocation(finalCoords);

        // If road bearing is available from snapping, use it; otherwise use GPS heading
        const currentBearing = snapResult.roadBearing !== undefined
          ? snapResult.roadBearing
          : (position.coords.heading && position.coords.heading >= 0 ? position.coords.heading : undefined);

        if (currentBearing !== undefined) {
          setAmbulanceHeading(currentBearing);
        }

        // If navigation mode is active, smoothly follow ambulance with camera
        if (isNavigatingRef.current) {
          mapRef.current?.animateCamera({
            center: finalCoords,
            pitch: 45,
            heading: currentBearing ?? ambulanceHeading,
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

      const onLocationError = (error: any) => {
        console.warn('EnRoute Geolocation error:', error?.code, error?.message);
        Geolocation.getCurrentPosition(
          onLocationSuccess,
          (err2) => {
            console.warn('Fallback low-accuracy location error:', err2?.message);
          },
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
        );
      };

      // 1. Fetch initial route immediately with current ambulance position (so screen loads instantly!)
      updateHospitalRoute(ambulanceLocation);

      // 2. Get quick GPS fix
      Geolocation.getCurrentPosition(
        onLocationSuccess,
        onLocationError,
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000,
        }
      );

      // 3. Real-time watchPosition for continuous tracking
      watchId = Geolocation.watchPosition(
        onLocationSuccess,
        (watchErr) => {
          console.warn('EnRoute Geolocation watchPosition error:', watchErr?.message);
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
    const coordsToFit = activeCoordinates.length > 0
      ? activeCoordinates
      : [ambulanceLocation, hospitalLocation];

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

  const handleCall = () => {
    console.log('Call hospital');
  };

  const handleReachedHospital = () => {
    stopBackgroundLocationTracking();
    navigation.navigate('OnTrip' as never);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* HEADER */}
      <Header backEnabled onLeftPress={handleBack} title="En-Route To Hospital" />

      {/* MAP AREA */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          mapType={mapType}
          showsUserLocation={false}
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

          {/* Ambulance Live Location */}
          <AmbulanceMarker
            coordinate={ambulanceLocation}
            title="Ambulance (In Transit)"
            description="Heading to Civil Hospital Sangli"
            heading={ambulanceHeading}
          />

          {/* Hospital Destination Marker */}
          <LocationMarker
            coordinate={hospitalLocation}
            type="hospital"
            title="Civil Hospital Sangli"
            description="Govt. Medical College & Hospital, Sangli"
            label="Civil Hospital"
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
                family="fontawesome"
                name="hospital"
                size={18}
                color={colors.primary}
              />
            </View>

            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>
                Secure Hospital
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
                  45, Hospital Road, Bengaluru
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

      {/* ACTION BUTTONS (START NAVIGATION & REACHED HOSPITAL) */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomButtonsRow}>
          <Button
            title={isNavigating ? "Navigating..." : "Start Navigation"}
            onPress={() => {
              const nextState = !isNavigating;
              setIsNavigating(nextState);
              if (nextState) {
                mapRef.current?.animateCamera({
                  center: ambulanceLocation,
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
              Calculating fastest road to Civil Hospital...
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