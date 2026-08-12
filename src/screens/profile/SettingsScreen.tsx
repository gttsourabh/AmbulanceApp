import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows, spacing } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface SettingItemProps {
  icon: string;
  title: string;
  type?: 'navigation' | 'switch';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  rightText?: string;
  onPress?: () => void;
}

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

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
          onPress: () => {
            console.log('Logout');
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
    onPress,
  }: SettingItemProps) => {
    return (
      <TouchableOpacity
        activeOpacity={type === 'navigation' ? 0.7 : 1}
        style={styles.settingRow}
        onPress={type === 'navigation' ? onPress : undefined}
      >
        {/* ICON */}

        <View style={styles.iconContainer}>
          <AppIcon
            family="material"
            name={icon}
            size={19}
            color={colors.textSecondary}
          />
        </View>

        {/* TITLE */}

        <Text style={styles.settingTitle}>
          {title}
        </Text>

        {/* RIGHT */}

        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: colors.divider,
              true: '#35C978',
            }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.divider}
            style={styles.switch}
          />
        ) : (
          <View style={styles.rightContainer}>
            {rightText && (
              <Text style={styles.rightText}>
                {rightText}
              </Text>
            )}

            <AppIcon
              family="material"
              name="chevron-right"
              size={20}
              color={colors.textLight}
            />
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
      >
        {/* ================= SETTINGS CARD ================= */}

        <View style={styles.settingsCard}>

          {/* LANGUAGE */}

          {renderSettingItem({
            icon: 'translate',
            title: 'Language',
            rightText: 'English',
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
          })}

          <View style={styles.divider} />

          {/* SOUND */}

          {renderSettingItem({
            icon: 'volume-high',
            title: 'Sound',
            type: 'switch',
            value: soundEnabled,
            onValueChange: setSoundEnabled,
          })}

          <View style={styles.divider} />

          {/* PRIVACY */}

          {renderSettingItem({
            icon: 'lock-outline',
            title: 'Privacy Policy',
            onPress: handlePrivacyPolicy,
          })}

          <View style={styles.divider} />

          {/* TERMS */}

          {renderSettingItem({
            icon: 'file-document-outline',
            title: 'Terms & Conditions',
            onPress: handleTerms,
          })}

          <View style={styles.divider} />

          {/* HELP */}

          {renderSettingItem({
            icon: 'help-circle-outline',
            title: 'Help & Support',
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
            size={20}
            color="#EF4444"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

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
    backgroundColor: colors.white,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },

  // =====================================================
  // SETTINGS CARD
  // =====================================================

  settingsCard: {
    backgroundColor: colors.white,

    borderRadius: spacing.md,

    paddingHorizontal: spacing.md,

    ...shadows.card,
  },

  // =====================================================
  // SETTING ROW
  // =====================================================

  settingRow: {
    minHeight: 56,

    flexDirection: 'row',
    alignItems: 'center',
  },

  // =====================================================
  // ICON
  // =====================================================

  iconContainer: {
    width: 36,

    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  // =====================================================
  // TITLE
  // =====================================================

  settingTitle: {
    flex: 1,

    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: colors.textPrimary,
  },

  // =====================================================
  // RIGHT
  // =====================================================

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  rightText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 11,
    color: colors.textSecondary,
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
    height: 1,

    backgroundColor: colors.divider,
  },

  // =====================================================
  // LOGOUT
  // =====================================================

  logoutButton: {
    height: 54,

    marginTop: spacing.lg,

    borderRadius: spacing.md,

    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: colors.divider,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    ...shadows.card,
  },

  logoutText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: '#EF4444',
  },
});