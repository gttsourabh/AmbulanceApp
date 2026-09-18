import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* =====================================================
                    SUCCESS HEADER
                ===================================================== */}
                <View style={styles.successHeader}>
                    <View style={styles.successIconRing}>
                        <View style={styles.successIcon}>
                            <AppIcon
                                family="material"
                                name="check-bold"
                                size={28}
                                color={colors.success}
                            />
                        </View>
                    </View>

                    <Text style={styles.successTitle}>Trip Completed</Text>
                    <Text style={styles.successSubtitle}>
                        Patient safely dropped off at hospital
                    </Text>
                </View>

                {/* =====================================================
                    CONTENT CARD
                ===================================================== */}
                <View style={styles.contentCardShadowWrap}>
                    <View style={styles.contentCard}>
                        {/* ROUTE TIMELINE (PICKUP -> DROP) */}
                        <Text style={styles.sectionHeader}>TRIP ROUTE</Text>

                        <View style={styles.routeContainer}>
                            {/* PICKUP ROW */}
                            <View style={styles.routeRow}>
                                <View style={styles.nodeColumn}>
                                    <View style={styles.pickupDot}>
                                        <View style={styles.pickupInnerDot} />
                                    </View>
                                    <View style={styles.connectorLine} />
                                </View>
                                <View style={styles.locationDetails}>
                                    <Text style={styles.locationCategory}>PICKUP LOCATION</Text>
                                    <Text style={styles.locationAddress} numberOfLines={2}>
                                        {pickupAddress}
                                    </Text>
                                </View>
                            </View>

                            {/* DROP ROW */}
                            <View style={styles.routeRow}>
                                <View style={styles.nodeColumn}>
                                    <View style={styles.dropDot}>
                                        <AppIcon
                                            family="material"
                                            name="hospital-building"
                                            size={14}
                                            color={colors.white}
                                        />
                                    </View>
                                </View>
                                <View style={styles.locationDetails}>
                                    <Text style={styles.locationCategory}>DROP LOCATION</Text>
                                    <Text style={styles.locationTitle} numberOfLines={1}>
                                        {hospitalName}
                                    </Text>
                                    <Text style={styles.locationSubAddress} numberOfLines={2}>
                                        {dropAddress}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* TRIP STATS (WHOLE TRIP DISTANCE & PATIENT - NO EARNINGS) */}
                        <Text style={styles.sectionHeader}>TRIP SUMMARY</Text>

                        <View style={styles.statsRow}>
                            {/* WHOLE TRIP DISTANCE STAT */}
                            <View style={styles.statBox}>
                                <View style={styles.statIconWrap}>
                                    <AppIcon
                                        family="material"
                                        name="map-marker-distance"
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text style={styles.statLabel}>WHOLE TRIP DISTANCE</Text>
                                <Text style={styles.statValue}>{tripDistances.totalDistance}</Text>
                            </View>

                            {/* PATIENT STAT */}
                            <View style={styles.statBox}>
                                <View style={[styles.statIconWrap, styles.patientIconWrap]}>
                                    <AppIcon
                                        family="material"
                                        name="account"
                                        size={20}
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

                        {/* WHOLE TRIP DISTANCE BREAKDOWN (PICKUP + HOSPITAL LEGS) */}
                        {tripDistances.npDistance && tripDistances.phDistance && (
                            <View style={styles.breakdownContainer}>
                                <View style={styles.breakdownItem}>
                                    <View style={styles.breakdownDotPickup} />
                                    <Text style={styles.breakdownLabel}>To Pickup:</Text>
                                    <Text style={styles.breakdownValue}>{tripDistances.npDistance}</Text>
                                </View>
                                <View style={styles.breakdownSeparator} />
                                <View style={styles.breakdownItem}>
                                    <View style={styles.breakdownDotHospital} />
                                    <Text style={styles.breakdownLabel}>To Hospital:</Text>
                                    <Text style={styles.breakdownValue}>{tripDistances.phDistance}</Text>
                                </View>
                            </View>
                        )}

                        {/* SAFE HANDOVER VERIFIED BADGE */}
                        <View style={styles.handoverBadge}>
                            <AppIcon
                                family="material"
                                name="shield-check"
                                size={18}
                                color={colors.success}
                            />
                            <Text style={styles.handoverText}>
                                Patient safely handed over to medical staff
                            </Text>
                        </View>

                        {/* DRIVER INFO ROW */}
                        <View style={styles.driverInfoRow}>
                            <View style={styles.driverAvatar}>
                                <AppIcon
                                    family="ionicons"
                                    name="person"
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </View>
                            <View style={styles.driverDetails}>
                                <Text style={styles.driverNameText}>{driverName}</Text>
                                <Text style={styles.driverSubText}>Ambulance Driver</Text>
                            </View>
                            <View style={styles.statusPill}>
                                <Text style={styles.statusPillText}>COMPLETED</Text>
                            </View>
                        </View>

                        {/* COMPLETE BUTTON */}
                        <Button
                            title={isSubmitting ? "Completing..." : "Done - Back to Home"}
                            icon="check"
                            onPress={handleComplete}
                            disabled={isSubmitting}
                            variant="primary"
                            style={styles.completeButton}
                        />
                    </View>
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
        paddingBottom: 24,
    },

    // SUCCESS HEADER
    successHeader: {
        height: 180,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    successIconRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    successIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    successTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.lg,
        letterSpacing: 0.2,
        color: colors.white,
        marginBottom: 2,
    },
    successSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: 'rgba(255,255,255,0.9)',
    },

    // CONTENT CARD
    contentCardShadowWrap: {
        marginHorizontal: 14,
        marginTop: -22,
        borderRadius: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    contentCard: {
        borderRadius: 20,
        backgroundColor: colors.card,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },

    sectionHeader: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        letterSpacing: 0.8,
        color: colors.textSecondary,
        marginBottom: 12,
    },

    // ROUTE CONTAINER
    routeContainer: {
        marginBottom: 4,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    nodeColumn: {
        width: 32,
        alignItems: 'center',
    },
    pickupDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickupInnerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.success,
    },
    connectorLine: {
        width: 2,
        height: 38,
        backgroundColor: colors.divider,
        marginVertical: 4,
    },
    dropDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationDetails: {
        flex: 1,
        marginLeft: 8,
        paddingBottom: 10,
    },
    locationCategory: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 9,
        color: colors.textLight,
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    locationTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        marginBottom: 1,
    },
    locationAddress: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
        color: colors.textPrimary,
        lineHeight: 18,
    },
    locationSubAddress: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        lineHeight: 16,
    },

    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 14,
    },

    // STATS ROW
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    patientIconWrap: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    statLabel: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 9,
        letterSpacing: 0.6,
        color: colors.textLight,
        marginBottom: 2,
    },
    statValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
    },
    emergencyTag: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#FEE2E2',
    },
    emergencyTagText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 8,
        color: colors.danger,
        letterSpacing: 0.4,
    },

    // BREAKDOWN STYLES
    breakdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    breakdownDotPickup: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    breakdownDotHospital: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    breakdownLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        color: colors.textSecondary,
    },
    breakdownValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        color: colors.textPrimary,
    },
    breakdownSeparator: {
        width: 1,
        height: 14,
        backgroundColor: colors.border,
    },

    // HANDOVER BADGE
    handoverBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.25)',
        marginBottom: 14,
    },
    handoverText: {
        flex: 1,
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
        color: colors.success,
    },

    // DRIVER ROW
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },
    driverAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    driverDetails: {
        flex: 1,
    },
    driverNameText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
    },
    driverSubText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    statusPillText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 9,
        color: colors.success,
        letterSpacing: 0.5,
    },

    // COMPLETE BUTTON
    completeButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.success,
    },
});