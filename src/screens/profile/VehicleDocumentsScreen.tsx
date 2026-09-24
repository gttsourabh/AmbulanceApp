import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';

import { colors, typography, shadows } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { VehicleDocumentsSkeleton } from '../../components/Skeleton';
import { ImageViewerModal } from '../../components';
import { ProfileStackParamList } from '../../Navigation/stacks/Profilestack';
import { getDriverApi, DriverProfileData } from '../../api';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { useAppSelector } from '../../redux/hook';
import {
  getVehicleImageUrl,
  getDrivingLicenseImageUrl,
  getInsuranceImageUrl,
  getPollutionCertificateImageUrl,
  getRcBookImageUrl,
  normalizeDriverProfile,
} from '../../utils/imageUtils';

interface DocumentItem {
  title: string;
  subtitle?: string;
  status: string;
  imageUrl?: string | null;
  icon: string;
}

type VehicleDocumentsRouteProp = RouteProp<ProfileStackParamList, 'VehicleDocument'>;

const VehicleDocumentsScreen = () => {
  const route = useRoute<VehicleDocumentsRouteProp>();
  const user = useAppSelector(state => state.auth.user);

  const [driverProfile, setDriverProfile] = useState<DriverProfileData | null>(
    route.params?.driverProfile || null
  );
  const [isLoading, setIsLoading] = useState(!route.params?.driverProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const extractDriverFromResponse = (res: any): DriverProfileData | null => {
    if (!res) return null;
    const body = res?.data !== undefined ? res.data : res;
    if (!body) return null;

    let rawDriver: any = null;
    if (Array.isArray(body)) {
      rawDriver = body.length > 0 ? body[0] : null;
    } else if (Array.isArray(body.data)) {
      rawDriver = body.data.length > 0 ? body.data[0] : null;
    } else if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
      rawDriver = body.data;
    } else if (Array.isArray(body.result)) {
      rawDriver = body.result.length > 0 ? body.result[0] : null;
    } else if (body.result && typeof body.result === 'object' && !Array.isArray(body.result)) {
      rawDriver = body.result;
    } else if (Array.isArray(body.drivers)) {
      rawDriver = body.drivers.length > 0 ? body.drivers[0] : null;
    } else if (body.driver && typeof body.driver === 'object' && !Array.isArray(body.driver)) {
      rawDriver = body.driver;
    } else if (Array.isArray(body.records)) {
      rawDriver = body.records.length > 0 ? body.records[0] : null;
    } else if (Array.isArray(body.rows)) {
      rawDriver = body.rows.length > 0 ? body.rows[0] : null;
    } else if (
      typeof body === 'object' &&
      !Array.isArray(body) &&
      (body.name || body.driver_name || body.vehicle_number || body.vehicle_no)
    ) {
      rawDriver = body;
    }
    return rawDriver ? normalizeDriverProfile(rawDriver) : null;
  };

  const fetchDriverProfile = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh && !driverProfile) {
      setIsLoading(true);
    }

    try {
      let driverUserId = user?.id || user?.user_id || user?.userId || user?.driver_id;
      if (!driverUserId && driverUserId !== 0) {
        try {
          const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
          driverUserId = storedUser?.id || storedUser?.user_id || storedUser?.userId || storedUser?.driver_id;
        } catch {
          // ignore
        }
      }

      if (!driverUserId && driverUserId !== 0) {
        console.warn('⚠️ [VEHICLE DOCS] No driver ID found to fetch profile');
        return;
      }

      console.log('📡 [VEHICLE DOCS] Calling /api/driver/get with id:', driverUserId);
      const res = await getDriverApi({
        id: driverUserId,
      });

      console.log('📡 [VEHICLE DOCS] Response from /api/driver/get:', res?.data);

      const fetchedDriver = extractDriverFromResponse(res);
      console.log('✅ [VEHICLE DOCS] Extracted Driver Profile from API:', fetchedDriver);

      if (fetchedDriver) {
        setDriverProfile(fetchedDriver);
      }
    } catch (err: any) {
      console.warn('❌ [VEHICLE DOCS DRIVER API ERROR]:', err?.response?.data || err?.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, driverProfile]);

  useEffect(() => {
    if (!route.params?.driverProfile) {
      fetchDriverProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDriverProfile(true);
  };

  const formatStatus = (st?: string) => {
    if (!st) return 'Pending';
    const lower = st.toLowerCase();
    if (lower === 'verified' || lower === 'approved') return 'Verified';
    if (lower === 'pending') return 'Pending';
    if (lower === 'expired') return 'Expired';
    if (lower === 'rejected') return 'Rejected';
    return st.charAt(0).toUpperCase() + st.slice(1);
  };

  const getStatusColors = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'verified':
      case 'approved':
        return { text: colors.successDark, bg: colors.successLight, icon: 'check-circle' };

      case 'pending':
        return { text: colors.warning, bg: colors.warningLight, icon: 'clock-outline' };

      case 'expired':
      case 'rejected':
        return { text: colors.danger, bg: colors.dangerLight, icon: 'close-circle' };

      default:
        return { text: colors.textSecondary, bg: colors.divider, icon: 'help-circle' };
    }
  };

  const documents: DocumentItem[] = [
    {
      title: 'Driving License',
      subtitle: driverProfile?.driving_license_status?.toLowerCase() === 'verified'
        ? 'Verified & Approved'
        : (driverProfile?.driving_license_image_url || driverProfile?.driving_license_image ? 'Document Attached (Pending Verification)' : 'Verification Pending'),
      status: formatStatus(driverProfile?.driving_license_status),
      imageUrl: getDrivingLicenseImageUrl(driverProfile?.driving_license_image_url || driverProfile?.driving_license_image),
      icon: 'card-account-details-outline',
    },
    {
      title: 'RC Book',
      subtitle: driverProfile?.rc_book_status?.toLowerCase() === 'verified'
        ? 'Verified & Approved'
        : (driverProfile?.rc_book_image_url || driverProfile?.rc_book_image ? 'Document Attached (Pending Verification)' : 'Verification Pending'),
      status: formatStatus(driverProfile?.rc_book_status),
      imageUrl: getRcBookImageUrl(driverProfile?.rc_book_image_url || driverProfile?.rc_book_image),
      icon: 'file-document-outline',
    },
    {
      title: 'Insurance',
      subtitle: driverProfile?.insurance_status?.toLowerCase() === 'verified'
        ? 'Valid & Verified'
        : (driverProfile?.insurance_image_url || driverProfile?.insurance_image ? 'Document Attached (Pending Verification)' : 'Verification Pending'),
      status: formatStatus(driverProfile?.insurance_status),
      imageUrl: getInsuranceImageUrl(driverProfile?.insurance_image_url || driverProfile?.insurance_image),
      icon: 'shield-check-outline',
    },
    {
      title: 'Pollution Certificate',
      subtitle: driverProfile?.pollution_certificate_status?.toLowerCase() === 'verified'
        ? 'Valid & Verified'
        : (driverProfile?.pollution_certificate_image_url || driverProfile?.pollution_certificate_image ? 'Document Attached (Pending Verification)' : 'Verification Pending'),
      status: formatStatus(driverProfile?.pollution_certificate_status),
      imageUrl: getPollutionCertificateImageUrl(driverProfile?.pollution_certificate_image_url || driverProfile?.pollution_certificate_image),
      icon: 'leaf',
    },
  ];

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
          <VehicleDocumentsSkeleton />
        ) : (
          <>
            {/* ================= VEHICLE CARD ================= */}

            <View style={styles.vehicleCard}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.sectionLabel} numberOfLines={1}>
                  VEHICLE DETAILS
                </Text>

                <Text style={styles.vehicleNumber} numberOfLines={1}>
                  {driverProfile?.vehicle_number || driverProfile?.vehicle_no || 'Not Assigned'}
                </Text>

                <Text style={styles.vehicleName} numberOfLines={1}>
                  {driverProfile?.vehicle_name || 'Ambulance Emergency Vehicle'}
                </Text>

                {driverProfile?.document_status ? (
                  <View
                    style={[
                      styles.docStatusBadge,
                      {
                        backgroundColor:
                          driverProfile.document_status.toLowerCase() === 'verified'
                            ? colors.successLight
                            : colors.warningLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.docStatusText,
                        {
                          color:
                            driverProfile.document_status.toLowerCase() === 'verified'
                              ? colors.successDark
                              : colors.warning,
                        },
                      ]}
                    >
                      Status: {formatStatus(driverProfile.document_status)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {(() => {
                const vehicleUri = getVehicleImageUrl(
                  driverProfile?.vehicle_image_url || driverProfile?.vehicle_image
                );
                return (
                  <TouchableOpacity
                    style={styles.vehicleImageContainer}
                    activeOpacity={vehicleUri ? 0.75 : 1}
                    disabled={!vehicleUri}
                    onPress={() => {
                      if (vehicleUri) {
                        setSelectedImage({
                          uri: vehicleUri,
                          title: driverProfile?.vehicle_name || 'Vehicle Photo',
                          subtitle:
                            driverProfile?.vehicle_number ||
                            driverProfile?.vehicle_no ||
                            'Ambulance Emergency Vehicle',
                        });
                      }
                    }}
                  >
                    {vehicleUri ? (
                      <>
                        <Image
                          source={{
                            uri: vehicleUri,
                          }}
                          style={styles.vehicleImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageZoomBadge}>
                          <AppIcon
                            family="material"
                            name="magnify-plus-outline"
                            size={13}
                            color="#FFFFFF"
                          />
                        </View>
                      </>
                    ) : (
                      <AppIcon
                        family="material"
                        name="ambulance"
                        size={40}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })()}
            </View>

            {/* ================= DOCUMENTS ================= */}

            <Text style={styles.sectionHeading} numberOfLines={1}>
              Documents
            </Text>

            <View style={styles.documentsCard}>
              {documents.map((document, index) => {
                const statusColors = getStatusColors(document.status);

                return (
                  <TouchableOpacity
                    key={document.title}
                    activeOpacity={document.imageUrl ? 0.7 : 1}
                    disabled={!document.imageUrl}
                    onPress={() => {
                      if (document.imageUrl) {
                        setSelectedImage({
                          uri: document.imageUrl,
                          title: document.title,
                          subtitle: document.subtitle || `Status: ${document.status}`,
                        });
                      }
                    }}
                    style={[
                      styles.documentRow,
                      index === documents.length - 1 && styles.lastDocumentRow,
                    ]}
                  >
                    {/* ICON / THUMBNAIL */}

                    <View style={styles.documentIcon}>
                      {document.imageUrl ? (
                        <View style={styles.thumbnailWrapper}>
                          <Image
                            source={{ uri: document.imageUrl }}
                            style={styles.documentThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.thumbnailZoomBadge}>
                            <AppIcon
                              family="material"
                              name="eye-outline"
                              size={10}
                              color="#FFFFFF"
                            />
                          </View>
                        </View>
                      ) : (
                        <AppIcon
                          family="material"
                          name={document.icon}
                          size={18}
                          color={colors.primary}
                        />
                      )}
                    </View>

                    {/* DOCUMENT INFO */}

                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName} numberOfLines={1}>
                        {document.title}
                      </Text>

                      {document.subtitle && (
                        <Text style={styles.documentSubtitle} numberOfLines={1}>
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
                        name={statusColors.icon}
                        size={12}
                        color={statusColors.text}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {document.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* ================= IMAGE VIEWER MODAL ================= */}
      <ImageViewerModal
        visible={Boolean(selectedImage)}
        imageUrl={selectedImage?.uri}
        title={selectedImage?.title}
        subtitle={selectedImage?.subtitle}
        onClose={() => setSelectedImage(null)}
      />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // =====================================================
  // VEHICLE CARD
  // =====================================================

  vehicleCard: {
    height: 110,
    backgroundColor: colors.primaryLight,

    borderRadius: 20,

    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 12,

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
    lineHeight: 12,
    includeFontPadding: false,
    color: colors.textLight,
    letterSpacing: 0.6,

    marginBottom: 4,
  },

  vehicleNumber: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.sm,
    lineHeight: 16,
    includeFontPadding: false,
    color: colors.textPrimary,
    letterSpacing: 0.2,

    marginBottom: 3,
  },

  vehicleName: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    lineHeight: 14,
    includeFontPadding: false,
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
    position: 'relative',
  },

  imageZoomBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // DOCUMENTS CARD
  // =====================================================

  documentsCard: {
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
  // DOCUMENT ROW
  // =====================================================

  documentRow: {
    height: 56,

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

    marginRight: 10,
  },

  documentInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },

  documentName: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    lineHeight: 14,
    includeFontPadding: false,
    color: colors.textPrimary,

    marginBottom: 2,
  },

  documentSubtitle: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 10,
    lineHeight: 12,
    includeFontPadding: false,
    color: colors.textLight,
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusPill: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,

    paddingHorizontal: 9,

    borderRadius: 10,
  },

  statusText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 10,
    lineHeight: 12,
    includeFontPadding: false,
    letterSpacing: 0.2,
  },

  docStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },

  docStatusText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 9,
    lineHeight: 11,
    includeFontPadding: false,
    letterSpacing: 0.3,
  },

  documentThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  thumbnailWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  thumbnailZoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});