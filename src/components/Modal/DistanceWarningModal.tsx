import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../theme';
import { AppIcon } from '../../icons';

interface DistanceWarningModalProps {
    visible: boolean;
    distanceMeters: number;
    destinationName?: string;
    thresholdMeters?: number;
    onProceedAnyway: () => void;
    onCancel: () => void;
}

const DistanceWarningModal: React.FC<DistanceWarningModalProps> = ({
    visible,
    distanceMeters,
    destinationName = 'Destination',
    thresholdMeters = 300,
    onProceedAnyway,
    onCancel,
}) => {
    const formattedDistance = React.useMemo(() => {
        if (!distanceMeters || isNaN(distanceMeters)) return '0 m';
        if (distanceMeters < 1000) {
            return `${Math.round(distanceMeters)} m`;
        }
        return `${(distanceMeters / 1000).toFixed(1)} km`;
    }, [distanceMeters]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* WARNING ICON BADGE */}
                    <View style={styles.iconCircle}>
                        <AppIcon
                            family="material"
                            name="map-marker-alert"
                            size={36}
                            color="#EA580C"
                        />
                    </View>

                    {/* TITLE */}
                    <Text style={styles.title}>Distance Warning</Text>

                    {/* DESTINATION LABEL */}
                    {destinationName ? (
                        <Text style={styles.destinationName} numberOfLines={2}>
                            {destinationName}
                        </Text>
                    ) : null}

                    {/* DISTANCE BADGE */}
                    <View style={styles.distanceBadge}>
                        <AppIcon
                            family="material"
                            name="navigation-variant"
                            size={16}
                            color="#EA580C"
                        />
                        <Text style={styles.distanceBadgeText}>
                            {formattedDistance} away
                        </Text>
                        <Text style={styles.distanceLimitText}>
                            (Limit: {thresholdMeters}m)
                        </Text>
                    </View>

                    {/* MESSAGE */}
                    <Text style={styles.message}>
                        You are currently more than {thresholdMeters} meters away from the destination. Are you sure you have arrived?
                    </Text>

                    {/* ACTION BUTTONS */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.proceedButton}
                            onPress={onProceedAnyway}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.proceedButtonText}>Proceed Anyway</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default React.memo(DistanceWarningModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.card || '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFF7ED',
        borderWidth: 1.5,
        borderColor: '#FFEDD5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 20,
        color: colors.textPrimary || '#1E293B',
        textAlign: 'center',
        marginBottom: 6,
    },
    destinationName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        color: colors.textSecondary || '#64748B',
        textAlign: 'center',
        marginBottom: 14,
        paddingHorizontal: 8,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginBottom: 16,
        gap: 6,
    },
    distanceBadgeText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 14,
        color: '#EA580C',
    },
    distanceLimitText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        color: '#9A3412',
    },
    message: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 14,
        lineHeight: 20,
        color: colors.textPrimary || '#334155',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cancelButtonText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 15,
        color: '#475569',
    },
    proceedButton: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: colors.primary || '#267583',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary || '#267583',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    proceedButtonText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 15,
        color: '#FFFFFF',
    },
});
