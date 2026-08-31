import React, { useRef, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
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

import { colors, typography, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';
import {
    AmbulanceMarker,
    LocationMarker,
} from '../../../components/Map';
import { getDrivingRoutesWithAlternatives, RouteResult } from '../../../services/directionsService';

const NavigationToPickup = () => {
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);
    const hasInitialFit = useRef(false);

    const [distanceText, setDistanceText] = useState('Calculating...');
    const [etaText, setEtaText] = useState('Finding nearest route...');
    const [mapType, setMapType] = useState<MapType>('standard');
    const [primaryRouteInfo, setPrimaryRouteInfo] = useState<RouteResult | null>(null);
    const [altRouteInfo, setAltRouteInfo] = useState<RouteResult | null>(null);
    const [activeCoordinates, setActiveCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [alternativeCoordinates, setAlternativeCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [selectedRouteType, setSelectedRouteType] = useState<'nearest' | 'alternative'>('nearest');

    // =====================================================
    // SANGLI CITY LOCATION DATA (Current Location -> Nearest Hospital)
    // =====================================================

    // Sangli City Center (ST Stand / Ganapati Mandir Rd)
    const driverLocation = {
        latitude: 16.8524,
        longitude: 74.5815,
    };

    // Nearest Government Hospital: Government Medical College & Hospital (Civil Hospital), Sangli
    const pickupLocation = {
        latitude: 16.8543,
        longitude: 74.5772,
    };

    // Fallback road polyline if offline/loading
    const fallbackRoute = [
        { latitude: 16.8524, longitude: 74.5815 },
        { latitude: 16.8535, longitude: 74.5795 },
        { latitude: 16.8543, longitude: 74.5772 },
    ];

    const initialRegion: Region = {
        latitude: (driverLocation.latitude + pickupLocation.latitude) / 2,
        longitude: (driverLocation.longitude + pickupLocation.longitude) / 2,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    };

    const currentRegionRef = useRef<Region>(initialRegion);

    // Fetch the 2 NEAREST possible roads dynamically from Google Directions API
    useEffect(() => {
        let isMounted = true;
        const fetchRoute = async () => {
            const routes = await getDrivingRoutesWithAlternatives(driverLocation, pickupLocation);
            if (!isMounted) return;

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
                // Fallback to coordinates
                setActiveCoordinates(fallbackRoute);
                if (!hasInitialFit.current) {
                    hasInitialFit.current = true;
                    mapRef.current?.fitToCoordinates([driverLocation, pickupLocation], {
                        edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
                        animated: true,
                    });
                }
            }
        };

        fetchRoute();
        return () => {
            isMounted = false;
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
            : [driverLocation, pickupLocation];

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

    const handleCall = () => {
        console.log('Call patient');
    };

    const handleArrived = () => {
        navigation.navigate('Pickup' as never);
    };

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
                    {/* Alternative Road Polyline (grey/dashed or secondary when inactive) */}
                    {alternativeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={alternativeCoordinates}
                            strokeColor={selectedRouteType === 'alternative' ? colors.primary : '#94A3B8'}
                            strokeWidth={selectedRouteType === 'alternative' ? 6 : 4}
                            lineDashPattern={selectedRouteType === 'alternative' ? undefined : [8, 6]}
                            lineCap="round"
                            lineJoin="round"
                            tappable={true}
                            onPress={() => selectRoute('alternative')}
                        />
                    )}

                    {/* Nearest / Primary Road Polyline (active primary color) */}
                    {activeCoordinates.length > 0 ? (
                        <Polyline
                            coordinates={activeCoordinates}
                            strokeColor={selectedRouteType === 'nearest' ? colors.primary : '#94A3B8'}
                            strokeWidth={selectedRouteType === 'nearest' ? 6 : 4}
                            lineDashPattern={selectedRouteType === 'nearest' ? undefined : [8, 6]}
                            lineCap="round"
                            lineJoin="round"
                            tappable={true}
                            onPress={() => selectRoute('nearest')}
                        />
                    ) : (
                        <Polyline
                            coordinates={fallbackRoute}
                            strokeColor={colors.primary}
                            strokeWidth={5}
                            lineCap="round"
                            lineJoin="round"
                        />
                    )}

                    {/* Driver Vehicle Marker */}
                    <AmbulanceMarker
                        coordinate={driverLocation}
                        title="Ambulance"
                        description="Your current location"
                        heading={45}
                    />

                    {/* Pickup / Hospital Destination Marker */}
                    <LocationMarker
                        coordinate={pickupLocation}
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

                        <View>
                            <Text style={styles.distanceText}>
                                {distanceText}
                            </Text>

                            <Text style={styles.etaText}>
                                {etaText}
                            </Text>
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

                {/* PATIENT CARD */}
                <View style={styles.patientCardShadowWrap}>
                    <View style={styles.patientCard}>
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
                                John Doe
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
                                    123, MG Road, Bengaluru
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

            {/* ARRIVED BUTTON */}
            <View style={styles.bottomContainer}>
                <Button
                    title="Arrived at Location"
                    onPress={handleArrived}
                    icon="map-marker-check"
                    variant="primary"
                    style={styles.arrivedButton}
                />
            </View>
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

    // DISTANCE CARD
    distanceCard: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        minWidth: 140,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.sm,
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

    routePillsRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: spacing.xs + 2,
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
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },

    routePillText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        color: colors.textSecondary,
    },

    routePillTextActive: {
        color: colors.primary,
        fontFamily: 'GoogleSans-Bold',
    },

    distanceIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
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
        top: spacing.md,
        right: spacing.md,
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

    // PATIENT CARD
    patientCardShadowWrap: {
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
        bottom: spacing.md,
        borderRadius: 18,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
        zIndex: 5,
    },

    patientCard: {
        minHeight: 72,
        paddingHorizontal: spacing.sm,
        borderRadius: 18,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },

    patientIcon: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },

    patientInfo: {
        flex: 1,
        paddingRight: spacing.xs,
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },

    arrivedButton: {
        height: 54,
        borderRadius: 14,
    },
});