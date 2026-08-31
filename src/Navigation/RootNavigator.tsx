import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { navigationRef } from '../utils/navigationRef';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { restoreSession, UserData, SubscribedChannel } from '../redux/slices/authSlice';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/storageKeys';

const RootNavigator = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const [isRestoring, setIsRestoring] = useState(true);
    const [hasSeenSplash, setHasSeenSplash] = useState(false);

    // Auto-restore session from AsyncStorage on app launch
    useEffect(() => {
        const restoreAuthSession = async () => {
            try {
                const token =
                    (await storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)) ||
                    (await storage.get<string>('AUTH_TOKEN'));
                const user =
                    (await storage.get<UserData>(STORAGE_KEYS.USER_DATA)) ||
                    (await storage.get<UserData>('USER_DATA'));
                const channels =
                    (await storage.get<SubscribedChannel[]>(STORAGE_KEYS.SUBSCRIBED_CHANNELS)) ||
                    (await storage.get<SubscribedChannel[]>('SUBSCRIBED_CHANNELS'));
                const userChannel = await storage.get<string>(STORAGE_KEYS.USER_CHANNEL);
                const driverChannel = await storage.get<string>(STORAGE_KEYS.DRIVER_CHANNEL);

                if (token && user) {
                    dispatch(
                        restoreSession({
                            token,
                            user,
                            subscribedChannels: channels || [],
                            userChannel,
                            driverChannel,
                        }),
                    );
                    setHasSeenSplash(true);
                }
            } catch (err) {
                console.error('Failed to restore auth session:', err);
            } finally {
                setIsRestoring(false);
            }
        };

        restoreAuthSession();
    }, [dispatch]);

    if (isRestoring) {
        return null;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? (
                <AppNavigator />
            ) : (
                <AuthNavigator
                    initialRouteName={hasSeenSplash ? 'Login' : 'Splash'}
                    onSplashFinish={() => setHasSeenSplash(true)}
                />
            )}
        </NavigationContainer>
    );
};

export default RootNavigator;