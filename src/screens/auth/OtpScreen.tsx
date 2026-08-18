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

const OtpScreen = () => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef<TextInput>(null);

  const OTP_LENGTH = 4;

  const handleOtpChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');

    const newOtp = numbersOnly.slice(0, OTP_LENGTH);

    setOtp(newOtp);

    // Automatically verify when 4 digits are entered
    if (newOtp.length === OTP_LENGTH) {
      Keyboard.dismiss();

      console.log('OTP:', newOtp);

      // Verify OTP API here
    }
  };

  const handleResendOTP = () => {
    console.log('Resend OTP');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.content}>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              Keyboard.dismiss();
              console.log('Go Back');
            }}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          {/* Main Content */}
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

            {/* OTP Input Area */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.otpInputWrapper}
              onPress={() =>
                inputRef.current?.focus()
              }
            >
              {/* Actual TextInput */}
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={
                  handleOtpChange
                }
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={styles.hiddenInput}
                autoFocus
                caretHidden
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />

              {/* OTP Boxes */}
              <View
                style={
                  styles.otpContainer
                }
              >
                {Array.from({
                  length: OTP_LENGTH,
                }).map((_, index) => {
                  const digit =
                    otp[index];

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
                      <Text
                        style={
                          styles.otpText
                        }
                      >
                        {digit || ''}
                      </Text>

                      {/* Cursor */}
                      {isActive &&
                        otp.length <
                        OTP_LENGTH && (
                          <View
                            style={
                              styles.cursor
                            }
                          />
                        )}
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?
              </Text>

              <TouchableOpacity
                onPress={
                  handleResendOTP
                }
                activeOpacity={0.7}
              >
                <Text
                  style={
                    styles.resendLink
                  }
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Change Number */}
            <TouchableOpacity
              style={styles.changeNumberButton}
              activeOpacity={0.7}
              onPress={() => {
                console.log(
                  'Change phone number',
                );
              }}
            >
              <Text
                style={
                  styles.changeNumberText
                }
              >
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /* =========================
     Back
  ========================== */

  backButton: {
    width: 44,
    height: 44,

    marginTop: 4,

    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backIcon: {
    fontSize: 38,
    lineHeight: 38,
    color: '#1E293B',
    fontWeight: '300',
  },

  /* =========================
     Main Content
  ========================== */

  mainContent: {
    paddingTop: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',

    letterSpacing: -0.5,

    marginBottom: 8,

    fontFamily: 'GoogleSans-Regular',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',

    lineHeight: 21,

    fontWeight: '500',

    fontFamily: 'GoogleSans-Regular',
  },

  phoneNumber: {
    fontSize: 14,
    color: '#1E293B',

    fontWeight: '700',

    marginTop: 2,

    fontFamily: 'GoogleSans-Regular',
  },

  /* =========================
     OTP
  ========================== */

  otpInputWrapper: {
    marginTop: 24,
    width: '100%',
  },

  /*
   * The actual TextInput is invisible.
   * It only receives the native numeric keyboard.
   */
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

    paddingHorizontal: 8,
  },

  otpBox: {
    width: 58,
    height: 58,

    borderRadius: 10,

    borderWidth: 1.5,
    borderColor: '#E2E8F0',

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,

    elevation: 1,
  },

  otpBoxActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },

  otpBoxFilled: {
    borderColor: '#CBD5E1',
  },

  otpText: {
    fontSize: 22,
    fontWeight: '700',

    color: '#1E293B',

    fontFamily: 'sans-serif',
  },

  cursor: {
    position: 'absolute',

    width: 2,
    height: 25,

    backgroundColor: '#2563EB',
  },

  /* =========================
     Resend
  ========================== */

  resendContainer: {
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 24,
  },

  resendText: {
    fontSize: 13,

    color: '#64748B',

    fontWeight: '500',

    fontFamily: 'GoogleSans-Regular',
  },

  resendLink: {
    fontSize: 13,

    color: '#2563EB',

    fontWeight: '700',

    marginLeft: 5,

    fontFamily: 'GoogleSans-Regular',
  },

  /* =========================
     Change Number
  ========================== */

  changeNumberButton: {
    alignSelf: 'center',

    marginTop: 20,

    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  changeNumberText: {
    fontSize: 13,

    color: '#64748B',

    fontWeight: '600',

    fontFamily: 'GoogleSans-Regular',
  },
});