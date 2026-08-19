import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows, spacing } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface DocumentItem {
  title: string;
  subtitle?: string;
  status: 'Verified' | 'Pending' | 'Expired';
}

const VehicleDocumentsScreen = () => {
  const documents: DocumentItem[] = [
    {
      title: 'Driving License',
      status: 'Verified',
    },
    {
      title: 'RC Book',
      status: 'Verified',
    },
    {
      title: 'Insurance',
      subtitle: 'Valid till 15 Oct 2025',
      status: 'Verified',
    },
    {
      title: 'Pollution Certificate',
      subtitle: 'Valid till 20 Dec 2025',
      status: 'Verified',
    },
  ];

  const getStatusColors = (status: DocumentItem['status']) => {
    switch (status) {
      case 'Verified':
        return { text: colors.successDark, bg: colors.successLight };

      case 'Pending':
        return { text: colors.warning, bg: colors.warningLight };

      case 'Expired':
        return { text: colors.danger, bg: colors.dangerLight };

      default:
        return { text: colors.textSecondary, bg: colors.divider };
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      {/* ================= HEADER ================= */}

      <Header
        backEnabled
        title="Vehicle & Documents"
        showRightIcon={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= VEHICLE CARD ================= */}

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.sectionLabel}>
              VEHICLE DETAILS
            </Text>

            <Text style={styles.vehicleNumber}>
              KA 01 AB 1234
            </Text>

            <Text style={styles.vehicleName}>
              Force Traveller
            </Text>
          </View>

          <View style={styles.vehicleImageContainer}>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Force_Traveller.jpg/640px-Force_Traveller.jpg',
              }}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ================= DOCUMENTS ================= */}

        <Text style={styles.sectionHeading}>
          Documents
        </Text>

        <View style={styles.documentsCard}>

          {documents.map((document, index) => {
            const statusColors = getStatusColors(
              document.status,
            );

            return (
              <View
                key={document.title}
                style={[
                  styles.documentRow,
                  index === documents.length - 1 &&
                  styles.lastDocumentRow,
                ]}
              >
                {/* ICON */}

                <View style={styles.documentIcon}>
                  <AppIcon
                    family="material"
                    name="file-document-outline"
                    size={17}
                    color={colors.primary}
                  />
                </View>

                {/* DOCUMENT INFO */}

                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {document.title}
                  </Text>

                  {document.subtitle && (
                    <Text style={styles.documentSubtitle}>
                      {document.subtitle}
                    </Text>
                  )}
                </View>

                {/* STATUS */}

                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: statusColors.bg },
                  ]}
                >
                  <AppIcon
                    family="material"
                    name="check-circle"
                    size={12}
                    color={statusColors.text}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      { color: statusColors.text },
                    ]}
                  >
                    {document.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleDocumentsScreen;

const styles = StyleSheet.create({
  // =====================================================
  // SCREEN
  // =====================================================

  container: {
    flex: 1,
     backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
  },

  // =====================================================
  // VEHICLE CARD
  // =====================================================

  vehicleCard: {
    minHeight: 110,
    backgroundColor: colors.primaryLight,

    borderRadius: 20,

    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.md,

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

  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  sectionLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 0.6,

    marginBottom: spacing.xs,
  },

  vehicleNumber: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    letterSpacing: 0.2,

    marginBottom: 3,
  },

  vehicleName: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  vehicleImageContainer: {
    width: 118,
    height: 78,

    borderRadius: 14,

     backgroundColor: colors.background,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
  },

  vehicleImage: {
    width: '90%',
    height: '80%',
  },

  // =====================================================
  // DOCUMENTS
  // =====================================================

  sectionHeading: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',

    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },

  // =====================================================
  // DOCUMENTS CARD
  // =====================================================

  documentsCard: {
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
  // DOCUMENT ROW
  // =====================================================

  documentRow: {
    minHeight: 62,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },

  lastDocumentRow: {
    borderBottomWidth: 0,
  },

  // =====================================================
  // DOCUMENT ICON
  // =====================================================

  documentIcon: {
    width: 36,
    height: 36,

    borderRadius: 12,

    backgroundColor: colors.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.sm,
  },

  documentInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },

  documentName: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,

    marginBottom: 2,
  },

  documentSubtitle: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 10,
    color: colors.textLight,
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 10,
  },

  statusText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    letterSpacing: 0.2,
  },
});