import { Platform, PermissionsAndroid, Alert, Linking, NativeModules } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

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

/**
 * Checks if the device's hardware location/GPS switch is turned ON.
 */
export async function isDeviceLocationEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return true;
    }

    // 1. Try instant native check via DownloadModule
    if (NativeModules.DownloadModule?.isLocationEnabled) {
        try {
            const enabled = await NativeModules.DownloadModule.isLocationEnabled();
            return Boolean(enabled);
        } catch (err) {
            console.warn('Native isLocationEnabled check error:', err);
        }
    }

    // 2. Fallback: Quick GPS provider check via Geolocation (maximumAge: 0 to avoid cached stale fixes)
    return new Promise(resolve => {
        Geolocation.getCurrentPosition(
            () => resolve(true),
            err => {
                // Error code 2 = POSITION_UNAVAILABLE (provider disabled / GPS off)
                if (err?.code === 2) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
        );
    });
}

/**
 * Opens device Location settings where the user can toggle GPS on.
 */
export async function openLocationSettings(): Promise<void> {
    if (Platform.OS === 'android') {
        if (NativeModules.DownloadModule?.openLocationSettings) {
            try {
                await NativeModules.DownloadModule.openLocationSettings();
                return;
            } catch (err) {
                console.warn('Native openLocationSettings error:', err);
            }
        }

        try {
            await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
            return;
        } catch {
            openAppSettings();
        }
    } else {
        openAppSettings();
    }
}

/**
 * Checks if device location is enabled. If disabled:
 * 1. Prompts the native Google Play Services dialog ("To continue, turn on device location...").
 *    Tapping "OK" turns on the device location toggle directly in the Android quick settings.
 * 2. If the user dismisses or resolution is unavailable, shows an Alert with direct link to Location Settings.
 * Returns true if device location is ON after prompt, false otherwise.
 */
export async function promptEnableDeviceLocation(
    customTitle?: string,
    customMessage?: string
): Promise<boolean> {
    const isEnabled = await isDeviceLocationEnabled();
    if (isEnabled) {
        return true;
    }

    // 1. Native Google Play Services resolution prompt
    if (Platform.OS === 'android' && NativeModules.DownloadModule?.promptEnableLocation) {
        try {
            const result = await NativeModules.DownloadModule.promptEnableLocation();
            if (result === true) {
                // Verify hardware location switch is now ON
                const nowEnabled = await isDeviceLocationEnabled();
                return nowEnabled;
            }
        } catch (err) {
            console.warn('Native promptEnableLocation error:', err);
        }
    }

    // 2. Fallback: Prompt via Alert and open Location Settings
    return new Promise(resolve => {
        Alert.alert(
            customTitle || 'Enable Device Location (GPS)',
            customMessage ||
                'Location services are turned off on your device. Please turn on GPS so AmbulanceApp can navigate and receive emergency trips.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resolve(false),
                },
                {
                    text: 'Turn On Location',
                    onPress: async () => {
                        await openLocationSettings();
                        resolve(false);
                    },
                },
            ],
            { cancelable: false }
        );
    });
}

/**
 * Verifies both Android permissions and hardware GPS switch.
 */
export async function checkAllPermissionsAndLocation(): Promise<{
    permissions: AppPermissionsStatus;
    isGpsEnabled: boolean;
    canProceed: boolean;
}> {
    const permissions = await checkAllPermissions();
    const isGpsEnabled = await isDeviceLocationEnabled();
    return {
        permissions,
        isGpsEnabled,
        canProceed: Boolean(permissions.allGranted && isGpsEnabled),
    };
}
