import { Alert } from 'react-native';
import { navigate, navigationRef } from './navigationRef';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/storageKeys';

export interface EmergencyTripData {
    requestId: number;
    patientName: string;
    contactNo: string;
    latitude: number;
    longitude: number;
    address: string;
    emergencyType: string;
    ambulanceTrip: boolean;
    raw?: any;
}

/**
 * Parses notification data payload, checks if AMBULANCE_TRIP is "True",
 * and returns normalized EmergencyTripData or null.
 */
export function parseEmergencyTripPayload(data: any): EmergencyTripData | null {
    if (!data) return null;

    let payloadObj: any = null;

    // Check if data5 is present and is a JSON string or object
    if (data.data5) {
        try {
            payloadObj = typeof data.data5 === 'string' ? JSON.parse(data.data5) : data.data5;
        } catch (e) {
            console.warn('⚠️ [FCM PARSER] Failed to parse data5 JSON string:', e);
        }
    }

    // Fallback: Check if payload fields are directly in data
    if (!payloadObj) {
        payloadObj = data;
    }

    // Check for AMBULANCE_TRIP === "True" (case-insensitive)
    const tripFlag =
        payloadObj?.AMBULANCE_TRIP ??
        payloadObj?.ambulance_trip ??
        payloadObj?.ambulanceTrip ??
        data?.AMBULANCE_TRIP;

    const isAmbulanceTrip =
        String(tripFlag).trim().toLowerCase() === 'true';

    if (!isAmbulanceTrip) {
        return null;
    }

    const lat = parseFloat(payloadObj.LAT ?? payloadObj.lat ?? payloadObj.latitude ?? '0');
    const lng = parseFloat(payloadObj.LNG ?? payloadObj.lng ?? payloadObj.longitude ?? '0');
    const rawRequestId = payloadObj.REQUEST_ID ?? payloadObj.requestId ?? 0;

    return {
        requestId: typeof rawRequestId === 'number' ? rawRequestId : parseInt(String(rawRequestId), 10) || 0,
        patientName: payloadObj.PATIENT_NAME ?? payloadObj.patientName ?? 'Emergency Patient',
        contactNo: String(payloadObj.CONTACT_NO ?? payloadObj.contactNo ?? ''),
        latitude: isNaN(lat) ? 0 : lat,
        longitude: isNaN(lng) ? 0 : lng,
        address: payloadObj.ADDRESS ?? payloadObj.address ?? 'Pickup location not specified',
        emergencyType: payloadObj.EMERGENCY_TYPE ?? payloadObj.emergencyType ?? 'Medical',
        ambulanceTrip: true,
        raw: payloadObj,
    };
}

/**
 * Handles incoming emergency trip notification:
 * 1. Parses emergency data.
 * 2. Caches pending request in AsyncStorage.
 * 3. Shows foreground alert / notification with provided data.
 * 4. Navigates to IncomingRequests modal screen.
 */
export async function handleEmergencyTripNotification(
    remoteMessage: any,
    isForeground: boolean = false
): Promise<boolean> {
    const data = remoteMessage?.data || remoteMessage;
    const emergencyData = parseEmergencyTripPayload(data);

    if (!emergencyData) {
        return false;
    }

    console.log('🚨 [EMERGENCY TRIP DETECTED]:', emergencyData);

    // Cache latest pending emergency request in local storage
    await storage.set(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST, emergencyData);

    const openEmergencyModal = () => {
        if (navigationRef.isReady()) {
            navigate('IncomingRequests', {
                requestData: emergencyData,
            });
        } else {
            // If navigation container isn't ready yet (e.g. app cold-booting), retry shortly
            const retryInterval = setInterval(() => {
                if (navigationRef.isReady()) {
                    clearInterval(retryInterval);
                    navigate('IncomingRequests', {
                        requestData: emergencyData,
                    });
                }
            }, 300);
            setTimeout(() => clearInterval(retryInterval), 5000);
        }
    };

    if (isForeground) {
        // Show emergency alert notification with the provided data
        Alert.alert(
            `🚨 EMERGENCY TRIP: ${emergencyData.emergencyType.toUpperCase()}`,
            `Patient: ${emergencyData.patientName}\n` +
            `Address: ${emergencyData.address}\n` +
            `Contact: ${emergencyData.contactNo}`,
            [
                {
                    text: 'Dismiss',
                    style: 'cancel',
                },
                {
                    text: 'View Request',
                    onPress: openEmergencyModal,
                },
            ],
            { cancelable: false }
        );

        // Also automatically present the modal bottom sheet
        openEmergencyModal();
    } else {
        // Background tap or cold-launch tap
        openEmergencyModal();
    }

    return true;
}
