import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../../../components/Header/Header';
import { colors, typography, spacing } from '../../../theme';
import { AppIcon } from '../../../icons';
import Button from '../../../components/Button/Button';

const IncomingRequestScreen = () => {
  const navigation = useNavigation();

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = () => {
    navigation.goBack();
  };

  // =====================================================
  // ACCEPT
  // =====================================================

  const handleAccept = () => {
    navigation.navigate('NavigationToPickup' as never);
  };

  // =====================================================
  // CALL
  // =====================================================

  const handleCall = () => {
    console.log('Call patient');
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <View style={styles.overlay}>
      {/* =====================================================
          REQUEST CARD
      ===================================================== */}

      <View style={styles.requestCardShadowWrap}>
        <View style={styles.requestCard}>

          {/* PATIENT DETAILS */}

          <View style={styles.section}>
            <Text style={styles.label}>
              PATIENT DETAILS
            </Text>

            <View style={styles.patientRow}>
              <Text style={styles.value}>
                John Doe
              </Text>

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

          <View style={styles.divider} />

          {/* PICKUP LOCATION */}

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary },
                ]}
              />

              <Text style={styles.label}>
                PICKUP LOCATION
              </Text>
            </View>

            <Text style={styles.value}>
              123, MG Road, Bengaluru
            </Text>

            <Text style={styles.secondaryValue}>
              560001
            </Text>
          </View>

          <View style={styles.divider} />

          {/* DESTINATION */}

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.danger },
                ]}
              />

              <Text style={styles.label}>
                DESTINATION
              </Text>
            </View>

            <Text style={styles.value}>
              Secure Hospital
            </Text>

            <Text style={styles.secondaryValue}>
              3.2 km away
            </Text>
          </View>

          <View style={styles.divider} />

          {/* EMERGENCY TYPE + EARNINGS */}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.label}>
                EMERGENCY TYPE
              </Text>

              <View style={styles.typePill}>
                <AppIcon
                  family="material"
                  name="medical-bag"
                  size={13}
                  color={colors.danger}
                />

                <Text style={styles.typeText}>
                  Medical
                </Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Text style={styles.label}>
                ESTIMATED EARNINGS
              </Text>

              <Text style={styles.earningValue}>
                ₹ 350
              </Text>
            </View>
          </View>

          {/* =====================================================
              ACTION BUTTONS
          ===================================================== */}

          <View style={styles.actionRow}>
            <Button
              title="Reject"
              onPress={handleReject}
              variant="danger"
              style={styles.rejectButton}
            />

            <Button
              title="Accept"
              onPress={handleAccept}
              icon="check"
              iconSize={17}
              variant="primary"
              style={styles.acceptButton}
            />
          </View>

        </View>
      </View>
    </View>
  );
};

export default IncomingRequestScreen;

const styles = StyleSheet.create({
  // =====================================================
  // OVERLAY
  // =====================================================

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  },

  // =====================================================
  // REQUEST CARD
  // =====================================================

  requestCardShadowWrap: {
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },

  requestCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },

  // =====================================================
  // SECTION
  // =====================================================

  section: {
    paddingVertical: spacing.xs,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  label: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textLight,
    marginBottom: 5,
  },

  value: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },

  secondaryValue: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },

  // =====================================================
  // PATIENT
  // =====================================================

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 0,
    gap: 0,
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },

  // =====================================================
  // EMERGENCY TYPE + EARNINGS
  // =====================================================

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  metaItem: {
    flex: 1,
  },

  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },

  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.dangerLight,
  },

  typeText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.danger,
  },

  earningValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.lg,
    letterSpacing: 0.2,
    color: colors.successDark,
  },

  // =====================================================
  // ACTIONS
  // =====================================================

  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  rejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
  },

  acceptButton: {
    flex: 1.4,
    height: 52,
    borderRadius: 14,
  },

});