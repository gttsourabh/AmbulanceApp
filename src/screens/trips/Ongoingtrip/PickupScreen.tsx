import React, { useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';

const PickupScreen = () => {
  const navigation = useNavigation();

  const [otp, setOtp] = useState(['', '', '', '']);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const isOtpComplete = otp.every(digit => digit.length === 1);

  // =====================================================
  // OTP CHANGE
  // =====================================================

  const handleOtpChange = (value: string, index: number) => {
    const number = value.replace(/[^0-9]/g, '');

    const updatedOtp = [...otp];
    updatedOtp[index] = number.slice(-1);

    setOtp(updatedOtp);

    if (number && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (number && index === 3) {
      Keyboard.dismiss();
    }
  };

  // =====================================================
  // OTP BACKSPACE
  // =====================================================

  const handleKeyPress = (
    event: any,
    index: number,
  ) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // =====================================================
  // START TRIP
  // =====================================================

  const handleStartTrip = () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      return;
    }

    Keyboard.dismiss();

    navigation.navigate('EnRoute' as never);
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

                <Text style={styles.patientName}>
                  John Doe
                </Text>
              </View>

            </View>

          </View>

          <View style={styles.divider} />

          {/* OTP */}

          <View style={styles.otpSection}>

            <Text style={styles.label}>
              VERIFY OTP FROM PATIENT
            </Text>

            <Text style={styles.otpHint}>
              Ask the patient for the 4-digit code
            </Text>

            <View style={styles.otpContainer}>

              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={value =>
                    handleOtpChange(value, index)
                  }
                  onKeyPress={event =>
                    handleKeyPress(event, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor={colors.primary}
                  style={[
                    styles.otpInput,
                    digit
                      ? styles.otpInputFilled
                      : null,
                  ]}
                />
              ))}

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
          disabled={!isOtpComplete}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  // =====================================================
  // CARD
  // =====================================================

  infoCard: {
    backgroundColor: colors.surface,

    borderRadius: 18,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,

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
    paddingVertical: spacing.sm,
  },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: spacing.sm,
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
    paddingVertical: spacing.md,
  },

  otpHint: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,

    marginBottom: spacing.sm,
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
    paddingVertical: spacing.sm,
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

    marginTop: spacing.lg,

    borderRadius: 14,
  },
});