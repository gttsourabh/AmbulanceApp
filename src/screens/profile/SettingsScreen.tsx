import React, { useState, useEffect } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { SettingsScreenSkeleton } from '../../components/Skeleton';
import { useAppDispatch } from '../../redux/hook';
import { logout } from '../../redux/slices/authSlice';
import { storage } from '../../storage/storage';
import { resetToLogin } from '../../utils/navigationRef';

interface SettingItemProps {
  icon: string;
  title: string;
  type?: 'navigation' | 'switch';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  rightText?: string;
  iconBg: string;
  iconColor: string;
  onPress?: () => void;
}

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleLanguage = () => {
    console.log('Language');
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy');
  };

  const handleTerms = () => {
    console.log('Terms & Conditions');
  };

  const handleHelp = () => {
    console.log('Help & Support');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storage.clear();
            dispatch(logout());
            resetToLogin();
          },
        },
      ],
    );
  };

  const renderSettingItem = ({
    icon,
    title,
    type = 'navigation',
    value,
    onValueChange,
    rightText,
    iconBg,
    iconColor,
    onPress,
  }: SettingItemProps) => {
    return (
      <TouchableOpacity
        activeOpacity={type === 'navigation' ? 0.7 : 1}
        style={styles.settingRow}
        onPress={type === 'navigation' ? onPress : undefined}
      >
        {/* ICON */}

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBg },
          ]}
        >
          <AppIcon
            family="material"
            name={icon}
            size={18}
            color={iconColor}
          />
        </View>

        {/* TITLE */}

        <Text style={styles.settingTitle} numberOfLines={1}>
          {title}
        </Text>

        {/* RIGHT */}

        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: colors.divider,
              true: colors.success,
            }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.divider}
            style={styles.switch}
          />
        ) : (
          <View style={styles.rightContainer}>
            {rightText && (
              <Text style={styles.rightText} numberOfLines={1}>
                {rightText}
              </Text>
            )}

            <View style={styles.chevronContainer}>
              <AppIcon
                family="material"
                name="chevron-right"
                size={18}
                color={colors.textLight}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      {/* ================= HEADER ================= */}

      <Header
        backEnabled
        title="Settings"
        showRightIcon={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <SettingsScreenSkeleton />
        ) : (
          <>
            {/* ================= GENERAL ================= */}

            <Text style={styles.sectionHeading} numberOfLines={1}>
              General
            </Text>

            <View style={styles.settingsCard}>
              {/* LANGUAGE */}

              {renderSettingItem({
                icon: 'translate',
                title: 'Language',
                rightText: 'English',
                iconBg: colors.primaryLight,
                iconColor: colors.primary,
                onPress: handleLanguage,
              })}

              <View style={styles.divider} />

              {/* NOTIFICATIONS */}

              {renderSettingItem({
                icon: 'bell-outline',
                title: 'Notifications',
                type: 'switch',
                value: notificationsEnabled,
                onValueChange: setNotificationsEnabled,
                iconBg: colors.warningLight,
                iconColor: colors.warning,
              })}

              <View style={styles.divider} />

              {/* SOUND */}

              {renderSettingItem({
                icon: 'volume-high',
                title: 'Sound',
                type: 'switch',
                value: soundEnabled,
                onValueChange: setSoundEnabled,
                iconBg: colors.infoLight,
                iconColor: colors.info,
              })}
            </View>

            {/* ================= ABOUT ================= */}

            <Text style={styles.sectionHeading} numberOfLines={1}>
              About
            </Text>

            <View style={styles.settingsCard}>
              {/* PRIVACY */}

              {renderSettingItem({
                icon: 'lock-outline',
                title: 'Privacy Policy',
                iconBg: colors.primaryLight,
                iconColor: colors.primary,
                onPress: handlePrivacyPolicy,
              })}

              <View style={styles.divider} />

              {/* TERMS */}

              {renderSettingItem({
                icon: 'file-document-outline',
                title: 'Terms & Conditions',
                iconBg: colors.primaryLight,
                iconColor: colors.primary,
                onPress: handleTerms,
              })}

              <View style={styles.divider} />

              {/* HELP */}

              {renderSettingItem({
                icon: 'help-circle-outline',
                title: 'Help & Support',
                iconBg: colors.successLight,
                iconColor: colors.successDark,
                onPress: handleHelp,
              })}
            </View>

            {/* ================= LOGOUT ================= */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <AppIcon
                family="material"
                name="logout"
                size={19}
                color={colors.danger}
              />

              <Text style={styles.logoutText} numberOfLines={1}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* VERSION */}

            <Text style={styles.versionText} numberOfLines={1}>
              Version 1.0.0
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  // =====================================================
  // SCREEN
  // =====================================================

  container: {
    flex: 1,
     backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // =====================================================
  // SECTION HEADING
  // =====================================================

  sectionHeading: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 11,
    lineHeight: 13,
    includeFontPadding: false,
    color: colors.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',

    marginTop: 16,
    marginBottom: 8,
    marginLeft: 2,
  },

  // =====================================================
  // SETTINGS CARD
  // =====================================================

  settingsCard: {
    backgroundColor: colors.card,

    borderRadius: 18,

    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  // =====================================================
  // SETTING ROW
  // =====================================================

  settingRow: {
    height: 56,

    flexDirection: 'row',
    alignItems: 'center',
  },

  // =====================================================
  // ICON
  // =====================================================

  iconContainer: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  // =====================================================
  // TITLE
  // =====================================================

  settingTitle: {
    flex: 1,

    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  // =====================================================
  // RIGHT
  // =====================================================

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 2,
  },

  rightText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 11,
    lineHeight: 13,
    includeFontPadding: false,
    color: colors.textSecondary,
  },

  chevronContainer: {
    width: 24,
    height: 24,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  switch: {
    transform: [
      { scaleX: 0.8 },
      { scaleY: 0.8 },
    ],
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: StyleSheet.hairlineWidth,

    backgroundColor: colors.divider,

    marginLeft: 46,
  },

  // =====================================================
  // LOGOUT
  // =====================================================

  logoutButton: {
    height: 48,

    marginTop: 16,

    borderRadius: 16,

    backgroundColor: colors.dangerLight,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },

  logoutText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    lineHeight: 15,
    includeFontPadding: false,
    color: colors.danger,
    letterSpacing: 0.1,
  },

  // =====================================================
  // VERSION
  // =====================================================

  versionText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    lineHeight: 14,
    includeFontPadding: false,
    color: colors.textLight,
    textAlign: 'center',

    marginTop: 12,
  },
});