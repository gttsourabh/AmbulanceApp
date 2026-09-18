
import React, { useEffect, useState, useRef } from 'react';

import {
  Alert,
  Animated,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../../../components/Header/Header';
import { colors, typography } from '../../../theme';
import { AppIcon } from '../../../icons';
import Button from '../../../components/Button/Button';
import { EmergencyTripData } from '../../../utils/emergencyNotificationHandler';
import { storage } from '../../../storage/storage';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import { respondToEmergencyRequest } from '../../../api';
import Geolocation from '@react-native-community/geolocation';

const IncomingRequestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [emergencyData, setEmergencyData] = useState<EmergencyTripData | null>(
    route?.params?.requestData || null
  );
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<'accept' | 'reject' | null>(null);

  // Circular Emergency Alert overlay state (default true for fresh alerts)
  const [showCircularAlert, setShowCircularAlert] = useState<boolean>(
    route?.params?.showCircularAlert ?? true
  );

  // Pulsing radar animations for circular emergency alert
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimSecondary = useRef(new Animated.Value(1)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.7)).current;
  const alertFadeAnim = useRef(new Animated.Value(1)).current;
  const alertScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showCircularAlert) {
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.22,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnimSecondary, {
              toValue: 1.42,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimSecondary, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.2,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.7,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    }
  }, [showCircularAlert]);

  const handleViewRequest = () => {
    Animated.parallel([
      Animated.timing(alertFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(alertScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCircularAlert(false);
    });
  };

  const handleDismissAlert = () => {
    navigation.goBack();
  };

  // Pre-fetch driver's current GPS location so NavigationToPickup has real location immediately
  useEffect(() => {
    Geolocation.getCurrentPosition(
      pos => {
        setDriverLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    );
  }, []);

  // If requestData wasn't in route params, restore from storage fallback
  useEffect(() => {
    if (!emergencyData) {
      storage.get<EmergencyTripData>(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST).then(savedData => {
        if (savedData) {
          setEmergencyData(savedData);
        }
      });
    }
  }, [emergencyData]);

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async () => {
    if (isSubmitting) return;
    const requestId = Number(emergencyData?.requestId);
    if (!requestId) {
      Alert.alert('Invalid Request', 'No valid emergency request ID found.');
      return;
    }

    setIsSubmitting('reject');
    try {
      console.log(`📡 [EMERGENCY RESPONSE] Sending reject for request_id: ${requestId}`);
      const response = await respondToEmergencyRequest({
        action: 'reject',
        request_id: requestId,
      });

      console.log('✅ [REJECT RESPONSE SUCCESS]:', response?.data);

      if (response?.data && response.data.success === false) {
        Alert.alert(
          'Failed to Reject',
          response.data.message || 'Unable to reject request.'
        );
        return;
      }

      await storage.remove(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST);
      navigation.goBack();
    } catch (err: any) {
      console.warn('⚠️ Failed to send reject response to server:', err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to reject ambulance request. Please try again.';
      Alert.alert('Error', serverMessage);
    } finally {
      setIsSubmitting(null);
    }
  };

  // =====================================================
  // ACCEPT
  // =====================================================

  const handleAccept = async () => {
    if (isSubmitting) return;
    const requestId = Number(emergencyData?.requestId);
    if (!requestId) {
      Alert.alert('Invalid Request', 'No valid emergency request ID found to accept.');
      return;
    }

    setIsSubmitting('accept');
    try {
      console.log(`📡 [EMERGENCY RESPONSE] Sending accept for request_id: ${requestId}`);
      const response = await respondToEmergencyRequest({
        action: 'accept',
        request_id: requestId,
      });

      console.log('✅ [ACCEPT RESPONSE SUCCESS]:', response?.data);

      if (response?.data && response.data.success === false) {
        Alert.alert(
          'Failed to Accept',
          response.data.message || 'Unable to accept request.'
        );
        return;
      }

      // ONLY navigate to next page if backend succeeds!
      await storage.remove(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST);

      // Dynamic navigation parameters
      (navigation.navigate as any)('NavigationToPickup', {
        driverLocation: driverLocation,
        driver_lat: driverLocation?.latitude,
        driver_lng: driverLocation?.longitude,
        pickupLocation: {
          latitude: emergencyData?.latitude || 0,
          longitude: emergencyData?.longitude || 0,
        },
        patientName: emergencyData?.patientName || 'Emergency Patient',
        contactNo: emergencyData?.contactNo || '',
        address: emergencyData?.address || 'Pickup Location',
        requestId: requestId,
        emergencyType: emergencyData?.emergencyType || 'Emergency',
        destination: emergencyData?.destination || 'Nearest Emergency Hospital',
        estimatedEarnings: emergencyData?.estimatedEarnings ? String(emergencyData.estimatedEarnings) : '',
      });
    } catch (err: any) {
      console.warn('⚠️ Failed to send accept response to server:', err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to accept ambulance request. Please try again.';
      Alert.alert('Error', serverMessage);
    } finally {
      setIsSubmitting(null);
    }
  };

  // =====================================================
  // CALL
  // =====================================================

  const handleCall = () => {
    const phone = emergencyData?.contactNo;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Notice', 'No contact number provided for this patient.');
    }
  };

  // =====================================================
  // SCREEN
  // =====================================================

  if (!emergencyData) {
    return (
      <View style={styles.overlay}>
        <View style={styles.requestCardShadowWrap}>
          <View style={[styles.requestCard, { paddingVertical: 32, alignItems: 'center' }]}>
            <AppIcon
              family="material"
              name="alert-circle-outline"
              size={44}
              color={colors.textLight}
            />
            <Text style={[styles.value, { marginTop: 12, textAlign: 'center' }]}>
              No Active Request
            </Text>
            <Text style={[styles.secondaryValue, { textAlign: 'center', marginTop: 4, marginBottom: 18 }]}>
              Emergency requests will appear here automatically when dispatched via notification.
            </Text>
            <Button
              title="Close"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={{ width: 130, height: 44 }}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      {/* =====================================================
          CIRCULAR EMERGENCY ALERT (DISMISSIBLE TO REVEAL MAIN CARD)
      ===================================================== */}
      {showCircularAlert && (
        <Animated.View
          style={[
            styles.circularAlertOverlay,
            {
              opacity: alertFadeAnim,
            },
          ]}
        >
          <View style={styles.circularBackdropTouch}>
            {/* Outer Pulsing Halo Ring 2 */}
            <Animated.View
              style={[
                styles.pulseRingSecondary,
                {
                  transform: [{ scale: pulseAnimSecondary }],
                  opacity: pulseOpacityAnim,
                },
              ]}
            />

            {/* Outer Pulsing Halo Ring 1 */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacityAnim,
                },
              ]}
            />

            {/* Main Circular Emergency Alert Disc */}
            <Animated.View
              style={[
                styles.circularAlertCard,
                {
                  transform: [{ scale: alertScaleAnim }],
                },
              ]}
            >
              {/* Close / Dismiss Button */}
              <TouchableOpacity
                style={styles.circularCloseBtn}
                onPress={handleDismissAlert}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                activeOpacity={0.7}
              >
                <AppIcon family="material" name="close" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>

              {/* Siren Icon in glowing bubble */}
              <View style={styles.circularIconHub}>
                <AppIcon
                  family="material"
                  name="alarm-light"
                  size={32}
                  color={colors.white}
                />
              </View>

              {/* Emergency Type Badge */}
              <View style={styles.circularAlertBadge}>
                <View style={styles.blinkingDot} />
                <Text style={styles.circularAlertBadgeText}>
                  {emergencyData?.emergencyType
                    ? emergencyData.emergencyType.toUpperCase()
                    : 'EMERGENCY TRIP'}
                </Text>
              </View>

              {/* Patient Name */}
              <Text style={styles.circularPatientName} numberOfLines={1}>
                {emergencyData?.patientName || 'Emergency Patient'}
              </Text>

              {/* Pickup Address Snippet */}
              <Text style={styles.circularAddressText} numberOfLines={1}>
                {emergencyData?.address || 'Pickup location specified'}
              </Text>

              {/* View Request Button */}
              <TouchableOpacity
                style={styles.circularViewBtn}
                onPress={handleViewRequest}
                activeOpacity={0.8}
              >
                <Text style={styles.circularViewBtnText}>View Request</Text>
                <AppIcon
                  family="material"
                  name="arrow-right"
                  size={16}
                  color={colors.white}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* =====================================================
          REQUEST CARD (MAIN MODEL BEHIND CIRCULAR ALERT)
      ===================================================== */}

      <View style={styles.requestCardShadowWrap}>
        <View style={styles.requestCard}>

          {/* PATIENT DETAILS */}

          <View style={styles.section}>
            <View style={styles.labelRowBetween}>
              <Text style={styles.label}>
                PATIENT DETAILS
              </Text>
              {emergencyData?.requestId ? (
                <View style={styles.requestIdBadge}>
                  <Text style={styles.requestIdText}>
                    REQ #{emergencyData.requestId}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.patientRow}>
              <View>
                <Text style={styles.value}>
                  {emergencyData?.patientName || 'Emergency Patient'}
                </Text>
                {emergencyData?.contactNo ? (
                  <Text style={styles.secondaryValue}>
                    {emergencyData.contactNo}
                  </Text>
                ) : null}
              </View>

              {emergencyData?.contactNo ? (
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

          <View style={styles.divider} />

          {/* PICKUP LOCATION */}

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary },
                ]}
              />

              <Text style={styles.label}>
                PICKUP LOCATION
              </Text>
            </View>

            <Text style={styles.value} numberOfLines={2}>
              {emergencyData?.address || 'Pickup location not specified'}
            </Text>

            {emergencyData?.latitude && emergencyData?.longitude ? (
              <Text style={styles.secondaryValue}>
                GPS: {emergencyData.latitude.toFixed(6)}, {emergencyData.longitude.toFixed(6)}
              </Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* DESTINATION */}

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.danger },
                ]}
              />

              <Text style={styles.label}>
                DESTINATION
              </Text>
            </View>

            {/* Dynamic destination */}
            <Text style={styles.value}>
              {emergencyData?.destination || 'Nearest Emergency Hospital'}
            </Text>

            <Text style={styles.secondaryValue}>
              Ready for immediate dispatch
            </Text>
          </View>

          <View style={styles.divider} />

          {/* EMERGENCY TYPE + EARNINGS */}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.label}>
                EMERGENCY TYPE
              </Text>

              <View style={styles.typePill}>
                <AppIcon
                  family="material"
                  name={
                    emergencyData?.emergencyType?.toLowerCase().includes('cardiac')
                      ? 'heart-pulse'
                      : 'medical-bag'
                  }
                  size={13}
                  color={colors.danger}
                />

                <Text style={styles.typeText}>
                  {emergencyData?.emergencyType
                    ? emergencyData.emergencyType.toUpperCase()
                    : 'EMERGENCY'}
                </Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Text style={styles.label}>
                ESTIMATED EARNINGS
              </Text>

              <Text style={styles.earningValue}>
                {emergencyData?.estimatedEarnings ? `₹ ${emergencyData.estimatedEarnings}` : 'Standard Fare'}
              </Text>
            </View>
          </View>

          {/* =====================================================
              ACTION BUTTONS
          ===================================================== */}

          <View style={styles.actionRow}>
            <Button
              title="Reject"
              onPress={handleReject}
              variant="danger"
              style={styles.rejectButton}
              loading={isSubmitting === 'reject'}
              disabled={isSubmitting !== null}
            />

            <Button
              title="Accept"
              onPress={handleAccept}
              icon="check"
              iconSize={17}
              variant="primary"
              style={styles.acceptButton}
              loading={isSubmitting === 'accept'}
              disabled={isSubmitting !== null}
            />
          </View>

        </View>
      </View>
    </View>
  );
};

export default IncomingRequestScreen;

const styles = StyleSheet.create({
  // =====================================================
  // OVERLAY
  // =====================================================

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  },

  // =====================================================
  // REQUEST CARD
  // =====================================================

  requestCardShadowWrap: {
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },

  requestCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },

  // =====================================================
  // SECTION
  // =====================================================

  section: {
    paddingVertical: 4,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  labelRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  requestIdBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },

  requestIdText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.primary,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  label: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textLight,
    marginBottom: 5,
  },

  value: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },

  secondaryValue: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },

  // =====================================================
  // PATIENT
  // =====================================================

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 0,
    gap: 0,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },

  // =====================================================
  // EMERGENCY TYPE + EARNINGS
  // =====================================================

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  metaItem: {
    flex: 1,
  },

  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },

  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.dangerLight,
  },

  typeText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.danger,
  },

  earningValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.lg,
    letterSpacing: 0.2,
    color: colors.successDark,
  },

  // =====================================================
  // ACTIONS
  // =====================================================

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  rejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
  },

  acceptButton: {
    flex: 1.4,
    height: 52,
    borderRadius: 14,
  },

  // =====================================================
  // CIRCULAR ALERT MODAL STYLES
  // =====================================================

  circularAlertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.76)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  circularBackdropTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulseRing: {
    position: 'absolute',
    width: 296,
    height: 296,
    borderRadius: 148,
    borderWidth: 3,
    borderColor: 'rgba(239, 68, 68, 0.55)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },

  pulseRingSecondary: {
    position: 'absolute',
    width: 342,
    height: 342,
    borderRadius: 171,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.26)',
  },

  circularAlertCard: {
    width: 284,
    height: 284,
    borderRadius: 142,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderWidth: 4,
    borderColor: '#FECACA',
    elevation: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },

  circularCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 26,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  circularIconHub: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  circularAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },

  blinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FEF08A',
    marginRight: 6,
  },

  circularAlertBadgeText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 10,
    color: '#FEF08A',
    letterSpacing: 0.8,
  },

  circularPatientName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    maxWidth: 210,
    marginBottom: 2,
  },

  circularAddressText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    maxWidth: 210,
    marginBottom: 12,
  },

  circularViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  circularViewBtnText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 12,
    color: colors.white,
    letterSpacing: 0.3,
  },

});



