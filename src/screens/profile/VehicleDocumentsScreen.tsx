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

  const getStatusColor = (status: DocumentItem['status']) => {
    switch (status) {
      case 'Verified':
        return colors.success || '#16A34A';

      case 'Pending':
        return '#F59E0B';

      case 'Expired':
        return '#EF4444';

      default:
        return colors.textSecondary;
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
              Vehicle Details
            </Text>

            <Text style={styles.vehicleNumber}>
              KA 01 AB 1234
            </Text>

            <Text style={styles.vehicleName}>
              Force Traveller
            </Text>
          </View>

          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Force_Traveller.jpg/640px-Force_Traveller.jpg',
            }}
            style={styles.vehicleImage}
            resizeMode="contain"
          />
        </View>

        {/* ================= DOCUMENTS ================= */}

        <View style={styles.documentsCard}>
          <Text style={styles.documentsTitle}>
            Documents
          </Text>

          {documents.map((document, index) => {
            const statusColor = getStatusColor(
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

                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusColor,
                      },
                    ]}
                  >
                    {document.status}
                  </Text>

                  <View
                    style={[
                      styles.statusIcon,
                      {
                        borderColor: statusColor,
                      },
                    ]}
                  >
                    <AppIcon
                      family="material"
                      name="check"
                      size={11}
                      color={statusColor}
                    />
                  </View>
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
    backgroundColor: colors.white,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },

  // =====================================================
  // VEHICLE CARD
  // =====================================================

  vehicleCard: {
    minHeight: 105,
    backgroundColor: colors.white,

    borderRadius: spacing.md,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,

    flexDirection: 'row',
    alignItems: 'center',

    ...shadows.card,
  },

  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  sectionLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,

    marginBottom: spacing.xs,
  },

  vehicleNumber: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,

    marginBottom: 3,
  },

  vehicleName: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  vehicleImage: {
    width: 125,
    height: 75,
  },

  // =====================================================
  // DOCUMENTS CARD
  // =====================================================

  documentsCard: {
    backgroundColor: colors.white,

    borderRadius: spacing.md,

    marginTop: spacing.md,

    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,

    ...shadows.card,
  },

  documentsTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,

    marginBottom: spacing.sm,
  },

  // =====================================================
  // DOCUMENT ROW
  // =====================================================

  documentRow: {
    minHeight: 54,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  lastDocumentRow: {
    borderBottomWidth: 0,
  },

  documentInfo: {
    flex: 1,
    justifyContent: 'center',
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
    color: colors.textSecondary,
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statusText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
  },

  statusIcon: {
    width: 17,
    height: 17,

    borderRadius: 9,

    borderWidth: 1.5,

    alignItems: 'center',
    justifyContent: 'center',
  },
});