import {
    getMessaging,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    requestPermission,
    getInitialNotification,
    getAPNSToken,
    isDeviceRegisteredForRemoteMessages,
    registerDeviceForRemoteMessages,
    subscribeToTopic as fcmSubscribeToTopic,
    unsubscribeFromTopic as fcmUnsubscribeFromTopic,
    AuthorizationStatus,
    RemoteMessage,
} from '@react-native-firebase/messaging';
import { Alert, AppState, Platform } from 'react-native';
import { requestNotificationPermission } from '../utils/locationPermission';

let cachedFcmToken: string | null = null;

/**
 * Logs the full FCM message (notification + data) so delivery can be checked in Metro / Xcode console.
 */
export function logRemoteMessage(label: string, remoteMessage: RemoteMessage | null | undefined) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔔 [FCM ${label}] platform=${Platform.OS} appState=${AppState.currentState} at ${new Date().toISOString()}`);
    if (!remoteMessage) {
        console.log('   (no message)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return;
    }
    console.log('   messageId:', remoteMessage.messageId);
    console.log('   from:', remoteMessage.from);
    console.log('   title:', remoteMessage.notification?.title);
    console.log('   body:', remoteMessage.notification?.body);
    console.log('   data:', JSON.stringify(remoteMessage.data ?? {}, null, 2));
    console.log('   full message:', JSON.stringify(remoteMessage, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

const getMessagingInstance = () => {
    return getMessaging();
};

/**
 * Requests Notification permission on iOS & Android.
 */
export async function requestUserPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            await requestNotificationPermission();
        }

        const messaging = getMessagingInstance();
        const authStatus = await requestPermission(messaging);
        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;

        console.log('🔔 [FCM PERMISSION STATUS]:', enabled ? 'GRANTED' : 'DENIED', `(authStatus=${authStatus})`);
        return enabled;
    } catch (err) {
        console.warn('Error requesting FCM permission:', err);
        return false;
    }
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * iOS: FCM can only issue a token after iOS delivers the APNs token, which arrives asynchronously
 * after launch. Calling getToken before that fails, so wait for it (up to ~10s).
 */
async function waitForApnsToken(timeoutMs: number = 10000): Promise<boolean> {
    const messaging = getMessagingInstance();
    try {
        if (!isDeviceRegisteredForRemoteMessages(messaging)) {
            await registerDeviceForRemoteMessages(messaging);
        }
    } catch (err) {
        console.warn('🍎 [APNS] registerDeviceForRemoteMessages failed:', err);
    }

    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        try {
            const apnsToken = await getAPNSToken(messaging);
            if (apnsToken) {
                console.log('🍎 [APNS TOKEN READY]:', apnsToken);
                return true;
            }
        } catch {
            // Not available yet, keep polling.
        }
        await sleep(500);
    }
    return false;
}

/**
 * Retrieves the device's unique FCM registration token.
 */
export async function getFcmToken(): Promise<string | null> {
    if (cachedFcmToken) {
        return cachedFcmToken;
    }

    try {
        const messaging = getMessagingInstance();
        if (Platform.OS === 'ios') {
            const apnsReady = await waitForApnsToken();
            if (!apnsReady) {
                console.warn('🍎 [APNS] no APNs token yet, so no FCM token can be created on iOS');
                return null;
            }
        }
        const token = await getToken(messaging);
        if (token) {
            cachedFcmToken = token;
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔥 [FCM REGISTRATION TOKEN]');
            console.log(token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
        return token;
    } catch (err) {
        console.warn('Failed to retrieve FCM token:', err);
        return null;
    }
}

/**
 * Cleans topic string to comply with Firebase topic naming rules [a-zA-Z0-9-_.~%]+
 */
function sanitizeTopic(topic: string): string {
    return topic.trim().replace(/[^a-zA-Z0-9-_.~%]/g, '_');
}

/**
 * Subscribes to an FCM Topic (e.g. "DRIVER_123" or "AMB_DISPATCH")
 */
export async function subscribeToTopic(topic: string): Promise<boolean> {
    if (!topic) return false;
    const cleanTopic = sanitizeTopic(topic);
    try {
        const messaging = getMessagingInstance();
        await fcmSubscribeToTopic(messaging, cleanTopic);
        console.log(`📡 [FCM TOPIC SUBSCRIBED] -> ${cleanTopic}`);
        return true;
    } catch (err) {
        console.warn(`Failed to subscribe to FCM topic ${cleanTopic}:`, err);
        return false;
    }
}

/**
 * Unsubscribes from an FCM Topic on logout.
 */
export async function unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!topic) return false;
    const cleanTopic = sanitizeTopic(topic);
    try {
        const messaging = getMessagingInstance();
        await fcmUnsubscribeFromTopic(messaging, cleanTopic);
        console.log(`🛑 [FCM TOPIC UNSUBSCRIBED] -> ${cleanTopic}`);
        return true;
    } catch (err) {
        console.warn(`Failed to unsubscribe from FCM topic ${cleanTopic}:`, err);
        return false;
    }
}

import { handleEmergencyTripNotification } from '../utils/emergencyNotificationHandler';

/**
 * Sets up foreground push message listener.
 */
export function setupForegroundListener(
    onMessageCallback?: (message: RemoteMessage) => void
) {
    const messaging = getMessagingInstance();
    return onMessage(messaging, async (remoteMessage: RemoteMessage) => {
        logRemoteMessage('FOREGROUND MESSAGE RECEIVED', remoteMessage);

        // Automatically detect and present emergency trip modal & notification
        const handledEmergency = await handleEmergencyTripNotification(remoteMessage, true);
        console.log('🔔 [FCM FOREGROUND] handled as emergency trip:', handledEmergency);

        if (onMessageCallback) {
            onMessageCallback(remoteMessage);
        } else if (!handledEmergency && remoteMessage.notification) {
            Alert.alert(
                remoteMessage.notification.title || 'New Emergency Trip',
                remoteMessage.notification.body || 'You have received an ambulance dispatch update.'
            );
        }
    });
}

/**
 * Sets up notification interaction listeners (when driver taps a notification).
 */
export function setupNotificationOpenedListener(
    onOpenCallback?: (message: RemoteMessage) => void
) {
    const messaging = getMessagingInstance();

    // When app was running in background and user taps notification
    onNotificationOpenedApp(messaging, async (remoteMessage: RemoteMessage) => {
        logRemoteMessage('NOTIFICATION OPENED FROM BACKGROUND', remoteMessage);
        await handleEmergencyTripNotification(remoteMessage, false);
        if (onOpenCallback) onOpenCallback(remoteMessage);
    });

    // When app was killed/quit and launched by tapping notification
    getInitialNotification(messaging)
        .then(async (remoteMessage: RemoteMessage | null) => {
            if (!remoteMessage) {
                console.log('🚀 [FCM INITIAL NOTIFICATION] app was not launched from a notification');
            }
            if (remoteMessage) {
                logRemoteMessage('APP LAUNCHED FROM NOTIFICATION (QUIT STATE)', remoteMessage);
                await handleEmergencyTripNotification(remoteMessage, false);
                if (onOpenCallback) onOpenCallback(remoteMessage);
            }
        });
}

/**
 * Initializes Firebase Cloud Messaging:
 * 1. Fetches & logs device FCM token.
 * 2. Sets up token refresh listener.
 *
 * It does NOT ask for notification permission. Notifications are optional (App Store Guideline 4.5.4),
 * so the system prompt is shown only from the permission screen, after we explain why, and the
 * driver can decline it and still use the app.
 */
export async function initNotificationService(): Promise<string | null> {

    const messaging = getMessagingInstance();
    if (Platform.OS === 'ios') {
        // FCM on iOS only works once the device has an APNs token (needs the Push Notifications entitlement).
        console.log('🍎 [APNS] registered for remote messages:', isDeviceRegisteredForRemoteMessages(messaging));
        try {
            const apnsToken = await getAPNSToken(messaging);
            console.log('🍎 [APNS TOKEN]:', apnsToken ?? 'null (push not set up: check entitlement / APNs key / real device)');
        } catch (err) {
            console.warn('🍎 [APNS TOKEN] failed to read:', err);
        }
    }

    const token = await getFcmToken();
    // Listen for FCM token refresh
    onTokenRefresh(messaging, (newToken: string) => {
        cachedFcmToken = newToken;
        console.log('🔄 [FCM TOKEN REFRESHED]:', newToken);
    });

    return token;
}
