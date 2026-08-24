import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {
  Polyline,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

import { colors, typography, shadows, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';
import { AmbulanceMarker, LocationMarker, medicalMapStyle } from '../../../components/Map';

const OnTripScreen = () => {
  const navigation = useNavigation();

  const ambulanceLocation = {
    latitude: 12.9610,
    longitude: 77.6050,
  };

  const hospitalLocation = {
    latitude: 12.9352,
    longitude: 77.6245,
  };

  const routeCoordinates = [
    { latitude: 12.9716, longitude: 77.5946 },
    { latitude: 12.9650, longitude: 77.6000 },
    { latitude: 12.9610, longitude: 77.6050 },
    { latitude: 12.9550, longitude: 77.6080 },
    { latitude: 12.9480, longitude: 77.6150 },
    { latitude: 12.9400, longitude: 77.6200 },
    { latitude: 12.9352, longitude: 77.6245 },
  ];

  const initialRegion = {
    latitude: 12.953,
    longitude: 77.612,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewLiveMap = () => {
    navigation.navigate('EnRoute' as never);
  };

  const handleReachedHospital = () => {
    navigation.navigate('TripCompleted' as never);
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* HEADER */}
      <Header backEnabled title="On Trip" />

      {/* CONTENT */}
      <View style={styles.content}>
        {/* HOSPITAL CARD */}
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

        {/* INTERACTIVE MINI MAP CARD */}
        <View style={styles.miniMapCard}>
          <MapView
            style={styles.miniMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            initialRegion={initialRegion}
            showsUserLocation={false}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            loadingEnabled={true}
          >
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.danger}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
            <AmbulanceMarker coordinate={ambulanceLocation} heading={135} />
            <LocationMarker coordinate={hospitalLocation} type="hospital" />
          </MapView>

          <TouchableOpacity
            style={styles.expandMapOverlay}
            onPress={handleViewLiveMap}
            activeOpacity={0.85}
          >
            <View style={styles.expandButton}>
              <AppIcon
                family="material"
                name="fullscreen"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.expandButtonText}>Live Navigation</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* TRIP STATS */}
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

        {/* TRIP PROGRESS */}
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

      {/* BOTTOM BUTTON */}
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
  // SCREEN
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // CONTENT
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // HOSPITAL
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

  // MINI MAP
  miniMapCard: {
    marginTop: spacing.sm,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    backgroundColor: colors.card,
  },

  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },

  expandMapOverlay: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
  },

  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  expandButtonText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },

  // STATS
  statsCard: {
    marginTop: spacing.sm,
    minHeight: 80,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },

  statLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textLight,
  },

  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.divider,
  },

  // PROGRESS
  progressCard: {
    marginTop: spacing.sm,
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
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.4,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  progressIndicator: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },

  completedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.divider,
    borderWidth: 2,
    borderColor: colors.border,
  },

  progressLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.divider,
    marginVertical: 2,
  },

  progressLineDone: {
    backgroundColor: colors.success,
  },

  completedText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginTop: 2,
  },

  activeText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: 2,
  },

  pendingText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },

  // BOTTOM BUTTON
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