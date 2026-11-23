import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { updateDriverOnlineStatus, UpdateDriverOnlineStatusPayload } from '../api/driverApi';
import { getCurrentCoordinates } from '../utils/locationPermission';
import { getReverseGeocodedAddress } from './geocodingService';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { store } from '../redux/store';

/**
 * 10 minutes interval for sending driver online /status API (10 * 60 * 1000 ms = 600,000 ms)
 */
export const STATUS_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Heartbeat check every 30 seconds.
 * Using a 30s check instead of a single 600,000ms timer completely eliminates
 * the React Native Android "timer for a long period of time" crash and bridge detachment.
 */
const CHECK_HEARTBEAT_MS = 30 * 1000;

let statusHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;
let lastStatusSentTimestamp: number = 0;
let isOnlineActive: boolean = false;
let isSendingStatus: boolean = false;

/**
 * Helper to retrieve current driver/user ID from arguments, Redux store, or AsyncStorage.
 * Ensures the returned ID is a valid positive number (never 0, empty, or NaN).
 */
export async function getEffectiveDriverUserId(
    explicitUserId?: number | string | null
): Promise<number | string | null> {
    const isValidId = (v: any): boolean => {
        if (v === undefined || v === null || v === '' || v === 0 || v === '0') return false;
        const num = Number(v);
        return !isNaN(num) && num > 0;
    };

    if (isValidId(explicitUserId)) {
        return Number(explicitUserId);
    }
    try {
        const stateUser = store.getState()?.auth?.user;
        if (isValidId(stateUser?.id)) return Number(stateUser.id);
        if (isValidId(stateUser?.user_id)) return Number(stateUser.user_id);
        if (isValidId(stateUser?.userId)) return Number(stateUser.userId);
        if (isValidId(stateUser?.driver_id)) return Number(stateUser.driver_id);
    } catch {
        // Redux store not ready
    }
    try {
        const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
        if (isValidId(storedUser?.id)) return Number(storedUser.id);
        if (isValidId(storedUser?.user_id)) return Number(storedUser.user_id);
        if (isValidId(storedUser?.userId)) return Number(storedUser.userId);
        if (isValidId(storedUser?.driver_id)) return Number(storedUser.driver_id);
    } catch {
        // storage read error
    }
    return null;
}

/**
 * Sends PUT /api/ambulance/driver/status with current location, address, and online status.
 * Wrapped with strict safety guards so it NEVER throws an unhandled exception or crashes.
 */
export async function sendDriverStatusUpdate(
    online: boolean,
    explicitUserId?: number | string | null,
    explicitCoords?: { lat: number; lng: number } | null
): Promise<boolean> {
    const timestampStr = new Date().toLocaleTimeString();

    // If an identical status call is already running, skip redundant duplicate
    if (isSendingStatus && online === isOnlineActive) {
        console.log('ℹ️ [DriverStatusService] /status request already in progress, skipping duplicate');
        return false;
    }

    let userId: number | string | null = null;
    try {
        userId = await getEffectiveDriverUserId(explicitUserId);
    } catch {
        userId = null;
    }

    if (!userId) {
        console.warn('⚠️ [DriverStatusService] Driver userId not found in Redux or Storage. Skipping /status.');
        return false;
    }

    isSendingStatus = true;
    const safetyWatchdog = setTimeout(() => {
        isSendingStatus = false;
    }, 10000);

    try {
        console.log(`\n======================================================`);
        console.log(`📡 [DriverStatusService] sendDriverStatusUpdate -> userId=${userId}, isOnline=${online} at ${timestampStr}`);
        console.log(`======================================================`);

        // 1. Fetch GPS coordinates safely (explicit coords first, then storage, then query)
        let coords: { lat: number; lng: number } | null = null;
        if (explicitCoords && explicitCoords.lat && explicitCoords.lng && explicitCoords.lat !== 0 && explicitCoords.lng !== 0) {
            coords = explicitCoords;
            storage.set(STORAGE_KEYS.LAST_DRIVER_LOCATION, explicitCoords).catch(() => {});
        } else {
            try {
                coords = await storage.get<{ lat: number; lng: number }>(STORAGE_KEYS.LAST_DRIVER_LOCATION);
                if (coords && coords.lat && coords.lng && coords.lat !== 0 && coords.lng !== 0) {
                    console.log(`📍 [DriverStatusService] Stored coordinates: lat=${coords.lat}, lng=${coords.lng}`);
                } else {
                    coords = null;
                }
            } catch {
                coords = null;
            }
        }

        // Query GPS if storage has no valid coordinates
        if (!coords) {
            try {
                coords = await getCurrentCoordinates();
                if (coords && coords.lat && coords.lng && coords.lat !== 0 && coords.lng !== 0) {
                    console.log(`📍 [DriverStatusService] Live coordinates: lat=${coords.lat}, lng=${coords.lng}`);
                } else {
                    coords = null;
                }
            } catch (locErr) {
                console.warn('⚠️ [DriverStatusService] Foreground coordinates notice:', locErr);
            }
        }

        // CRITICAL: The backend requires `let {lat, lng, userId, isOnline} = req.body`.
        // If coordinates are missing (lat/lng is 0 or null), the backend rejects with "Parameter Missing".
        // Do NOT send invalid 0/null coordinates to server!
        if (!coords || !coords.lat || !coords.lng || coords.lat === 0 || coords.lng === 0) {
            console.warn('⚠️ [DriverStatusService] Valid GPS coordinates not available yet. Waiting for GPS fix before calling /status.');
            return false;
        }

        // 2. Fetch address (use cached address immediately to prevent any network delay)
        let currAddress: string = '';
        try {
            currAddress = (await storage.get<string>(STORAGE_KEYS.LAST_DRIVER_ADDRESS)) || '';
        } catch {
            currAddress = '';
        }

        // Trigger geocode asynchronously in foreground only to update cache for future calls
        if (AppState.currentState === 'active' && coords?.lat && coords?.lng) {
            getReverseGeocodedAddress(coords.lat, coords.lng)
                .then(freshAddr => {
                    if (freshAddr) {
                        storage.set(STORAGE_KEYS.LAST_DRIVER_ADDRESS, freshAddr).catch(() => {});
                    }
                })
                .catch(() => {});
        }

        // 3. Dispatch updateDriverOnlineStatus API call directly
        const payload: UpdateDriverOnlineStatusPayload = {
            user_id: userId,
            driver_id: userId,
            userId: userId,
            is_online: online,
            isOnline: online,
            lat: coords.lat,
            lng: coords.lng,
            curr_address: currAddress || '',
        };

        const res = await updateDriverOnlineStatus(payload);

        lastStatusSentTimestamp = Date.now();
        storage.set(STORAGE_KEYS.LAST_STATUS_UPDATE_TIME, lastStatusSentTimestamp).catch(() => {});
        storage.set(STORAGE_KEYS.IS_DRIVER_ONLINE, online).catch(() => {});
        isOnlineActive = online;

        console.log(`✅ [DriverStatusService] /status update completed successfully at ${new Date().toLocaleTimeString()}`);
        return true;
    } catch (err: any) {
        console.error('❌ [DriverStatusService] Error calling updateDriverOnlineStatus:', err?.response?.data || err?.message || err);
        return false;
    } finally {
        clearTimeout(safetyWatchdog);
        isSendingStatus = false;
    }
}

