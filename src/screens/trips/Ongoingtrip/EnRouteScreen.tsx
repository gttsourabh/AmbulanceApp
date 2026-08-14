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

const EnRouteScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCall = () => {
    console.log('Call hospital');
  };

  const handleReachedHospital = () => {
    navigation.navigate('OnTrip' as never);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header backEnabled title="En-Route To Hospital" />

      {/* =====================================================
          MAP AREA (static placeholder)
      ===================================================== */}

      <View style={styles.mapContainer}>

        {/* Temporary map placeholder */}
        <View style={styles.mapPlaceholder}>

          <View style={styles.mapPlaceholderIconCircle}>
            <AppIcon
              family="material"
              name="hospital-marker"
              size={30}
              color={colors.primary}
            />
          </View>

          <Text style={styles.mapPlaceholderText}>
            Live route to hospital
          </Text>

        </View>

        {/* =====================================================
            DISTANCE CARD
        ===================================================== */}

        <View style={styles.distanceCard}>
          <View style={styles.distanceIcon}>
            <AppIcon
              family="material"
              name="navigation"
              size={16}
              color={colors.white}
            />
          </View>

          <View>
            <Text style={styles.distanceText}>
              12.4 km
            </Text>

            <Text style={styles.etaText}>
              25 min away
            </Text>
          </View>
        </View>

        {/* =====================================================
            HOSPITAL CARD
        ===================================================== */}

        <View style={styles.hospitalCardShadowWrap}>
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

                <Text
                  style={styles.hospitalAddress}
                  numberOfLines={1}
                >
                  45, Hospital Road, Bengaluru
                </Text>
              </View>
            </View>

            <Button
              title=""
              onPress={handleCall}
              icon="phone"
              iconSize={17}
              variant="primary"
              style={styles.callButton}
            />

          </View>
        </View>
      </View>

      {/* =====================================================
          REACHED HOSPITAL BUTTON
      ===================================================== */}

      <View style={styles.bottomContainer}>
        <Button
          title="Reached at Hospital"
          onPress={handleReachedHospital}
          icon="check-circle"
          variant="primary"
          style={styles.reachedButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default EnRouteScreen;

const styles = StyleSheet.create({
  // =====================================================
  // SCREEN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // =====================================================
  // MAP
  // =====================================================

  mapContainer: {
    flex: 1,

    position: 'relative',

    overflow: 'hidden',

    backgroundColor: colors.background,
  },

  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.background,
  },

  mapPlaceholderIconCircle: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor: colors.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: spacing.sm,
  },

  mapPlaceholderText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    letterSpacing: 0.2,
  },

  // =====================================================
  // DISTANCE CARD
  // =====================================================

  distanceCard: {
    position: 'absolute',

    top: spacing.md,
    left: spacing.md,

    minWidth: 118,

    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,

    borderRadius: 14,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  distanceIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.sm,
  },

  distanceText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,

    color: colors.textPrimary,
  },

  etaText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,

    marginTop: 1,
  },

  // =====================================================
  // HOSPITAL CARD
  // =====================================================

  hospitalCardShadowWrap: {
    position: 'absolute',

    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,

    borderRadius: 18,

    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  hospitalCard: {
    minHeight: 72,

    paddingHorizontal: spacing.sm,

    borderRadius: 18,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,

    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textSecondary,
  },

  callButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    paddingHorizontal: 0,

    gap: 0,
  },

  // =====================================================
  // BOTTOM
  // =====================================================

  bottomContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,

    backgroundColor: colors.white,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },

  reachedButton: {
    height: 54,
    borderRadius: 14,
  },
});