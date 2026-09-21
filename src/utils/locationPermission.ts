import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export interface AppPermissionsStatus {
    foregroundLocation: boolean;
    backgroundLocation: boolean;
    notifications: boolean;
    allGranted: boolean;
}

/**
 * Checks all required permissions (Foreground Location, Background Location, Notifications).
 */
export async function checkAllPermissions(): Promise<AppPermissionsStatus> {
    if (Platform.OS !== 'android') {
        return {
            foregroundLocation: true,
            backgroundLocation: true,
            notifications: true,
            allGranted: true,
        };
    }

    try {
        const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;

        // 1. Foreground Location
        const hasFine = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const hasCoarse = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        const foregroundLocation = hasFine || hasCoarse;

        // 2. Background Location (Android 10+ / API 29+)
        let backgroundLocation = true;
        if (v >= 29) {
            backgroundLocation = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
        } else {
            backgroundLocation = foregroundLocation;
        }

        // 3. Notifications (Android 13+ / API 33+)
        let notifications = true;
        if (v >= 33) {
            notifications = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
        }

        const allGranted = Boolean(foregroundLocation && backgroundLocation && notifications);

        return {
            foregroundLocation,
            backgroundLocation,
            notifications,
            allGranted,
        };
    } catch (err) {
        console.warn('❌ [PERMISSIONS] Error checking all permissions:', err);
        return {
            foregroundLocation: false,
            backgroundLocation: false,
            notifications: false,
            allGranted: false,
        };
    }
}

/**
 * Requests fine and coarse location permission on Android.
 * Returns true if permission is granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        try {
            const hasFine = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            const hasCoarse = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            );

            if (hasFine || hasCoarse) {
                return true;
            }

            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);

            const fineStatus = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
            const coarseStatus = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

            return (
                fineStatus === PermissionsAndroid.RESULTS.GRANTED ||
                coarseStatus === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn('Error requesting location permission:', err);
            return false;
        }
    }

    return true;
}

/**
 * Checks if location permission is already granted.
 */
export async function checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        try {
            const hasFine = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            const hasCoarse = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            );
            return hasFine || hasCoarse;
        } catch (err) {
            console.warn('Error checking location permission:', err);
            return false;
        }
    }
    return true;
}

/**
 * Requests Background Location permission on Android (API 29+).
 * Android requires foreground location to be granted BEFORE requesting background location.
 */
export async function requestBackgroundLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
        if (v < 29) {
            return true;
        }

        try {
            const hasBg = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
            if (hasBg) return true;

            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
            return res === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Error requesting background location permission:', err);
            return false;
        }
    }
    return true;
}

/**
 * Requests Notification permission on Android 13+ (API 33+) for foreground service & alerts.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
        if (v >= 33) {
            try {
                const check = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (check) return true;

                const res = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                return res === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Notification permission error:', err);
                return false;
            }
        }
    }
    return true;
}

/**
 * Requests all required permissions in the correct Android sequence.
 */
export async function requestAllPermissionsSequentially(): Promise<AppPermissionsStatus> {
    if (Platform.OS !== 'android') {
        return checkAllPermissions();
    }

    const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;

    try {
        // Step 1: Foreground Location
        const hasFg = await checkLocationPermission();
        if (!hasFg) {
            await requestLocationPermission();
        }

        // Step 2: Notifications (API 33+)
        if (v >= 33) {
            const hasNotif = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (!hasNotif) {
                await requestNotificationPermission();
            }
        }

        // Step 3: Background Location (only if foreground is granted, as per Android requirement)
        const fgNow = await checkLocationPermission();
        if (fgNow && v >= 29) {
            const hasBg = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
            if (!hasBg) {
                await requestBackgroundLocationPermission();
            }
        }
    } catch (err) {
        console.warn('Error in sequential permission flow:', err);
    }

    return checkAllPermissions();
}

/**
 * Opens device app settings so the user can enable permissions.
 */
export function openAppSettings(): void {
    Linking.openSettings().catch(err => {
        console.warn('Failed to open app settings:', err);
    });
}
