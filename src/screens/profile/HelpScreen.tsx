import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows, spacing } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface HelpItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const HelpScreen = () => {
  const handleFAQs = () => {
    console.log('FAQs');
  };

  const handleContactSupport = () => {
    console.log('Contact Support');
  };

  const handleChat = () => {
    console.log('Chat with Us');
  };

  const handleReportIssue = () => {
    console.log('Report an Issue');
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:+918012345678');
  };

  const renderHelpItem = ({
    icon,
    title,
    onPress,
  }: HelpItemProps) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.helpRow}
        onPress={onPress}
      >
        {/* ICON */}

        <View style={styles.iconContainer}>
          <AppIcon
            family="material"
            name={icon}
            size={18}
            color={colors.primary}
          />
        </View>

        {/* TITLE */}

        <Text style={styles.helpTitle}>
          {title}
        </Text>

        {/* ARROW */}

        <View style={styles.chevronContainer}>
          <AppIcon
            family="material"
            name="chevron-right"
            size={18}
            color={colors.textLight}
          />
        </View>
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
        title="Help & Support"
        showRightIcon={false}
      />

      <View style={styles.content}>

        <Text style={styles.question}>
          How can we help you?
        </Text>

        {/* ================= HELP CARD ================= */}

        <View style={styles.helpCard}>

          {/* FAQs */}

          {renderHelpItem({
            icon: 'help-circle-outline',
            title: 'FAQs',
            onPress: handleFAQs,
          })}

          <View style={styles.divider} />

          {/* CONTACT SUPPORT */}

          {renderHelpItem({
            icon: 'face-agent',
            title: 'Contact Support',
            onPress: handleContactSupport,
          })}

          <View style={styles.divider} />

          {/* CHAT */}

          {renderHelpItem({
            icon: 'chat-outline',
            title: 'Chat with Us',
            onPress: handleChat,
          })}

          <View style={styles.divider} />

          {/* REPORT ISSUE */}

          {renderHelpItem({
            icon: 'alert-circle-outline',
            title: 'Report an Issue',
            onPress: handleReportIssue,
          })}

        </View>

        {/* ================= EMERGENCY SUPPORT ================= */}

        <View style={styles.emergencyCard}>

          <View style={styles.emergencyIconBadge}>
            <AppIcon
              family="material"
              name="lifebuoy"
              size={20}
              color={colors.primary}
            />
          </View>

          <View style={styles.emergencyContent}>

            <View style={styles.emergencyTitleRow}>
              <Text style={styles.emergencyTitle}>
                EMERGENCY SUPPORT
              </Text>

              <View style={styles.liveDot} />

              <Text style={styles.availableText}>
                24x7 Available
              </Text>
            </View>

            <Text style={styles.phoneNumber}>
              +91 80 1234 5678
            </Text>

          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.callButton}
            onPress={handleEmergencyCall}
          >
            <AppIcon
              family="material"
              name="phone"
              size={19}
              color={colors.white}
            />
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;

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
  // QUESTION
  // =====================================================

  question: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    letterSpacing: 0.1,

    marginBottom: spacing.sm,
  },

  // =====================================================
  // HELP CARD
  // =====================================================

  helpCard: {
     backgroundColor: colors.background,

    borderRadius: 18,

    paddingHorizontal: spacing.md,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  // =====================================================
  // HELP ROW
  // =====================================================

  helpRow: {
    minHeight: 60,

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

    backgroundColor: colors.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.sm,
  },

  // =====================================================
  // TITLE
  // =====================================================

  helpTitle: {
    flex: 1,

    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  chevronContainer: {
    width: 24,
    height: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: StyleSheet.hairlineWidth,

    backgroundColor: colors.divider,

    marginLeft: 48,
  },

  // =====================================================
  // EMERGENCY CARD
  // =====================================================

  emergencyCard: {
    marginTop: spacing.lg,

    minHeight: 86,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,

    borderRadius: 20,

    backgroundColor: colors.primaryLight,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  emergencyIconBadge: {
    width: 44,
    height: 44,

    borderRadius: 14,

     backgroundColor: colors.background,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.sm,
  },

  emergencyContent: {
    flex: 1,
  },

  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 5,
  },

  emergencyTitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.5,
  },

  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,

    backgroundColor: colors.success,

    marginHorizontal: 6,
  },

  phoneNumber: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  availableText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 10,
    color: colors.textSecondary,
  },

  // =====================================================
  // CALL BUTTON
  // =====================================================

  callButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
  },
});