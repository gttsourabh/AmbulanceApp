import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';

const OnTripScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleReachedHospital = () => {
    navigation.navigate("TripCompleted" as never)
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header backEnabled title="On Trip" />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <View style={styles.content}>

        {/* ===================================================
            HOSPITAL CARD
        =================================================== */}

        <View style={styles.hospitalCard}>
          <View style={styles.hospitalIcon}>
            <AppIcon
              family="fontawesome"
              name="hospital"
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>
              Secure Hospital
            </Text>

            <View style={styles.hospitalAddressRow}>
              <AppIcon
                family="material"
                name="map-marker-outline"
                size={12}
                color={colors.textLight}
              />

              <Text style={styles.hospitalAddress}>
                45, Hospital Road, Bengaluru
              </Text>
            </View>
          </View>

          <View style={styles.enRoutePill}>
            <View style={styles.enRouteDot} />

            <Text style={styles.enRouteText}>
              En Route
            </Text>
          </View>
        </View>

        {/* ===================================================
            TRIP STATS
        =================================================== */}

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <AppIcon
              family="material"
              name="map-marker-distance"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.statValue}>
              12.4
            </Text>

            <Text style={styles.statLabel}>
              KM REMAINING
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <AppIcon
              family="material"
              name="clock-outline"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.statValue}>
              25
            </Text>

            <Text style={styles.statLabel}>
              MIN ETA
            </Text>
          </View>
        </View>

        {/* ===================================================
            TRIP PROGRESS
        =================================================== */}

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            Trip in Progress
          </Text>

          {/* Pickup Completed */}

          <View style={styles.progressRow}>
            <View style={styles.progressIndicator}>
              <View style={styles.completedCircle}>
                <AppIcon
                  family="material"
                  name="check"
                  size={12}
                  color={colors.white}
                />
              </View>

              <View
                style={[
                  styles.progressLine,
                  styles.progressLineDone,
                ]}
              />
            </View>

            <Text style={styles.completedText}>
              Pickup Completed
            </Text>
          </View>

          {/* On The Way */}

          <View style={styles.progressRow}>
            <View style={styles.progressIndicator}>
              <View style={styles.activeCircle}>
                <View style={styles.activeDot} />
              </View>

              <View style={styles.progressLine} />
            </View>

            <Text style={styles.activeText}>
              On the Way to Hospital
            </Text>
          </View>

          {/* Drop */}

          <View style={styles.progressRow}>
            <View style={styles.progressIndicator}>
              <View style={styles.pendingCircle} />
            </View>

            <Text style={styles.pendingText}>
              Drop at Hospital
            </Text>
          </View>
        </View>

      </View>

      {/* =====================================================
          BOTTOM BUTTON
      ===================================================== */}

      <View style={styles.bottomContainer}>
        <Button
          title="Reached Hospital"
          onPress={handleReachedHospital}
          icon="check-circle"
          variant="primary"
          style={styles.primaryButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default OnTripScreen;

const styles = StyleSheet.create({
  // =====================================================
  // SCREEN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    flex: 1,

    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // =====================================================
  // HOSPITAL
  // =====================================================

  hospitalCard: {
    minHeight: 72,

    paddingHorizontal: spacing.sm,

    borderRadius: 16,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  hospitalIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: colors.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.sm,
  },

  hospitalInfo: {
    flex: 1,
    paddingRight: spacing.xs,
  },

  hospitalName: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,

    color: colors.textPrimary,

    marginBottom: 3,
  },

  hospitalAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  hospitalAddress: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,
  },

  enRoutePill: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 10,

    backgroundColor: colors.primaryLight,
  },

  enRouteDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,

    backgroundColor: colors.primary,
  },

  enRouteText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.2,

    color: colors.primary,
  },

  // =====================================================
  // STATS
  // =====================================================

  statsCard: {
    marginTop: spacing.sm,

    minHeight: 92,

    paddingHorizontal: spacing.lg,

    borderRadius: 16,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',

    gap: 4,
  },

  statValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    letterSpacing: 0.2,

    color: colors.textPrimary,
  },

  statLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.4,

    color: colors.textLight,
  },

  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 48,

    backgroundColor: colors.divider,
  },

  // =====================================================
  // PROGRESS
  // =====================================================

  progressCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,

    padding: spacing.md,

    borderRadius: 16,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  progressTitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,

    color: colors.textPrimary,

    marginBottom: spacing.md,
  },

  progressRow: {
    minHeight: 42,

    flexDirection: 'row',
  },

  progressIndicator: {
    width: 28,

    alignItems: 'center',
  },

  completedCircle: {
    width: 18,
    height: 18,

    borderRadius: 9,

    backgroundColor: colors.success,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activeCircle: {
    width: 18,
    height: 18,

    borderRadius: 9,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  activeDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

     backgroundColor: colors.background,
  },

  pendingCircle: {
    width: 18,
    height: 18,

    borderRadius: 9,

    borderWidth: 2,
    borderColor: colors.border,

     backgroundColor: colors.background,
  },

  progressLine: {
    flex: 1,

    width: 2,

    backgroundColor: colors.divider,

    marginVertical: 2,
  },

  progressLineDone: {
    backgroundColor: colors.success,
  },

  completedText: {
    flex: 1,

    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textPrimary,

    paddingTop: 1,
  },

  activeText: {
    flex: 1,

    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,

    color: colors.textPrimary,

    paddingTop: 1,
  },

  pendingText: {
    flex: 1,

    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,

    paddingTop: 1,
  },

  // =====================================================
  // BOTTOM
  // =====================================================

  bottomContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,

     backgroundColor: colors.background,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },

  primaryButton: {
    height: 54,
    borderRadius: 14,
  },
});