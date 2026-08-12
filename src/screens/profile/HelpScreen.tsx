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
            size={19}
            color="#315EFF"
          />
        </View>

        {/* TITLE */}

        <Text style={styles.helpTitle}>
          {title}
        </Text>

        {/* ARROW */}

        <AppIcon
          family="material"
          name="chevron-right"
          size={20}
          color={colors.textLight}
        />
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

        {/* ================= HELP CARD ================= */}

        <View style={styles.helpCard}>

          <Text style={styles.question}>
            How can we help you?
          </Text>

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

          <View style={styles.emergencyContent}>

            <Text style={styles.emergencyTitle}>
              Emergency Support
            </Text>

            <Text style={styles.phoneNumber}>
              +91 80 1234 5678
            </Text>

            <Text style={styles.availableText}>
              24x7 Available
            </Text>

          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.callButton}
            onPress={handleEmergencyCall}
          >
            <AppIcon
              family="material"
              name="phone"
              size={20}
              color="#315EFF"
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
    backgroundColor: colors.white,
  },

  content: {
    flex: 1,

    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  // =====================================================
  // HELP CARD
  // =====================================================

  helpCard: {
    backgroundColor: colors.white,

    borderRadius: spacing.md,

    paddingHorizontal: spacing.md,

    ...shadows.card,
  },

  // =====================================================
  // QUESTION
  // =====================================================

  question: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: colors.textPrimary,

    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // =====================================================
  // HELP ROW
  // =====================================================

  helpRow: {
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

  helpTitle: {
    flex: 1,

    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: colors.textPrimary,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: 1,

    backgroundColor: colors.divider,
  },

  // =====================================================
  // EMERGENCY CARD
  // =====================================================

  emergencyCard: {
    marginTop: spacing.md,

    minHeight: 78,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

    borderRadius: spacing.md,

    backgroundColor: '#F5F8FF',

    borderWidth: 1,
    borderColor: '#DCE5FF',

    flexDirection: 'row',
    alignItems: 'center',

    ...shadows.card,
  },

  emergencyContent: {
    flex: 1,
  },

  emergencyTitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 11,
    color: '#315EFF',

    marginBottom: 3,
  },

  phoneNumber: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 15,
    color: '#EF4444',

    marginBottom: 3,
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
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#EAF0FF',

    alignItems: 'center',
    justifyContent: 'center',
  },
});