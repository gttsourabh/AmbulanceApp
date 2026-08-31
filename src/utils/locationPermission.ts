import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

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

            if (
                fineStatus === PermissionsAndroid.RESULTS.GRANTED ||
                coarseStatus === PermissionsAndroid.RESULTS.GRANTED
            ) {
                return true;
            }

            // If user selected "Never ask again"
            if (
                fineStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                coarseStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ) {
                Alert.alert(
                    'Location Permission Required',
                    'To go online and accept emergency ambulance trips, please enable Location in app settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            } else {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to mark yourself Available for ambulance dispatches.'
                );
            }

            return false;
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
