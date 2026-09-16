import React from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, typography, shadows } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';

const PickupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  // =====================================================
  // START TRIP
  // =====================================================

  const handleStartTrip = () => {
    Keyboard.dismiss();

    // Forward dynamic trip parameters to EnRoute
    (navigation.navigate as any)('EnRoute', {
      requestId: route?.params?.requestId,
      driverId: route?.params?.driverId,
      patientName: route?.params?.patientName,
      contactNo: route?.params?.contactNo,
      address: route?.params?.address,
      pickupLocation: route?.params?.pickupLocation,
      destination: route?.params?.destination,
      emergencyType: route?.params?.emergencyType,
    });
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        backEnabled
        title="Pickup Patient"
        showRightIcon={false}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <View style={styles.content}>

        {/* =====================================================
            INFORMATION CARD
        ===================================================== */}

        <View style={styles.infoCard}>

          {/* PATIENT NAME */}

          <View style={styles.patientSection}>

            <View style={styles.patientRow}>

              <View style={styles.patientIconCircle}>
                <AppIcon
                  family="ionicons"
                  name="person-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.label}>
                  PATIENT NAME
                </Text>

                {/* Static name commented: John Doe */}
                <Text style={styles.patientName}>
                  {route?.params?.patientName || 'Emergency Patient'}
                </Text>
              </View>

            </View>

          </View>

          <View style={styles.divider} />

          {/* NOTES */}

          <View style={styles.notesSection}>

            <View style={styles.notesLabelRow}>
              <AppIcon
                family="material"
                name="note-text-outline"
                size={13}
                color={colors.textLight}
              />

              <Text style={styles.label}>
                NOTES FROM PATIENT
              </Text>
            </View>

            <Text style={styles.notes}>
              Main gate near reception.
            </Text>

          </View>

        </View>

        {/* =====================================================
            START TRIP
        ===================================================== */}

        <Button
          title="Start Trip"
          onPress={handleStartTrip}
          icon="arrow-right"
          variant="primary"
          style={styles.startButton}
        />

      </View>
    </SafeAreaView>
  );
};

export default PickupScreen;

const styles = StyleSheet.create({
  // =====================================================
  // SCREEN
  // =====================================================

  container: {
    flex: 1,
     backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // =====================================================
  // CARD
  // =====================================================

  infoCard: {
    backgroundColor: colors.surface,

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 4,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  // =====================================================
  // PATIENT
  // =====================================================

  patientSection: {
    paddingVertical: 8,
  },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  patientIconCircle: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: colors.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textLight,

    marginBottom: 4,
  },

  patientName: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },

  // =====================================================
  // OTP
  // =====================================================

  otpSection: {
    paddingVertical: 12,
  },

  otpHint: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,

    marginBottom: 8,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  otpInput: {
    width: 52,
    height: 56,

    borderRadius: 12,

    backgroundColor: colors.background,

    borderWidth: 1.5,
    borderColor: colors.border,

    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.lg,

    color: colors.textPrimary,
  },

  otpInputFilled: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  // =====================================================
  // NOTES
  // =====================================================

  notesSection: {
    paddingVertical: 8,
  },

  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    marginBottom: 4,
  },

  notes: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,

    lineHeight: 18,
  },

  // =====================================================
  // START TRIP
  // =====================================================

  startButton: {
    height: 54,

    marginTop: 16,

    borderRadius: 14,
  },
});