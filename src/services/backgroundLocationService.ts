import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import { updateDriverLocation, UpdateDriverLocationPayload, TripNavigationType } from '../api/driverApi';
import { requestNotificationPermission } from '../utils/locationPermission';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/storageKeys';

// Globally configure Geolocation for headless & killed-app background service:
// - skipPermissionRequests: prevents PermissionsModule from crashing when Activity is null (app killed)
// - locationProvider: 'playServices' uses Google Play Services FusedLocationProviderClient (reliable in background)
Geolocation.setRNConfiguration({
    skipPermissionRequests: true,
    locationProvider: 'playServices',
});

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

let latestCoordsGetter: (() => { latitude: number; longitude: number } | null) | null = null;
let currentTrackingType: TripNavigationType = 'np';

/**
 * Robust GPS position fetcher that works when app is killed or running headless.
 * 1. Tries high-accuracy GPS (FusedLocationProvider) with 10s timeout.
 * 2. If satellites are slow/screen locked, gracefully falls back to balanced/cached location.
 */
const getFreshGpsPosition = async (): Promise<{ latitude: number; longitude: number } | null> => {
    const highAccuracyPromise = new Promise<{ latitude: number; longitude: number } | null>(resolve => {
        Geolocation.getCurrentPosition(
            pos => {
                if (pos?.coords?.latitude && pos?.coords?.longitude) {
                    resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                } else {
                    resolve(null);
                }
            },
            err => {
                console.warn('Background Geolocation high-accuracy notice:', err?.message || err);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 10000,
            }
        );
    });

    const highAccuracyResult = await highAccuracyPromise;
    if (highAccuracyResult) {
        return highAccuracyResult;
    }

    // Fallback: standard accuracy (network / fused provider) with 30s cache tolerance
    return new Promise(resolve => {
        Geolocation.getCurrentPosition(
            pos => {
                if (pos?.coords?.latitude && pos?.coords?.longitude) {
                    resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                } else {
                    resolve(null);
                }
            },
            err => {
                console.warn('Background Geolocation fallback notice:', err?.message || err);
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 6000,
                maximumAge: 30000,
            }
        );
    });
};

const backgroundTask = async (taskDataArguments?: any) => {
    // Retrieve trip params or recover from persistent storage (crucial when app is swiped away / killed)
    let cachedTrip: { ambulanceRequestId?: number; driverId?: number; type?: TripNavigationType } | null = null;
    try {
        cachedTrip = await storage.get<{ ambulanceRequestId?: number; driverId?: number; type?: TripNavigationType }>(
            STORAGE_KEYS.ACTIVE_BACKGROUND_TRIP
        );
    } catch {
        cachedTrip = null;
    }

    const ambulanceRequestId = taskDataArguments?.ambulance_request_id || cachedTrip?.ambulanceRequestId || 5;
    const driverId = taskDataArguments?.driver_id || cachedTrip?.driverId || 4;
    const initialType: TripNavigationType = taskDataArguments?.type || cachedTrip?.type || currentTrackingType || 'np';
    if (taskDataArguments?.type) {
        currentTrackingType = taskDataArguments.type;
    }

    console.log('🚀 [JS BACKGROUND SERVICE TASK STARTED] Type:', currentTrackingType, '| RequestId:', ambulanceRequestId, '| DriverId:', driverId);

    while (BackgroundService.isRunning()) {
        try {
            // 1. Get coordinates from active in-app ref (if UI alive) or fetch fresh GPS (if killed)
            let coords = null;
            if (latestCoordsGetter) {
                try {
                    coords = latestCoordsGetter();
                } catch {
                    coords = null;
                }
            }

            if (!coords || !coords.latitude || !coords.longitude) {
                coords = await getFreshGpsPosition();
            }

            if (coords && coords.latitude && coords.longitude) {
                const tripType = currentTrackingType || initialType;
                const payload: UpdateDriverLocationPayload = {
                    ambulance_request_id: ambulanceRequestId,
                    driver_id: driverId,
                    latitude: Number(coords.latitude.toFixed(6)),
                    longitude: Number(coords.longitude.toFixed(6)),
                    type: tripType,
                };

                console.log(
                    `📍 [JS BACKGROUND LIVE GPS (Every 10s)] -> Lat: ${payload.latitude}, Lng: ${payload.longitude}, Type: ${payload.type}`
                );

                const response = await updateDriverLocation(payload);
                console.log('✅ [JS BACKGROUND LOCATION UPDATE SUCCESS] Response:', response.data);
            } else {
                console.warn('⚠️ [JS BACKGROUND LOCATION] GPS position not yet available, skipping this cycle');
            }
        } catch (error: any) {
            console.warn(
                '❌ [JS BACKGROUND LOCATION UPDATE FAILED]:',
                error?.response?.data || error?.message || error
            );
        }

        // Wait 10 seconds before next sync
        await sleep(10000);
    }

    console.log('🛑 [JS BACKGROUND SERVICE TASK STOPPED]');
};

