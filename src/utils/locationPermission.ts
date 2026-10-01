import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export interface AppPermissionsStatus {
    foregroundLocation: boolean;
    backgroundLocation: boolean;
    notifications: boolean;
    storage?: boolean;
    allGranted: boolean;
}

/**
 * Checks all required permissions (Foreground Location, Background Location, Notifications).
 * Storage is optional and requested on-demand when downloading files.
 */
export async function checkAllPermissions(): Promise<AppPermissionsStatus> {
    if (Platform.OS !== 'android') {
        return {
            foregroundLocation: true,
            backgroundLocation: true,
            notifications: true,
            storage: true,
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

        // 4. Device Storage (Optional / On-demand for downloading reports)
        let storage = true;
        if (v < 33) {
            storage = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
        }

        // Mandatory permissions are only Location and Notifications to go online and receive trips
        const allGranted = Boolean(foregroundLocation && backgroundLocation && notifications);

        return {
            foregroundLocation,
            backgroundLocation,
            notifications,
            storage,
            allGranted,
        };
    } catch (err) {
        console.warn('❌ [PERMISSIONS] Error checking all permissions:', err);
        return {
            foregroundLocation: false,
            backgroundLocation: false,
            notifications: false,
            storage: false,
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
 * Checks if storage permission is granted (or not required on Android 13+).
 */
export async function checkStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return true;
    }

    const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
    if (v >= 33) {
        return true;
    }

    try {
        return await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
    } catch (err) {
        console.warn('Error checking storage permission:', err);
        return false;
    }
}

/**
 * Requests storage permission on Android (WRITE_EXTERNAL_STORAGE & READ_EXTERNAL_STORAGE).
 * Only needed at runtime on Android < 29 (Android 9 and below).
 * On Android 10+ (API 29+ / Android 10-14), MediaStore handles saving to Downloads directly.
 */
export async function requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return true;
    }

    const v = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
    if (v >= 33) {
        return true;
    }

    try {
        const hasWrite = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (hasWrite) return true;

        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        const writeStatus = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE];

        // On Android 10+ (API 29+), Scoped Storage / MediaStore saves to Downloads without requiring legacy permission
        if (v >= 29) {
            return true;
        }

        return writeStatus === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn('Error requesting storage permission:', err);
        return v >= 29;
    }
}

/**
 * Requests all required permissions in the correct Android sequence.
 * Note: Storage is non-mandatory and requested on-demand only when downloading files.
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
