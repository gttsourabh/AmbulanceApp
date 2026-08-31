import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../../screens/home/HomeScreen';
import NotificationsScreen from '../../screens/home/NotificationsScreen';

export type HomeStackParamList = {
    HomeScreen: undefined;
    Notifications: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerShown: false,
            }}>

            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
            />

            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
            />

        </Stack.Navigator>
    );
};

export default HomeStack;