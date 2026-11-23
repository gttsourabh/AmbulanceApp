import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { colors } from '../../theme';
import { AppIcon } from '../../icons';

export interface GpsInfoModalProps {
    visible: boolean;
    gpsStatus: 'locked' | 'acquiring' | 'disabled';
    coords: { lat: number; lng: number } | null;
    onClose: () => void;
    onEnableGps?: () => void;
}

const GpsInfoModal: React.FC<GpsInfoModalProps> = ({
    visible,
    gpsStatus,
    coords,
    onClose,
    onEnableGps,
}) => {
    const isLocked = gpsStatus === 'locked';
    const isAcquiring = gpsStatus === 'acquiring';
    const isDisabled = gpsStatus === 'disabled';

    const latStr = coords?.lat ? coords.lat.toFixed(5) : null;
    const lngStr = coords?.lng ? coords.lng.toFixed(5) : null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* TOP HEADER ROW WITH CLOSE BUTTON */}
                    <View style={styles.topHeaderRow}>
                        <View style={styles.headerSpacer} />
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppIcon
                                family="material"
                                name="close"
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* STATUS ICON BADGE */}
                        <View
                            style={[
                                styles.iconCircle,
                                isLocked
                                    ? styles.iconCircleActive
                                    : isAcquiring
                                    ? styles.iconCircleAcquiring
                                    : styles.iconCircleInactive,
                            ]}
                        >
                            <AppIcon
                                family="material"
                                name={
                                    isLocked
                                        ? 'map-marker-check'
                                        : isAcquiring
                                        ? 'crosshairs'
                                        : 'map-marker-alert'
                                }
                                size={38}
                                color={
                                    isLocked
                                        ? '#16A34A'
                                        : isAcquiring
                                        ? '#D97706'
                                        : '#DC2626'
                                }
                            />
                        </View>

                        {/* STATUS TITLE */}
                        <Text style={styles.modalTitle}>
                            {isLocked
                                ? 'GPS Location Active'
                                : isAcquiring
                                ? 'Acquiring GPS Signal...'
                                : 'GPS Location Inactive'}
                        </Text>

                        {/* STATUS PILL */}
                        <View
                            style={[
                                styles.statusPill,
                                isLocked
                                    ? styles.statusPillActive
                                    : isAcquiring
                                    ? styles.statusPillAcquiring
                                    : styles.statusPillInactive,
                            ]}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    {
                                        backgroundColor: isLocked
                                            ? '#16A34A'
                                            : isAcquiring
                                            ? '#D97706'
                                            : '#DC2626',
                                    },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.statusPillText,
                                    {
                                        color: isLocked
                                            ? '#15803D'
                                            : isAcquiring
                                            ? '#B45309'
                                            : '#B91C1C',
                                    },
                                ]}
                            >
                                {isLocked
                                    ? 'Online & Streaming Location'
                                    : isAcquiring
                                    ? 'Searching For GPS Fix'
                                    : 'Device Location Disabled'}
                            </Text>
                        </View>

                        {/* STATUS DESCRIPTION */}
                        <Text style={styles.statusDescription}>
                            {isLocked
                                ? 'Your vehicle coordinates are locked and streaming live to the central dispatch system.'
                                : isAcquiring
                                ? 'Your device is currently locking GPS satellites and network towers. Real-time accuracy will stabilize momentarily.'
                                : 'Location services (GPS) are turned off or restricted. Turn on GPS to receive nearby emergency dispatches.'}
                        </Text>

                        {/* LIVE COORDINATES CARD (IF AVAILABLE) */}
                        {latStr && lngStr && (
                            <View style={styles.coordinatesCard}>
                                <View style={styles.coordinatesHeader}>
                                    <AppIcon
                                        family="material"
                                        name="crosshairs-gps"
                                        size={16}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.coordinatesHeaderText}>
                                        Current Vehicle Coordinates
                                    </Text>
                                </View>
                                <View style={styles.coordinatesRow}>
                                    <View style={styles.coordBox}>
                                        <Text style={styles.coordLabel}>LATITUDE</Text>
                                        <Text style={styles.coordValue}>{latStr}°</Text>
                                    </View>
                                    <View style={styles.coordDivider} />
                                    <View style={styles.coordBox}>
                                        <Text style={styles.coordLabel}>LONGITUDE</Text>
                                        <Text style={styles.coordValue}>{lngStr}°</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* WHY IS GPS SHOWN & REQUIRED? */}
                        <View style={styles.infoSection}>
                            <View style={styles.infoSectionHeader}>
                                <AppIcon
                                    family="material"
                                    name="information-outline"
                                    size={18}
                                    color={colors.primary}
                                />
                                <Text style={styles.infoSectionTitle}>
                                    Why is GPS location required?
                                </Text>
                            </View>

                            <View style={styles.infoList}>
                                <View style={styles.infoItem}>
                                    <View style={styles.infoItemIconCircle}>
                                        <AppIcon
                                            family="material"
                                            name="ambulance"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.infoItemTextCol}>
                                        <Text style={styles.infoItemHeading}>
                                            Emergency Dispatch & Allocation
                                        </Text>
                                        <Text style={styles.infoItemDesc}>
                                            Allows dispatchers to assign critical emergency cases to the closest available ambulance.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoItem}>
                                    <View style={styles.infoItemIconCircle}>
                                        <AppIcon
                                            family="material"
                                            name="timer-outline"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.infoItemTextCol}>
                                        <Text style={styles.infoItemHeading}>
                                            Live ETA for Patients & Hospitals
                                        </Text>
                                        <Text style={styles.infoItemDesc}>
                                            Patients in distress and emergency medical teams receive accurate live arrival times.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoItem}>
                                    <View style={styles.infoItemIconCircle}>
                                        <AppIcon
                                            family="material"
                                            name="navigation-variant"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.infoItemTextCol}>
                                        <Text style={styles.infoItemHeading}>
                                            Turn-by-Turn Route Navigation
                                        </Text>
                                        <Text style={styles.infoItemDesc}>
                                            Guides you via the fastest route to pickup patients and handover at the hospital.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoItem}>
                                    <View style={styles.infoItemIconCircle}>
                                        <AppIcon
                                            family="material"
                                            name="shield-check"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.infoItemTextCol}>
                                        <Text style={styles.infoItemHeading}>
                                            Driver & Crew Safety
                                        </Text>
                                        <Text style={styles.infoItemDesc}>
                                            Enables central fleet supervision and immediate roadside support during trips.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* ACTION BUTTONS */}
                        {isDisabled && onEnableGps ? (
                            <TouchableOpacity
                                style={styles.enableGpsButton}
                                activeOpacity={0.85}
                                onPress={() => {
                                    onClose();
                                    onEnableGps();
                                }}
                            >
                                <AppIcon
                                    family="material"
                                    name="crosshairs-gps"
                                    size={18}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.enableGpsButtonText}>
                                    Turn On Device GPS
                                </Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.closeActionButton,
                                isDisabled && onEnableGps ? styles.secondaryCloseButton : null,
                            ]}
                            activeOpacity={0.8}
                            onPress={onClose}
                        >
                            <Text
                                style={[
                                    styles.closeActionButtonText,
                                    isDisabled && onEnableGps ? styles.secondaryCloseButtonText : null,
                                ]}
                            >
                                {isDisabled && onEnableGps ? 'Dismiss' : 'Got It'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default React.memo(GpsInfoModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    modalCard: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 8,
    },
    topHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerSpacer: {
        width: 32,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 4,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconCircleActive: {
        backgroundColor: '#DCFCE7',
        borderWidth: 2,
        borderColor: '#86EFAC',
    },
    iconCircleAcquiring: {
        backgroundColor: '#FEF3C7',
        borderWidth: 2,
        borderColor: '#FCD34D',
    },
    iconCircleInactive: {
        backgroundColor: '#FEE2E2',
        borderWidth: 2,
        borderColor: '#FCA5A5',
    },
    modalTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 19,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 6,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        marginBottom: 10,
    },
    statusPillActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
    },
    statusPillAcquiring: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FCD34D',
    },
    statusPillInactive: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusPillText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
    },
    statusDescription: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 13,
        lineHeight: 18,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    coordinatesCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 16,
    },
    coordinatesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    coordinatesHeaderText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        color: colors.primary,
        letterSpacing: 0.3,
    },
    coordinatesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    coordBox: {
        flex: 1,
        alignItems: 'center',
    },
    coordLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,
        color: colors.textLight,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    coordValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: colors.textPrimary,
    },
    coordDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E2E8F0',
    },
    infoSection: {
        width: '100%',
        backgroundColor: '#F0F9FF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        padding: 14,
        marginBottom: 18,
    },
    infoSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    infoSectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        color: '#0369A1',
    },
    infoList: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoItemIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    infoItemTextCol: {
        flex: 1,
    },
    infoItemHeading: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12.5,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    infoItemDesc: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11.5,
        lineHeight: 16,
        color: colors.textSecondary,
    },
    enableGpsButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 13,
        borderRadius: 12,
        marginBottom: 10,
    },
    enableGpsButtonText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    closeActionButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.primary,
    },
    closeActionButtonText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    secondaryCloseButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    secondaryCloseButtonText: {
        color: colors.textSecondary,
    },
});
