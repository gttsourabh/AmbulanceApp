import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/hook';

import { colors, typography } from '../../../theme';
import { AppIcon } from '../../../icons';
import Button from '../../../components/Button/Button';
import { updateAmbulanceStatusApi } from '../../../api/driverApi';
import { stopBackgroundLocationTracking } from '../../../services/backgroundLocationService';
import { getDistanceMeters } from '../../../utils/geoUtils';

const TripCompletedScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const user = useAppSelector(state => state.auth.user);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trip details extracted from route params
    const patientName = route?.params?.patientName || 'Emergency Patient';
    const emergencyType = route?.params?.emergencyType || 'Emergency';
    const pickupAddress =
        route?.params?.pickupAddress ||
        route?.params?.patientAddress ||
        route?.params?.address ||
        'Pickup Location';

    const hospitalName =
        route?.params?.hospitalName ||
        route?.params?.destination ||
        'Civil Hospital Sangli';

    const dropAddress =
        route?.params?.dropAddress ||
        route?.params?.hospitalAddress ||
        'Emergency Department, Destination Hospital';

    const driverName = user?.name || 'Ambulance Driver';

    // Whole trip distance calculation & breakdown (NO EARNINGS)
    const tripDistances = useMemo(() => {
        const parseKm = (val: any): number => {
            if (!val) return 0;
            const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? 0 : num;
        };

        let npKm = parseKm(route?.params?.np_distance || route?.params?.npDistance || route?.params?.pickup_distance);
        let phKm = parseKm(route?.params?.ph_distance || route?.params?.phDistance);

        // Fallback calculations using coordinates if available
        if (npKm <= 0 && route?.params?.initialDriverLocation && route?.params?.pickupLocation) {
            npKm = getDistanceMeters(
                {
                    latitude: Number(route.params.initialDriverLocation.latitude),
                    longitude: Number(route.params.initialDriverLocation.longitude),
                },
                {
                    latitude: Number(route.params.pickupLocation.latitude),
                    longitude: Number(route.params.pickupLocation.longitude),
                }
            ) / 1000;
        }

        if (phKm <= 0 && route?.params?.pickupLocation && route?.params?.hospitalLocation) {
            phKm = getDistanceMeters(
                {
                    latitude: Number(route.params.pickupLocation.latitude),
                    longitude: Number(route.params.pickupLocation.longitude),
                },
                {
                    latitude: Number(route.params.hospitalLocation.latitude),
                    longitude: Number(route.params.hospitalLocation.longitude),
                }
            ) / 1000;
        }

        // Whole trip total distance
        let totalKm = parseKm(route?.params?.total_distance || route?.params?.whole_trip_distance);
        if (totalKm <= 0) {
            totalKm = npKm + phKm > 0 ? npKm + phKm : (phKm > 0 ? phKm : parseKm(route?.params?.distance));
        }
        if (totalKm <= 0) {
            totalKm = 4.8;
        }

        return {
            npDistance: npKm > 0 ? `${npKm.toFixed(1)} km` : null,
            phDistance: phKm > 0 ? `${phKm.toFixed(1)} km` : null,
            totalDistance: `${totalKm.toFixed(1)} km`,
        };
    }, [route?.params]);

    const handleComplete = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            stopBackgroundLocationTracking();

            const reqId = Number(route?.params?.requestId || 0);
            if (reqId > 0) {
                console.log(`📡 [TRIP COMPLETED] Updating status to completed: request_id=${reqId}, total_distance=${tripDistances.totalDistance}`);
                await updateAmbulanceStatusApi({
                    request_id: reqId,
                    status: 'completed',
                    total_distance: tripDistances.totalDistance,
                });
            }
        } catch (err: any) {
            console.warn('⚠️ [TRIP COMPLETED] update-status error:', err?.message || err);
        } finally {
            setIsSubmitting(false);
            navigation.navigate('MainTabs' as never);
        }
    };

    // Intercept mobile hardware back button: block returning to en route and redirect to Home
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('MainTabs' as never);
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* =====================================================
                    COMPACT SUCCESS HEADER (App Primary Teal + Brand Colors)
                ===================================================== */}
                <View style={styles.successHeader}>
                    <View style={styles.successIconRing}>
                        <View style={styles.successIcon}>
                            <AppIcon
                                family="material"
                                name="check-bold"
                                size={18}
                                color={colors.primary}
                            />
                        </View>
                    </View>

                    <Text style={styles.successTitle}>Trip Completed</Text>
                    <Text style={styles.successSubtitle}>
                        Patient safely dropped off at destination
                    </Text>
                </View>

                {/* =====================================================
                    COMPACT TRIP CARD
                ===================================================== */}
                <View style={styles.contentCard}>
                    {/* SECTION: TRIP ROUTE */}
                    <Text style={styles.sectionHeader}>TRIP ROUTE</Text>
                    <View style={styles.routeContainer}>
                        {/* Pickup */}
                        <View style={styles.routeRow}>
                            <View style={styles.pickupDot}>
                                <View style={styles.pickupInnerDot} />
                            </View>
                            <View style={styles.locationDetails}>
                                <Text style={styles.locationCategory}>PICKUP</Text>
                                <Text style={styles.locationAddress} numberOfLines={1}>
                                    {pickupAddress}
                                </Text>
                            </View>
                        </View>

                        {/* Connector line */}
                        <View style={styles.connectorLineWrap}>
                            <View style={styles.connectorLine} />
                        </View>

                        {/* Drop / Hospital */}
                        <View style={styles.routeRow}>
                            <View style={styles.dropDot}>
                                <AppIcon
                                    family="material"
                                    name="hospital-building"
                                    size={12}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.locationDetails}>
                                <Text style={styles.locationCategory}>HOSPITAL DROP-OFF</Text>
                                <Text style={styles.locationTitle} numberOfLines={1}>
                                    {hospitalName}
                                </Text>
                                <Text style={styles.locationSubAddress} numberOfLines={1}>
                                    {dropAddress}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* SECTION: TRIP SUMMARY STATS */}
                    <Text style={styles.sectionHeader}>TRIP SUMMARY</Text>
                    <View style={styles.statsRow}>
                        {/* Total Distance */}
                        <View style={styles.statBox}>
                            <View style={styles.statIconWrap}>
                                <AppIcon
                                    family="material"
                                    name="map-marker-distance"
                                    size={16}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.statLabel}>TOTAL DISTANCE</Text>
                            <Text style={styles.statValue}>{tripDistances.totalDistance}</Text>
                            {tripDistances.npDistance && tripDistances.phDistance ? (
                                <Text style={styles.statSubText} numberOfLines={1}>
                                    {tripDistances.npDistance} + {tripDistances.phDistance}
                                </Text>
                            ) : null}
                        </View>

                        {/* Patient */}
                        <View style={styles.statBox}>
                            <View style={[styles.statIconWrap, styles.patientIconWrap]}>
                                <AppIcon
                                    family="material"
                                    name="account"
                                    size={16}
                                    color={colors.danger}
                                />
                            </View>
                            <Text style={styles.statLabel}>PATIENT</Text>
                            <Text style={styles.statValue} numberOfLines={1}>
                                {patientName}
                            </Text>
                            <View style={styles.emergencyTag}>
                                <Text style={styles.emergencyTagText}>
                                    {emergencyType.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* SAFE HANDOVER STRIP */}
                    <View style={styles.handoverBadge}>
                        <AppIcon
                            family="material"
                            name="shield-check"
                            size={16}
                            color={colors.successDark}
                        />
                        <Text style={styles.handoverText} numberOfLines={1}>
                            Handed over safely to hospital staff
                        </Text>
                    </View>

                    {/* DRIVER INFO ROW */}
                    <View style={styles.driverInfoRow}>
                        <View style={styles.driverAvatar}>
                            <AppIcon
                                family="ionicons"
                                name="person"
                                size={15}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.driverDetails}>
                            <Text style={styles.driverNameText} numberOfLines={1}>{driverName}</Text>
                            <Text style={styles.driverSubText}>Ambulance Driver</Text>
                        </View>
                        <View style={styles.statusPill}>
                            <Text style={styles.statusPillText}>COMPLETED</Text>
                        </View>
                    </View>

                    {/* COMPLETE / RETURN BUTTON */}
                    <Button
                        title={isSubmitting ? "Completing..." : "Done - Back to Home"}
                        icon="check"
                        onPress={handleComplete}
                        disabled={isSubmitting}
                        variant="primary"
                        style={styles.completeButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TripCompletedScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },

    // =====================================================
    // SUCCESS HEADER - Compact Brand Header
    // =====================================================
    successHeader: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    successIconRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    successIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    successTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.white,
        letterSpacing: 0.2,
    },
    successSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.primaryLight,
        marginTop: 2,
    },

    // =====================================================
    // CONTENT CARD - Compact, Single Screen
    // =====================================================
    contentCard: {
        marginHorizontal: 12,
        marginTop: -8,
        borderRadius: 14,
        backgroundColor: colors.card,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 3,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    sectionHeader: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10,
        letterSpacing: 0.6,
        color: colors.textSecondary,
        marginBottom: 6,
    },

    // ROUTE CONTAINER
    routeContainer: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickupDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.successLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickupInnerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.successDark,
    },
    connectorLineWrap: {
        width: 20,
        alignItems: 'center',
        height: 12,
        justifyContent: 'center',
    },
    connectorLine: {
        width: 2,
        height: 12,
        backgroundColor: colors.border,
    },
    dropDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationDetails: {
        flex: 1,
        marginLeft: 8,
    },
    locationCategory: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8.5,
        color: colors.textLight,
        letterSpacing: 0.4,
    },
    locationTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        color: colors.textPrimary,
    },
    locationAddress: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11.5,
        color: colors.textPrimary,
    },
    locationSubAddress: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10.5,
        color: colors.textSecondary,
    },

    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 8,
    },

    // STATS ROW
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
    },
    patientIconWrap: {
        backgroundColor: colors.dangerLight,
    },
    statLabel: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8.5,
        letterSpacing: 0.5,
        color: colors.textSecondary,
        marginBottom: 1,
    },
    statValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        color: colors.textPrimary,
    },
    statSubText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 9,
        color: colors.textSecondary,
        marginTop: 2,
    },
    emergencyTag: {
        marginTop: 3,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        backgroundColor: colors.dangerLight,
    },
    emergencyTagText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8,
        color: colors.danger,
        letterSpacing: 0.3,
    },

    // HANDOVER BADGE
    handoverBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.successLight,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(107, 207, 155, 0.4)',
        marginBottom: 8,
    },
    handoverText: {
        flex: 1,
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10.5,
        color: colors.successDark,
    },

    // DRIVER ROW
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        marginBottom: 10,
    },
    driverAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    driverDetails: {
        flex: 1,
    },
    driverNameText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        color: colors.textPrimary,
    },
    driverSubText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,
        color: colors.textSecondary,
    },
    statusPill: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: colors.successLight,
    },
    statusPillText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8.5,
        color: colors.successDark,
        letterSpacing: 0.4,
    },

    // COMPLETE BUTTON
    completeButton: {
        height: 44,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
});