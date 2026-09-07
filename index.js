/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

import { parseEmergencyTripPayload } from './src/utils/emergencyNotificationHandler';
import { storage } from './src/storage/storage';
import { STORAGE_KEYS } from './src/storage/storageKeys';

// Register background and quit-state FCM message handler
const messagingInstance = getMessaging();
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📬 [FCM BACKGROUND / QUIT STATE MESSAGE]');
    console.log('Title:', remoteMessage.notification?.title);
    console.log('Body:', remoteMessage.notification?.body);
    console.log('Data:', remoteMessage.data);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const emergencyData = parseEmergencyTripPayload(remoteMessage?.data || remoteMessage);
    if (emergencyData) {
        console.log('🚨 [BACKGROUND] Caching incoming emergency trip:', emergencyData);
        await storage.set(STORAGE_KEYS.PENDING_EMERGENCY_REQUEST, emergencyData);
    }
});

AppRegistry.registerComponent(appName, () => App);