export interface BackgroundTrackingOptions {
    ambulanceRequestId?: number;
    driverId?: number;
    type?: TripNavigationType;
    getCoordinates?: () => { latitude: number; longitude: number } | null;
}

/**
 * Updates the navigation tracking type dynamically ('np' = nav to patient, 'ph' = patient to hospital).
 */
export function updateTrackingType(type: TripNavigationType) {
    currentTrackingType = type;
    storage.get<any>(STORAGE_KEYS.ACTIVE_BACKGROUND_TRIP).then(cached => {
        if (cached) {
            storage.set(STORAGE_KEYS.ACTIVE_BACKGROUND_TRIP, { ...cached, type });
        }
    }).catch(() => {});
}

/**
 * Starts the JavaScript Background Foreground Service with a persistent status-bar notification.
 * 100% pure JavaScript implementation with zero native code dependencies.
 */
export async function startBackgroundLocationTracking(options?: BackgroundTrackingOptions) {
    if (options?.type) {
        currentTrackingType = options.type;
    }

    if (options?.getCoordinates) {
        latestCoordsGetter = options.getCoordinates;
    }

    // Persist active trip parameters so they survive if the app is closed/killed
    await storage.set(STORAGE_KEYS.ACTIVE_BACKGROUND_TRIP, {
        ambulanceRequestId: options?.ambulanceRequestId || 5,
        driverId: options?.driverId || 4,
        type: options?.type || currentTrackingType || 'np',
    });

    if (BackgroundService.isRunning()) {
        console.log(`ℹ️ JS Background location tracking is already running. Updated tracking type to: ${currentTrackingType}`);
        return;
    }

    try {
        // Ensure notification permission is granted on Android 13+
        await requestNotificationPermission();

        const taskOptions = {
            taskName: 'AmbulanceLiveNavigation',
            taskTitle: '🚑 Ambulance Navigation Active',
            taskDesc: 'Sharing live GPS location with dispatch...',
            taskIcon: {
                name: 'ic_launcher',
                type: 'mipmap',
            },
            color: '#2563EB',
            linkingURI: 'ambulanceapp://',
            foregroundServiceType: ['location'],
            parameters: {
                ambulance_request_id: options?.ambulanceRequestId || 5,
                driver_id: options?.driverId || 4,
                type: options?.type || currentTrackingType || 'np',
            },
        };

        await BackgroundService.start(backgroundTask, taskOptions as any);
        console.log('🛡️ [JS FOREGROUND SERVICE STARTED] Notification visible & tracking every 10s. Type:', currentTrackingType);
    } catch (err) {
        console.error('❌ Failed to start JS background location service:', err);
    }
}

/**
 * Stops the JavaScript Background Service and dismisses the status bar notification.
 */
export async function stopBackgroundLocationTracking() {
    latestCoordsGetter = null;
    await storage.remove(STORAGE_KEYS.ACTIVE_BACKGROUND_TRIP);
    if (BackgroundService.isRunning()) {
        try {
            await BackgroundService.stop();
            console.log('🛑 [JS FOREGROUND SERVICE STOPPED]');
        } catch (err) {
            console.warn('Error stopping JS background location service:', err);
        }
    }
}

export function isBackgroundLocationTrackingRunning(): boolean {
    return BackgroundService.isRunning();
}
