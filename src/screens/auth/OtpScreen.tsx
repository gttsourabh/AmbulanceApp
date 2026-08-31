import React, { useRef, useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { sendOtpApi, verifyOtpAmbDriverApi, STATIC_CLOUD_ID, UserData, SubscribedChannel } from '../../api/authApi';
import { useAppDispatch } from '../../redux/hook';
import { loginSuccess } from '../../redux/slices/authSlice';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';

import Button from '../../components/Button/Button';
import {
  colors,
  dimensions,
  shadows,
  spacing,
  typography,
} from '../../theme';

const OTP_LENGTH = 6;
const OTP_WINDOW_SECONDS = 600; // 10 minutes window
const RESEND_COOLDOWN_SECONDS = 30; // 30 seconds resend cooldown

const OtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const mobileNumber = route.params?.mobile_number;
  const displayPhoneNumber =
    route.params?.phoneNumber ||
    (mobileNumber ? `+91 ${mobileNumber}` : '+91 98765 43210');

  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(OTP_WINDOW_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const inputRef = useRef<TextInput>(null);

  // =========================
  // 10-MIN WINDOW COUNTDOWN
  // =========================

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isExpired = timer <= 0;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // =========================
  // 30-SEC RESEND COOLDOWN
  // =========================

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const cooldownInterval = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cooldownInterval);
  }, [resendCooldown]);

  // =========================
  // OTP CHANGE
  // =========================

  const handleOtpChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    const newOtp = numbersOnly.slice(0, OTP_LENGTH);

    setOtp(newOtp);

    // Clear error states when user types
    if (hasOtpError || inlineError) {
      setHasOtpError(false);
      setInlineError('');
    }
  };

  // =========================
  // VERIFY OTP (3 SCENARIOS)
  // =========================

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();

    // ── SCENARIO 2 CHECK: 10-Minute Window Expiry ──
    if (isExpired) {
      Alert.alert(
        'OTP Expired',
        'The 10-minute verification window has expired. Please request a new OTP to continue.',
        [
          { text: 'Resend OTP', onPress: handleResendOTP },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }

    if (otp.length !== OTP_LENGTH || verifying) {
      return;
    }

    console.log('Verifying OTP:', {
      mobile_number: mobileNumber,
      otp,
      cloud_id: STATIC_CLOUD_ID,
    });

    try {
      setVerifying(true);
      setInlineError('');
      setHasOtpError(false);

      const response = await verifyOtpAmbDriverApi({
        mobile_number: mobileNumber || '',
        otp,
        cloud_id: STATIC_CLOUD_ID,
      });

      console.log('Verify OTP AmbDriver Success:', response);

      // Successful verification
      if (response && (response.token || response.code === 200 || response.success !== false)) {
        // 1. Extract all important auth fields from backend response
        const token: string = response.token || '';
        const rawUserData = response.UserData || response.user || {};
        const subscribedChannels: SubscribedChannel[] = response.SUBSCRIBED_CHANNELS || [];

        // Extract specific channel topics (e.g. USER_4_CHANNEL, AMBULANCE_DRIVER_CHANNEL)
        const userTopic =
          subscribedChannels.find(c => c.topic_name?.startsWith('USER_'))?.topic_name || null;
        const driverTopic =
          subscribedChannels.find(c => c.topic_name?.includes('DRIVER'))?.topic_name || null;

        // Normalize UserData ensuring mobile_number and phone are present
        const mobileNum =
          rawUserData.mobile_number ||
          rawUserData.phone ||
          mobileNumber ||
          '';

        const userData: UserData = {
          id: rawUserData.id ?? 0,
          role_id: rawUserData.role_id ?? 10,
          name: rawUserData.name || '',
          mobile_number: mobileNum,
          phone: mobileNum,
          ...rawUserData,
        };

        console.log('Driver Authenticated:', {
          token,
          userData,
          subscribedChannels,
          userTopic,
          driverTopic,
        });

        // 2. Store in Redux (token, user profile, subscribed channels, userChannel, driverChannel)
        dispatch(
          loginSuccess({
            token,
            user: userData,
            subscribedChannels,
            userChannel: userTopic,
            driverChannel: driverTopic,
          }),
        );

        // 3. Persist to AsyncStorage for auto-login / session restore
        if (token) {
          await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          await storage.set(STORAGE_KEYS.USER_DATA, userData);
          await storage.set(STORAGE_KEYS.SUBSCRIBED_CHANNELS, subscribedChannels);
          if (userTopic) {
            await storage.set(STORAGE_KEYS.USER_CHANNEL, userTopic);
          }
          if (driverTopic) {
            await storage.set(STORAGE_KEYS.DRIVER_CHANNEL, driverTopic);
          }
        }

        navigation.replace('MainTabs');
      } else {
        const errorMsg =
          response?.msg ||
          response?.message ||
          'Verification failed. Please try again.';
        setHasOtpError(true);
        setInlineError(errorMsg);
        Alert.alert('Verification Failed', errorMsg);
      }
    } catch (error: any) {
      console.error('Verify OTP Error:', error);

      const serverMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        '';
      const statusCode = error?.response?.status;
      const responseCode = error?.response?.data?.code;

      // ── SCENARIO 1: User Not Found / Not Registered ──
      const isUserNotFound =
        statusCode === 404 ||
        (responseCode === 400 && /user not found/i.test(serverMsg)) ||
        /user not found|not registered|not available/i.test(serverMsg);

      // ── SCENARIO 2: 10-Minute Window Expired (from Server) ──
      const isOtpExpiredServer =
        /expired|timeout|time out|validity/i.test(serverMsg);

      if (isUserNotFound) {
        setInlineError('User not found. No driver account registered with this number.');
        Alert.alert(
          'Driver Not Registered',
          `No ambulance driver account was found for +91 ${mobileNumber || ''}. Please verify your phone number or contact support.`,
          [
            {
              text: 'Change Number',
              onPress: () => {
                Keyboard.dismiss();
                navigation.goBack();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      } else if (isOtpExpiredServer) {
        setTimer(0);
        setInlineError('OTP has expired. The 10-minute window has passed.');
        Alert.alert(
          'OTP Expired',
          'The 10-minute OTP verification window has expired. Please request a new OTP.',
          [
            { text: 'Resend OTP', onPress: handleResendOTP },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      } else {
        // ── SCENARIO 3: Wrong / Invalid OTP ──
        setHasOtpError(true);
        const wrongOtpMessage =
          serverMsg || 'Incorrect OTP entered. Please check the code and try again.';
        setInlineError(wrongOtpMessage);
        Alert.alert('Invalid OTP', wrongOtpMessage);
      }
    } finally {
      setVerifying(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResendOTP = async () => {
    if (!mobileNumber) {
      Alert.alert('Notice', 'Mobile number not found. Please go back and enter your phone number.');
      return;
    }

    if (resending) {
      return;
    }

    if (resendCooldown > 0) {
      Alert.alert(
        'Please Wait',
        `You can request a new OTP in ${resendCooldown} second${resendCooldown === 1 ? '' : 's'}.`,
      );
      return;
    }

    try {
      setResending(true);
      setInlineError('');
      setHasOtpError(false);

      const response = await sendOtpApi({ mobile_number: mobileNumber });
      console.log('Resend OTP Success:', response);

      // Reset 10-minute window, 30-sec cooldown, and OTP field
      setTimer(OTP_WINDOW_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');

      const successMsg =
        response?.msg ||
        response?.message ||
        'New OTP has been sent successfully.';
      Alert.alert('OTP Sent', `${successMsg} Valid for 10 minutes.`);
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message;
      const errorMessage =
        serverMsg ||
        error?.message ||
        'Failed to resend OTP. Please try again.';
      console.error('Resend OTP Error:', error);
      Alert.alert('Resend Failed', errorMessage);
    } finally {
      setResending(false);
    }
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
              We have sent a 6-digit OTP to
            </Text>

            <Text style={styles.phoneNumber}>
              {displayPhoneNumber}
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
                          hasOtpError &&
                          styles.otpBoxError,
                        ]}
                      >
                        <Text style={[styles.otpText, hasOtpError && styles.otpTextError]}>
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

              {/* Inline Error Message */}
              {inlineError ? (
                <View style={styles.inlineErrorContainer}>
                  <Text style={styles.inlineErrorText}>⚠️ {inlineError}</Text>
                </View>
              ) : null}

              {/* 10-Minute Window Countdown Badge */}
              <View
                style={[
                  styles.timerBadge,
                  isExpired ? styles.timerBadgeExpired : styles.timerBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.timerText,
                    isExpired ? styles.timerTextExpired : styles.timerTextActive,
                  ]}
                >
                  {isExpired
                    ? '⚠️ OTP expired (10-min window passed)'
                    : `⏱️ OTP valid for: ${formatTimer(timer)}`}
                </Text>
              </View>
            </TouchableOpacity>

            {/* =========================
                Verify Button
            ========================== */}

            <Button
              title={isExpired ? 'OTP Expired' : 'Verify OTP'}
              onPress={handleVerifyOTP}
              disabled={otp.length !== OTP_LENGTH || verifying || isExpired}
              loading={verifying}
              style={styles.verifyButton}
            />

            {/* =========================
                Resend OTP
            ========================== */}

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                {isExpired ? '10-min window passed?' : "Didn't receive the OTP?"}
              </Text>

              <TouchableOpacity
                onPress={handleResendOTP}
                activeOpacity={0.7}
                disabled={resending || resendCooldown > 0}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resending || resendCooldown > 0) && styles.resendLinkDisabled,
                    isExpired && resendCooldown === 0 && styles.resendLinkExpired,
                  ]}
                >
                  {resending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isExpired
                    ? 'Request New OTP'
                    : 'Resend OTP'}
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
    width: 48,
    height: 54,

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

  otpBoxError: {
    borderColor: colors.danger,
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },

  otpText: {
    fontSize: typography.fontSize.xl,

    fontWeight: '700',

    color: colors.textPrimary,

    fontFamily: 'GoogleSans-Regular',
  },

  otpTextError: {
    color: colors.danger,
  },

  inlineErrorContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },

  inlineErrorText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'GoogleSans-Regular',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  timerBadgeActive: {
    backgroundColor: '#EEF3FF',
  },

  timerBadgeExpired: {
    backgroundColor: '#FDECEC',
  },

  timerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    fontFamily: 'GoogleSans-Regular',
  },

  timerTextActive: {
    color: '#315EFF',
  },

  timerTextExpired: {
    color: colors.danger,
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

  resendLinkExpired: {
    color: colors.danger,
    textDecorationLine: 'underline',
  },

  resendLinkDisabled: {
    color: colors.textLight,
    opacity: 0.6,
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