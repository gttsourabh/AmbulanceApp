import React, { useEffect, useState, useCallback } from 'react';
import {
    AppState,
    AppStateStatus,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { colors, typography } from '../../theme';
import { AppIcon } from '../../icons';
import {
    AppPermissionsStatus,
    checkAllPermissions,
    requestAllPermissionsSequentially,
    openAppSettings,
} from '../../utils/locationPermission';

export interface PermissionModalProps {
    visible: boolean;
    status: AppPermissionsStatus | null;
    onClose: () => void;
    onPermissionsUpdated?: (status: AppPermissionsStatus) => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
    visible,
    status,
    onClose,
    onPermissionsUpdated,
}) => {
    const [currentStatus, setCurrentStatus] = useState<AppPermissionsStatus | null>(status);
    const [isRequesting, setIsRequesting] = useState(false);
    const [hasAttemptedRequest, setHasAttemptedRequest] = useState(false);

    // Keep internal status synchronized with prop
    useEffect(() => {
        if (status) {
            setCurrentStatus(status);
        }
    }, [status]);

    // Re-check permissions when returning from Settings or background
    const handleRecheck = useCallback(async () => {
        const updated = await checkAllPermissions();
        setCurrentStatus(updated);
        onPermissionsUpdated?.(updated);
        if (updated.allGranted) {
            onClose();
        }
    }, [onClose, onPermissionsUpdated]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            if (nextState === 'active' && visible) {
                handleRecheck();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [visible, handleRecheck]);

    const handleGrantPress = async () => {
        setIsRequesting(true);
        setHasAttemptedRequest(true);

        try {
            const updated = await requestAllPermissionsSequentially();
            setCurrentStatus(updated);
            onPermissionsUpdated?.(updated);

            if (updated.allGranted) {
                onClose();
            } else if (!updated.backgroundLocation && updated.foregroundLocation) {
                // On Android 11+, Background Location requires manual selection of "Allow all the time" in Settings
                openAppSettings();
            }
        } catch (err) {
            console.warn('Error during permission grant flow:', err);
        } finally {
            setIsRequesting(false);
        }
    };

    const isFgGranted = Boolean(currentStatus?.foregroundLocation);
    const isBgGranted = Boolean(currentStatus?.backgroundLocation);
    const isNotifGranted = Boolean(currentStatus?.notifications);

    // If foreground is already granted but background is still missing after an attempt, guide to Settings
    const isSettingsPrompt = isFgGranted && !isBgGranted && hasAttemptedRequest;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* ICON HEADER */}
                        <View style={styles.headerIconWrapper}>
                            <View style={styles.headerIconCircle}>
                                <AppIcon
                                    family="material"
                                    name="shield-alert-outline"
                                    size={36}
                                    color={colors.primary}
                                />
                            </View>
                        </View>

                        {/* TITLE & SUBTITLE */}
                        <Text style={styles.modalTitle}>
                            Permissions Required
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            To receive emergency dispatches and track active ambulance trips, AmbulanceApp requires the following permissions:
                        </Text>

                        {/* GOOGLE PLAY PROMINENT BACKGROUND DISCLOSURE BOX */}
                        <View style={styles.disclosureBox}>
                            <View style={styles.disclosureHeader}>
                                <AppIcon
                                    family="material"
                                    name="information-outline"
                                    size={16}
                                    color={colors.primaryDark}
                                />
                                <Text style={styles.disclosureHeaderText}>
                                    Prominent Location Disclosure
                                </Text>
                            </View>
                            <Text style={styles.disclosureBodyText}>
                                AmbulanceApp collects and shares your location data even when the app is closed or not in use to enable real-time emergency dispatch and active trip tracking for patients.
                            </Text>
                        </View>

                        {/* PERMISSION ITEMS */}
                        <View style={styles.itemsList}>
                            {/* 1. Precise Location */}
                            <View style={styles.permissionItem}>
                                <View style={[styles.itemIconCircle, isFgGranted && styles.itemIconCircleGranted]}>
                                    <AppIcon
                                        family="material"
                                        name="map-marker"
                                        size={20}
                                        color={isFgGranted ? colors.successDark : colors.primary}
                                    />
                                </View>
                                <View style={styles.itemTextContainer}>
                                    <Text style={styles.itemTitle}>Precise Location (GPS)</Text>
                                    <Text style={styles.itemDescription}>
                                        Used for turn-by-turn navigation to patient pickup and hospital dropoff.
                                    </Text>
                                </View>
                                <View style={[styles.badge, isFgGranted ? styles.badgeGranted : styles.badgeMissing]}>
                                    <Text style={[styles.badgeText, isFgGranted ? styles.badgeTextGranted : styles.badgeTextMissing]}>
                                        {isFgGranted ? 'Granted' : 'Required'}
                                    </Text>
                                </View>
                            </View>

                            {/* 2. Background Location */}
                            <View style={styles.permissionItem}>
                                <View style={[styles.itemIconCircle, isBgGranted && styles.itemIconCircleGranted]}>
                                    <AppIcon
                                        family="material"
                                        name="crosshairs-gps"
                                        size={20}
                                        color={isBgGranted ? colors.successDark : colors.primary}
                                    />
                                </View>
                                <View style={styles.itemTextContainer}>
                                    <Text style={styles.itemTitle}>Background Location</Text>
                                    <Text style={styles.itemDescription}>
                                        Select "Allow all the time" so patients can track your incoming ambulance.
                                    </Text>
                                </View>
                                <View style={[styles.badge, isBgGranted ? styles.badgeGranted : styles.badgeMissing]}>
                                    <Text style={[styles.badgeText, isBgGranted ? styles.badgeTextGranted : styles.badgeTextMissing]}>
                                        {isBgGranted ? 'Granted' : 'Required'}
                                    </Text>
                                </View>
                            </View>

                            {/* 3. Notifications */}
                            <View style={styles.permissionItem}>
                                <View style={[styles.itemIconCircle, isNotifGranted && styles.itemIconCircleGranted]}>
                                    <AppIcon
                                        family="material"
                                        name="bell-ring"
                                        size={20}
                                        color={isNotifGranted ? colors.successDark : colors.primary}
                                    />
                                </View>
                                <View style={styles.itemTextContainer}>
                                    <Text style={styles.itemTitle}>Emergency Notifications</Text>
                                    <Text style={styles.itemDescription}>
                                        Alerts you instantly with sirens when an emergency trip is assigned to you.
                                    </Text>
                                </View>
                                <View style={[styles.badge, isNotifGranted ? styles.badgeGranted : styles.badgeMissing]}>
                                    <Text style={[styles.badgeText, isNotifGranted ? styles.badgeTextGranted : styles.badgeTextMissing]}>
                                        {isNotifGranted ? 'Granted' : 'Required'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* HELPER HINT FOR BACKGROUND LOCATION */}
                        {isSettingsPrompt && (
                            <View style={styles.settingsHintBox}>
                                <Text style={styles.settingsHintText}>
                                    👉 Tap below to open Settings, choose <Text style={styles.boldText}>Permissions</Text> → <Text style={styles.boldText}>Location</Text>, and select <Text style={styles.boldText}>"Allow all the time"</Text>.
                                </Text>
                            </View>
                        )}

                        {/* ACTION BUTTONS */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            activeOpacity={0.85}
                            disabled={isRequesting}
                            onPress={isSettingsPrompt ? openAppSettings : handleGrantPress}
                        >
                            <AppIcon
                                family="material"
                                name={isSettingsPrompt ? "cog" : "check-circle"}
                                size={18}
                                color="#FFFFFF"
                            />
                            <Text style={styles.primaryButtonText}>
                                {isRequesting
                                    ? 'Requesting...'
                                    : isSettingsPrompt
                                    ? 'Open Settings to Allow All the Time'
                                    : 'Grant Permissions'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            activeOpacity={0.7}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Not Now (Stay Offline)
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default React.memo(PermissionModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    modalCard: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: colors.card,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 10,
    },
    scrollContent: {
        alignItems: 'center',
        width: '100%',
    },
    headerIconWrapper: {
        marginBottom: 12,
    },
    headerIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 20,
        lineHeight: 26,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 6,
    },
    modalSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 13,
        lineHeight: 18,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    disclosureBox: {
        width: '100%',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    disclosureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    disclosureHeaderText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 12,
        color: colors.primaryDark,
    },
    disclosureBodyText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11.5,
        lineHeight: 16,
        color: '#166534',
    },
    itemsList: {
        width: '100%',
        gap: 12,
        marginBottom: 16,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 12,
        gap: 10,
    },
    itemIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemIconCircleGranted: {
        backgroundColor: colors.successLight,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    itemDescription: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 15,
        color: colors.textSecondary,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeGranted: {
        backgroundColor: '#DCFCE7',
    },
    badgeMissing: {
        backgroundColor: '#FEE2E2',
    },
    badgeText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    badgeTextGranted: {
        color: '#15803D',
    },
    badgeTextMissing: {
        color: '#B91C1C',
    },
    settingsHintBox: {
        width: '100%',
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 10,
        padding: 10,
        marginBottom: 14,
    },
    settingsHintText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11.5,
        lineHeight: 16,
        color: '#92400E',
    },
    boldText: {
        fontFamily: 'GoogleSans-Bold',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 8,
    },
    primaryButtonText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: '#FFFFFF',
    },
    secondaryButton: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12.5,
        color: colors.textLight,
    },
});
