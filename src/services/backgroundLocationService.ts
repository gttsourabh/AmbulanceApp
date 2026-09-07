import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import { updateDriverLocation, UpdateDriverLocationPayload } from '../api/driverApi';
import { requestNotificationPermission } from '../utils/locationPermission';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

let latestCoordsGetter: (() => { latitude: number; longitude: number } | null) | null = null;

const getFreshGpsPosition = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise(resolve => {
        Geolocation.getCurrentPosition(
            pos => {
                resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
            },
            err => {
                console.warn('Background Geolocation getCurrentPosition error:', err?.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 5000,
            }
        );
    });
};

const backgroundTask = async (taskDataArguments?: any) => {
    const ambulanceRequestId = taskDataArguments?.ambulance_request_id || 5;
    const driverId = taskDataArguments?.driver_id || 4;

    console.log('🚀 [BACKGROUND SERVICE TASK STARTED]');

    while (BackgroundService.isRunning()) {
        try {
            // 1. Get coordinates from active in-app ref or fallback to fresh GPS
            let coords = latestCoordsGetter ? latestCoordsGetter() : null;
            if (!coords) {
                coords = await getFreshGpsPosition();
            }

            if (coords && coords.latitude && coords.longitude) {
                const payload: UpdateDriverLocationPayload = {
                    ambulance_request_id: ambulanceRequestId,
                    driver_id: driverId,
                    latitude: Number(coords.latitude.toFixed(6)),
                    longitude: Number(coords.longitude.toFixed(6)),
                };

                console.log(
                    `📍 [BACKGROUND LIVE GPS (Every 10s)] -> Latitude: ${payload.latitude}, Longitude: ${payload.longitude}`
                );
                console.log(
                    '📡 [POST /api/ambulance/driver/update-location] Sending background payload:',
                    payload
                );

                const response = await updateDriverLocation(payload);
                console.log('✅ [BACKGROUND LOCATION UPDATE SUCCESS] Response:', response.data);
            } else {
                console.warn('⚠️ [BACKGROUND LOCATION] GPS position not yet available, skipping this cycle');
            }
        } catch (error: any) {
            console.warn(
                '❌ [BACKGROUND LOCATION UPDATE FAILED]:',
                error?.response?.data || error?.message || error
            );
        }

        // Wait 10 seconds before next sync
        await sleep(10000);
    }

    console.log('🛑 [BACKGROUND SERVICE TASK STOPPED]');
};

export interface BackgroundTrackingOptions {
    ambulanceRequestId?: number;
    driverId?: number;
    getCoordinates?: () => { latitude: number; longitude: number } | null;
}

/**
 * Starts the Android Foreground Service to track GPS and send location updates
 * every 10 seconds, even when the app is minimized or the screen is locked.
 */
export async function startBackgroundLocationTracking(options?: BackgroundTrackingOptions) {
    if (BackgroundService.isRunning()) {
        console.log('ℹ️ Background location tracking is already running.');
        return;
    }

    // Ensure notification permission is granted on Android 13+
    await requestNotificationPermission();

    if (options?.getCoordinates) {
        latestCoordsGetter = options.getCoordinates;
    }

    const taskOptions = {
        taskName: 'AmbulanceLiveNavigation',
        taskTitle: 'Ambulance Navigation Active',
        taskDesc: 'Sharing live GPS location with dispatch (every 10s)',
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
        },
    };

    try {
        await BackgroundService.start(backgroundTask, taskOptions as any);
        console.log('🛡️ [FOREGROUND SERVICE STARTED] Live navigation running in background.');
    } catch (err) {
        console.error('Failed to start background location service:', err);
    }
}

/**
 * Stops the Android Foreground Service and dismisses the status bar notification.
 */
export async function stopBackgroundLocationTracking() {
    latestCoordsGetter = null;
    if (BackgroundService.isRunning()) {
        try {
            await BackgroundService.stop();
            console.log('🛑 [FOREGROUND SERVICE STOPPED]');
        } catch (err) {
            console.warn('Error stopping background location service:', err);
        }
    }
}

export function isBackgroundLocationTrackingRunning(): boolean {
    return BackgroundService.isRunning();
}
