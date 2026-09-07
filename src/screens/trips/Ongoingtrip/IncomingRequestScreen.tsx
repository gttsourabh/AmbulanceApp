
import React, { useEffect, useState } from 'react';

import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../../../components/Header/Header';
import { colors, typography, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Button from '../../../components/Button/Button';
import { EmergencyTripData } from '../../../utils/emergencyNotificationHandler';
import { storage } from '../../../storage/storage';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import { respondToEmergencyRequest } from '../../../api';

const IncomingRequestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [emergencyData, setEmergencyData] = useState<EmergencyTripData | null>(
    route?.params?.requestData || null
  );
  const [isSubmitting, setIsSubmitting] = useState<'accept' | 'reject' | null>(null);

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
    setIsSubmitting('reject');
    try {
      const requestId = Number(emergencyData?.requestId) || 38;
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
    setIsSubmitting('accept');
    try {
      const requestId = Number(emergencyData?.requestId) || 38;
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
      (navigation.navigate as any)('NavigationToPickup', {
        pickupLocation: {
          latitude: emergencyData?.latitude || 21.1458,
          longitude: emergencyData?.longitude || 79.088155,
        },
        patientName: emergencyData?.patientName || 'Omkar Bhosale',
        contactNo: emergencyData?.contactNo || '9373962355',
        address: emergencyData?.address || '2496, Baba Farid Nagar, 4783Chitnis NagarNagpur, Sitabuldi, Nagpur, Maharashtra 440001, India',
        requestId: emergencyData?.requestId || 38,
        emergencyType: emergencyData?.emergencyType || 'cardiac',
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
    const phone = emergencyData?.contactNo || '9373962355';
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <View style={styles.overlay}>
      {/* =====================================================
          REQUEST CARD
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
                  {emergencyData?.patientName || 'Omkar Bhosale'}
                </Text>
                {emergencyData?.contactNo ? (
                  <Text style={styles.secondaryValue}>
                    {emergencyData.contactNo}
                  </Text>
                ) : null}
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
              {emergencyData?.address || '2496, Baba Farid Nagar, 4783Chitnis NagarNagpur, Sitabuldi, Nagpur, Maharashtra 440001, India'}
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

            <Text style={styles.value}>
              Nearest Emergency Hospital
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
                    : 'CARDIAC'}
                </Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Text style={styles.label}>
                ESTIMATED EARNINGS
              </Text>

              <Text style={styles.earningValue}>
                ₹ 450
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },

  // =====================================================
  // SECTION
  // =====================================================

  section: {
    paddingVertical: spacing.xs,
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
    marginVertical: spacing.xs,
  },

  // =====================================================
  // EMERGENCY TYPE + EARNINGS
  // =====================================================

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  metaItem: {
    flex: 1,
  },

  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
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
    gap: spacing.sm,
    marginTop: spacing.sm,
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

});



