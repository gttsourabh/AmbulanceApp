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
    estimatedEarnings?: string | number;
    destination?: string;
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

    const lat = parseFloat(
        payloadObj.LAT ?? payloadObj.lat ?? payloadObj.latitude ?? payloadObj.pickup_latitude ?? payloadObj.pickupLatitude ?? '0'
    );
    const lng = parseFloat(
        payloadObj.LNG ?? payloadObj.lng ?? payloadObj.longitude ?? payloadObj.pickup_longitude ?? payloadObj.pickupLongitude ?? '0'
    );
    const rawRequestId =
        payloadObj.REQUEST_ID ?? payloadObj.request_id ?? payloadObj.requestId ?? payloadObj.id ?? payloadObj.trip_id ?? payloadObj.tripId ?? 0;

    const rawPatientName =
        payloadObj.PATIENT_NAME ?? payloadObj.patient_name ?? payloadObj.patientName ?? payloadObj.name ?? payloadObj.user_name ?? payloadObj.userName;

    const rawContactNo =
        payloadObj.CONTACT_NO ?? payloadObj.contact_no ?? payloadObj.contactNo ?? payloadObj.phone ?? payloadObj.phone_number ?? payloadObj.phoneNumber ?? payloadObj.mobile;

    const rawAddress =
        payloadObj.ADDRESS ?? payloadObj.address ?? payloadObj.pickup_address ?? payloadObj.pickupAddress ?? payloadObj.pickup_location ?? payloadObj.pickupLocation ?? payloadObj.location;

    const rawEmergencyType =
        payloadObj.EMERGENCY_TYPE ?? payloadObj.emergency_type ?? payloadObj.emergencyType ?? payloadObj.type;

    const rawEarnings =
        payloadObj.ESTIMATED_EARNINGS ?? payloadObj.estimated_earnings ?? payloadObj.estimatedEarnings ?? payloadObj.FARE ?? payloadObj.fare ?? payloadObj.AMOUNT ?? payloadObj.amount;

    const rawDestination =
        payloadObj.DESTINATION ?? payloadObj.destination ?? payloadObj.HOSPITAL_NAME ?? payloadObj.hospital_name ?? payloadObj.hospitalName ?? payloadObj.drop_location ?? payloadObj.dropLocation ?? payloadObj.drop_address ?? payloadObj.dropAddress;

    return {
        requestId: typeof rawRequestId === 'number' ? rawRequestId : parseInt(String(rawRequestId), 10) || 0,
        patientName: rawPatientName ? String(rawPatientName) : 'Emergency Patient',
        contactNo: rawContactNo ? String(rawContactNo) : '',
        latitude: isNaN(lat) ? 0 : lat,
        longitude: isNaN(lng) ? 0 : lng,
        address: rawAddress ? String(rawAddress) : 'Pickup location not specified',
        emergencyType: rawEmergencyType ? String(rawEmergencyType) : 'Medical',
        ambulanceTrip: true,
        estimatedEarnings: rawEarnings ? String(rawEarnings) : undefined,
        destination: rawDestination ? String(rawDestination) : 'Nearest Emergency Hospital',
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

    const openEmergencyModal = (showCircularAlert: boolean = false) => {
        const navParams = {
            requestData: emergencyData,
            showCircularAlert: showCircularAlert,
        };

        if (navigationRef.isReady()) {
            navigate('IncomingRequests', navParams);
        } else {
            // If navigation container isn't ready yet (e.g. app cold-booting), retry shortly
            const retryInterval = setInterval(() => {
                if (navigationRef.isReady()) {
                    clearInterval(retryInterval);
                    navigate('IncomingRequests', navParams);
                }
            }, 300);
            setTimeout(() => clearInterval(retryInterval), 5000);
        }
    };

    if (isForeground) {
        // Automatically present IncomingRequests with the custom circular emergency alert on top
        openEmergencyModal(true);
    } else {
        // Background notification tap or cold-launch tap
        openEmergencyModal(false);
    }

    return true;
}
