import {
    getMessaging,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    requestPermission,
    getInitialNotification,
    subscribeToTopic as fcmSubscribeToTopic,
    unsubscribeFromTopic as fcmUnsubscribeFromTopic,
    AuthorizationStatus,
    RemoteMessage,
} from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { requestNotificationPermission } from '../utils/locationPermission';

let cachedFcmToken: string | null = null;

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

        console.log('🔔 [FCM PERMISSION STATUS]:', enabled ? 'GRANTED' : 'DENIED');
        return enabled;
    } catch (err) {
        console.warn('Error requesting FCM permission:', err);
        return false;
    }
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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 [FOREGROUND FCM MESSAGE RECEIVED]');
        console.log('Title:', remoteMessage.notification?.title);
        console.log('Body:', remoteMessage.notification?.body);
        console.log('Data:', remoteMessage.data);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Automatically detect and present emergency trip modal & notification
        const handledEmergency = await handleEmergencyTripNotification(remoteMessage, true);

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
        console.log('📲 [FCM NOTIFICATION OPENED FROM BACKGROUND]:', remoteMessage.data);
        await handleEmergencyTripNotification(remoteMessage, false);
        if (onOpenCallback) onOpenCallback(remoteMessage);
    });

    // When app was killed/quit and launched by tapping notification
    getInitialNotification(messaging)
        .then(async (remoteMessage: RemoteMessage | null) => {
            if (remoteMessage) {
                console.log('🚀 [FCM APP LAUNCHED FROM NOTIFICATION]:', remoteMessage.data);
                await handleEmergencyTripNotification(remoteMessage, false);
                if (onOpenCallback) onOpenCallback(remoteMessage);
            }
        });
}

/**
 * Initializes Firebase Cloud Messaging:
 * 1. Requests permission.
 * 2. Fetches & logs device FCM token.
 * 3. Sets up token refresh listener.
 */
export async function initNotificationService(): Promise<string | null> {
    await requestUserPermission();
    const token = await getFcmToken();

    const messaging = getMessagingInstance();
    // Listen for FCM token refresh
    onTokenRefresh(messaging, (newToken: string) => {
        cachedFcmToken = newToken;
        console.log('🔄 [FCM TOKEN REFRESHED]:', newToken);
    });

    return token;
}
