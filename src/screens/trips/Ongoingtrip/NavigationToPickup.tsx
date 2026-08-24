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
import { MapViewRoute } from 'react-native-maps-routes';
import { useNavigation } from '@react-navigation/native';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';
import {
    AmbulanceMarker,
    LocationMarker,
    GOOGLE_MAPS_API_KEY,
} from '../../../components/Map';

const NavigationToPickup = () => {
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);
    const hasInitialFit = useRef(false);

    const [distanceText, setDistanceText] = useState('2.5 km');
    const [etaText, setEtaText] = useState('8 min away');
    const [routeReady, setRouteReady] = useState(false);
    const [mapType, setMapType] = useState<MapType>('standard');
    const [activeCoordinates, setActiveCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);

    // =====================================================
    // SAMPLE LOCATION DATA (Driver -> Patient Pickup)
    // =====================================================

    const driverLocation = {
        latitude: 12.9585,
        longitude: 77.5805,
    };

    const pickupLocation = {
        latitude: 12.9716,
        longitude: 77.5946,
    };

    // Fallback road polyline if offline/loading
    const fallbackRoute = [
        { latitude: 12.9585, longitude: 77.5805 },
        { latitude: 12.9610, longitude: 77.5835 },
        { latitude: 12.9640, longitude: 77.5855 },
        { latitude: 12.9665, longitude: 77.5885 },
        { latitude: 12.9690, longitude: 77.5910 },
        { latitude: 12.9716, longitude: 77.5946 },
    ];

    const initialRegion: Region = {
        latitude: (driverLocation.latitude + pickupLocation.latitude) / 2,
        longitude: (driverLocation.longitude + pickupLocation.longitude) / 2,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    };

    const currentRegionRef = useRef<Region>(initialRegion);

    // Initial mount: fit route only once
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!hasInitialFit.current) {
                hasInitialFit.current = true;
                mapRef.current?.fitToCoordinates(
                    [driverLocation, pickupLocation],
                    {
                        edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
                        animated: true,
                    }
                );
            }
        }, 600);

        return () => clearTimeout(timer);
    }, []);

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
                    {/* Live Google Routes navigation */}
                    <MapViewRoute
                        origin={driverLocation}
                        destination={pickupLocation}
                        apiKey={GOOGLE_MAPS_API_KEY}
                        strokeColor={colors.primary}
                        strokeWidth={6}
                        lineJoin="round"
                        lineCap="round"
                        enableDistance={true}
                        enableEstimatedTime={true}
                        onDistance={(distMeters) => {
                            const km = (distMeters / 1000).toFixed(1);
                            setDistanceText(`${km} km`);
                        }}
                        onEstimatedTime={(seconds) => {
                            const mins = Math.max(1, Math.round(seconds / 60));
                            setEtaText(`${mins} min away`);
                        }}
                        onReady={(coords) => {
                            setRouteReady(true);
                            setActiveCoordinates(coords);
                            if (!hasInitialFit.current) {
                                hasInitialFit.current = true;
                                mapRef.current?.fitToCoordinates(coords, {
                                    edgePadding: { top: 90, right: 60, bottom: 140, left: 60 },
                                    animated: true,
                                });
                            }
                        }}
                        onError={(error) => {
                            console.log('Google Routes error, using fallback route:', error?.message);
                        }}
                    />

                    {/* Fallback solid route until Google Routes renders */}
                    {!routeReady && (
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

                    {/* Pickup Destination Marker */}
                    <LocationMarker
                        coordinate={pickupLocation}
                        type="pickup"
                        title="John Doe"
                        description="123, MG Road, Bengaluru"
                        label="Patient Pickup"
                    />
                </MapView>

                {/* DISTANCE / ETA CARD */}
                <View style={styles.distanceCard}>
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
        minWidth: 118,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        zIndex: 5,
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