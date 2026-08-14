import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import MapView, {
//     Marker,
//     Polyline,
//     PROVIDER_GOOGLE,
// } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';

const NavigationToPickup = () => {
    const navigation = useNavigation();

    // =====================================================
    // SAMPLE LOCATION DATA
    // Replace these with API/GPS coordinates later
    // =====================================================

    const driverLocation = {
        latitude: 12.9585,
        longitude: 77.5805,
    };

    const pickupLocation = {
        latitude: 12.9716,
        longitude: 77.5946,
    };

    const routeCoordinates = [
        {
            latitude: 12.9585,
            longitude: 77.5805,
        },
        {
            latitude: 12.9610,
            longitude: 77.5835,
        },
        {
            latitude: 12.9640,
            longitude: 77.5855,
        },
        {
            latitude: 12.9665,
            longitude: 77.5885,
        },
        {
            latitude: 12.9690,
            longitude: 77.5910,
        },
        {
            latitude: 12.9716,
            longitude: 77.5946,
        },
    ];

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCall = () => {
        console.log('Call patient');
    };

    const handleArrived = () => {
        navigation.navigate('Pickup' as never);
    };

    // =====================================================
    // SCREEN
    // =====================================================

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
        >
            {/* =====================================================
          HEADER
      ===================================================== */}

            <Header backEnabled title='Navigation To Pickup' />

            {/* =====================================================
          MAP (static placeholder)
      ===================================================== */}

            <View style={styles.mapContainer}>

                {/* Placeholder map surface until MapView is wired up */}
                <View style={styles.mapPlaceholder}>

                    <View style={styles.mapPlaceholderIconCircle}>
                        <AppIcon
                            family="material"
                            name="map-marker-radius"
                            size={30}
                            color={colors.primary}
                        />
                    </View>

                    <Text style={styles.mapPlaceholderText}>
                        Live route to pickup
                    </Text>

                </View>

                {/* =====================================================
            DISTANCE / ETA CARD
        ===================================================== */}

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
                            2.5 km
                        </Text>

                        <Text style={styles.etaText}>
                            8 min away
                        </Text>
                    </View>

                </View>

                {/* =====================================================
            PATIENT CARD
        ===================================================== */}

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

            {/* =====================================================
          ARRIVED BUTTON
      ===================================================== */}

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
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    // =====================================================
    // MAP
    // =====================================================

    mapContainer: {
        flex: 1,

        position: 'relative',

        overflow: 'hidden',

        backgroundColor: colors.background,
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // =====================================================
    // MAP PLACEHOLDER (no live map wired up yet)
    // =====================================================

    mapPlaceholder: {
        ...StyleSheet.absoluteFillObject,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.background,
    },

    mapPlaceholderIconCircle: {
        width: 68,
        height: 68,

        borderRadius: 34,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: spacing.sm,
    },

    mapPlaceholderText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        letterSpacing: 0.2,
    },

    // =====================================================
    // DISTANCE CARD
    // =====================================================

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

    // =====================================================
    // DRIVER MARKER
    // =====================================================

    driverMarker: {
        width: 28,
        height: 28,

        borderRadius: 14,

        backgroundColor: colors.primary,

        borderWidth: 3,
        borderColor: colors.white,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },

    // =====================================================
    // PATIENT CARD
    // =====================================================

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

    // =====================================================
    // BOTTOM BUTTON
    // =====================================================

    bottomContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,

        backgroundColor: colors.white,

        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.divider,
    },

    arrivedButton: {
        height: 54,
        borderRadius: 14,
    },
});