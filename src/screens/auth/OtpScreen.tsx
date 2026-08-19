import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Button from '../../components/Button/Button';
import {
  colors,
  dimensions,
  shadows,
  spacing,
  typography,
} from '../../theme';

const OtpScreen = () => {
  const navigation = useNavigation<any>();

  const [otp, setOtp] = useState('');
  const inputRef = useRef<TextInput>(null);

  const OTP_LENGTH = 4;

  // =========================
  // OTP CHANGE
  // =========================

  const handleOtpChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    const newOtp = numbersOnly.slice(0, OTP_LENGTH);

    setOtp(newOtp);
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerifyOTP = () => {
    Keyboard.dismiss();

    if (otp.length !== OTP_LENGTH) {
      console.log('Please enter complete OTP');
      return;
    }

    console.log('OTP:', otp);

    // Demo OTP
    if (otp === '1234') {
      navigation.replace('MainTabs');
    } else {
      console.log('Invalid OTP');
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResendOTP = () => {
    console.log('Resend OTP');
  };

  // =========================
  // UI
  // =========================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>

          {/* =========================
              Back Button
          ========================== */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              Keyboard.dismiss();
              navigation.goBack();
            }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* =========================
              Main Content
          ========================== */}

          <View style={styles.mainContent}>

            <Text style={styles.title}>
              Enter OTP
            </Text>

            <Text style={styles.subtitle}>
              We have sent a 4-digit OTP to
            </Text>

            <Text style={styles.phoneNumber}>
              +91 98765 43210
            </Text>

            {/* =========================
                OTP Input
            ========================== */}

            <TouchableOpacity
              activeOpacity={1}
              style={styles.otpInputWrapper}
              onPress={() => inputRef.current?.focus()}
            >
              {/* Hidden Native Input */}

              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={styles.hiddenInput}
                autoFocus
                caretHidden
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />

              {/* OTP Boxes */}

              <View style={styles.otpContainer}>
                {Array.from({ length: OTP_LENGTH }).map(
                  (_, index) => {
                    const digit = otp[index];

                    const isActive =
                      index === otp.length;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          isActive &&
                          styles.otpBoxActive,
                          digit &&
                          styles.otpBoxFilled,
                        ]}
                      >
                        <Text style={styles.otpText}>
                          {digit || ''}
                        </Text>

                        {/* Cursor */}

                        {isActive &&
                          otp.length <
                          OTP_LENGTH && (
                            <View
                              style={styles.cursor}
                            />
                          )}
                      </View>
                    );
                  },
                )}
              </View>
            </TouchableOpacity>

            {/* =========================
                Verify Button
            ========================== */}

            <Button
              title="Verify OTP"
              onPress={handleVerifyOTP}
              disabled={otp.length !== OTP_LENGTH}
              style={styles.verifyButton}
            />

            {/* =========================
                Resend OTP
            ========================== */}

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?
              </Text>

              <TouchableOpacity
                onPress={handleResendOTP}
                activeOpacity={0.7}
              >
                <Text style={styles.resendLink}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* =========================
                Change Number
            ========================== */}

            <TouchableOpacity
              style={styles.changeNumberButton}
              activeOpacity={0.7}
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
            >
              <Text style={styles.changeNumberText}>
                Change phone number
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  // =====================================================
  // CONTAINER
  // =====================================================

  container: {
    flex: 1,
     backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // =====================================================
  // BACK BUTTON
  // =====================================================

  backButton: {
    width: dimensions.buttonHeight,
    height: dimensions.buttonHeight,

    marginTop: spacing.xs,

    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backIcon: {
    fontSize: 38,
    lineHeight: 38,
    color: colors.textPrimary,
    fontWeight: '300',
  },

  // =====================================================
  // MAIN CONTENT
  // =====================================================

  mainContent: {
    paddingTop: spacing.lg,
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,

    letterSpacing: -0.5,

    marginBottom: spacing.sm,

    fontFamily: 'GoogleSans-Regular',
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,

    lineHeight: 21,

    fontWeight: '500',

    fontFamily: 'GoogleSans-Regular',
  },

  phoneNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,

    fontWeight: '700',

    marginTop: spacing.xs,

    fontFamily: 'GoogleSans-Regular',
  },

  // =====================================================
  // OTP
  // =====================================================

  otpInputWrapper: {
    marginTop: spacing.lg,

    width: '100%',
  },

  hiddenInput: {
    position: 'absolute',

    width: 1,
    height: 1,

    opacity: 0,

    color: 'transparent',
    backgroundColor: 'transparent',
  },

  otpContainer: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingHorizontal: spacing.xs,
  },

  otpBox: {
    width: 58,
    height: 58,

    borderRadius: 10,

    borderWidth: 1.5,
    borderColor: colors.border,

     backgroundColor: colors.background,

    justifyContent: 'center',
    alignItems: 'center',

    ...shadows.card,
  },

  otpBoxActive: {
    borderColor: '#315EFF',
    borderWidth: 2,
  },

  otpBoxFilled: {
    borderColor: colors.border,
  },

  otpText: {
    fontSize: typography.fontSize.xl,

    fontWeight: '700',

    color: colors.textPrimary,

    fontFamily: 'GoogleSans-Regular',
  },

  cursor: {
    position: 'absolute',

    width: 2,
    height: 25,

    backgroundColor: '#315EFF',
  },

  // =====================================================
  // VERIFY BUTTON
  // =====================================================

  verifyButton: {
    marginTop: spacing.lg,
  },

  // =====================================================
  // RESEND
  // =====================================================

  resendContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: spacing.lg,
  },

  resendText: {
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,

    fontWeight: '500',

    fontFamily: 'GoogleSans-Regular',
  },

  resendLink: {
    fontSize: typography.fontSize.xs,

    color: '#315EFF',

    fontWeight: '700',

    marginLeft: spacing.xs,

    fontFamily: 'GoogleSans-Regular',
  },

  // =====================================================
  // CHANGE NUMBER
  // =====================================================

  changeNumberButton: {
    alignSelf: 'center',

    marginTop: spacing.md,

    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  changeNumberText: {
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,

    fontWeight: '600',

    fontFamily: 'GoogleSans-Regular',
  },
});