/**
 * Starts periodic /status API calls every 10 minutes as long as user is online.
 * Uses a safe 30s heartbeat checker instead of a 600,000ms timer to guarantee
 * stability across Android sleep/background states.
 * ONLY runs when driver is online. Does NOT run when offline.
 */
export function startPeriodicStatusUpdates(userId?: number | string | null) {
    isOnlineActive = true;

    // Clear any existing timer to prevent duplicates
    if (statusHeartbeatTimer) {
        clearInterval(statusHeartbeatTimer);
        statusHeartbeatTimer = null;
    }

    console.log(`\n======================================================`);
    console.log(`⏱️ [DriverStatusService] PERIODIC 10-MIN STATUS TIMER ACTIVATED`);
    console.log(`   Interval : Every 10 minutes (${STATUS_INTERVAL_MS / 60000} mins)`);
    console.log(`   Condition: ONLY when user is ONLINE`);
    console.log(`   Time     : ${new Date().toLocaleTimeString()}`);
    console.log(`======================================================\n`);

    // Record start time if not already set
    if (lastStatusSentTimestamp === 0) {
        lastStatusSentTimestamp = Date.now();
    }

    // Safe 30s heartbeat interval checks elapsed time without native bridge timeout crash
    statusHeartbeatTimer = setInterval(async () => {
        try {
            // Strict online check: NEVER send periodic updates if user is offline
            if (!isOnlineActive) {
                console.log('🛑 [DriverStatusService] User is OFFLINE -> Halting periodic timer.');
                stopPeriodicStatusUpdates();
                return;
            }

            const now = Date.now();
            const elapsed = now - lastStatusSentTimestamp;

            if (elapsed >= STATUS_INTERVAL_MS) {
                console.log(`\n⏰ [DriverStatusService] [10-MIN INTERVAL ELAPSED: ${Math.round(elapsed / 1000)}s] -> Dispatching /status update at ${new Date().toLocaleTimeString()}...`);
                await sendDriverStatusUpdate(true, userId);
            }
        } catch (intervalErr) {
            console.error('❌ [DriverStatusService] Heartbeat tick error:', intervalErr);
        }
    }, CHECK_HEARTBEAT_MS);

    // Register AppState listener to handle resume after phone sleep / background
    if (!appStateSubscription) {
        try {
            appStateSubscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
                try {
                    console.log(`📱 [DriverStatusService] AppState changed to: ${nextState}`);
                    if (nextState === 'active' && isOnlineActive) {
                        const now = Date.now();
                        const elapsed = now - lastStatusSentTimestamp;
                        console.log(`⏱️ [DriverStatusService] App resumed -> ${Math.round(elapsed / 1000)}s since last /status call`);
                        if (lastStatusSentTimestamp > 0 && elapsed >= STATUS_INTERVAL_MS) {
                            console.log(`⏱️ [DriverStatusService] >= 10 min passed while in background. Triggering immediate /status update...`);
                            await sendDriverStatusUpdate(true, userId);
                        }
                    }
                } catch (appStateErr) {
                    console.error('❌ [DriverStatusService] AppState listener error:', appStateErr);
                }
            });
        } catch {
            // ignore
        }
    }
}

/**
 * Stops periodic status updates when driver goes offline or logs out.
 * Ensures NO periodic calls occur while offline.
 */
export function stopPeriodicStatusUpdates() {
    console.log('🛑 [DriverStatusService] stopPeriodicStatusUpdates() -> Timer CLEARED. No calls while offline.');
    isOnlineActive = false;
    if (statusHeartbeatTimer) {
        clearInterval(statusHeartbeatTimer);
        statusHeartbeatTimer = null;
    }
    if (appStateSubscription) {
        try {
            appStateSubscription.remove();
        } catch {}
        appStateSubscription = null;
    }
}

/**
 * Returns whether periodic status updates are currently active.
 */
export function isPeriodicStatusRunning(): boolean {
    return isOnlineActive && statusHeartbeatTimer !== null;
}

/**
 * Returns the timestamp of the last successful status update.
 */
export function getLastStatusSentTimestamp(): number {
    return lastStatusSentTimestamp;
}
