import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { navigationRef } from '../utils/navigationRef';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { restoreSession, UserData, SubscribedChannel } from '../redux/slices/authSlice';
import { storage } from '../storage/storage';

const RootNavigator = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const [isRestoring, setIsRestoring] = useState(true);
    const [hasSeenSplash, setHasSeenSplash] = useState(false);

    // Auto-restore session from AsyncStorage on app launch
    useEffect(() => {
        const restoreAuthSession = async () => {
            try {
                const token = await storage.get<string>('AUTH_TOKEN');
                const user = await storage.get<UserData>('USER_DATA');
                const channels = await storage.get<SubscribedChannel[]>('SUBSCRIBED_CHANNELS');

                if (token && user) {
                    dispatch(
                        restoreSession({
                            token,
                            user,
                            subscribedChannels: channels || [],
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