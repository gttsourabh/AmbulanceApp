import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import MainTabNavigator from './tabs/MainTabNavigator';

const Stack = createNativeStackNavigator();

interface AuthNavigatorProps {
    initialRouteName?: 'Splash' | 'Login';
    onSplashFinish?: () => void;
}

const AuthNavigator = ({
    initialRouteName = 'Splash',
    onSplashFinish,
}: AuthNavigatorProps) => {
    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
            }}>

            <Stack.Screen name="Splash">
                {({ navigation }) => (
                    <SplashScreen
                        onFinish={() => {
                            if (onSplashFinish) {
                                onSplashFinish();
                            }
                            navigation.replace('Login');
                        }}
                    />
                )}
            </Stack.Screen>

            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OtpScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;