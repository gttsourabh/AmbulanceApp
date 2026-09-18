import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../../screens/profile/ProfileScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';
import HelpScreen from '../../screens/profile/HelpScreen';
import UserInfo from '../../screens/profile/UserInfo';
import VehicleDocumentsScreen from '../../screens/profile/VehicleDocumentsScreen';
import PrivacyPolicyScreen from '../../screens/profile/PrivacyPolicyScreen';
import TermsConditionsScreen from '../../screens/profile/TermsConditionsScreen';

import { DriverProfileData } from '../../api/driverApi';

export type ProfileStackParamList = {
    ProfileScreen: undefined;
    Settings: undefined;
    Help: undefined;
    UserInfo: { driverProfile?: DriverProfileData | null } | undefined;
    VehicleDocument: { driverProfile?: DriverProfileData | null } | undefined;
    PrivacyPolicy: undefined;
    TermsConditions: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="ProfileScreen"
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="UserInfo" component={UserInfo} />
            <Stack.Screen
                name="VehicleDocument"
                component={VehicleDocumentsScreen}
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
            />
            <Stack.Screen
                name="TermsConditions"
                component={TermsConditionsScreen}
            />
        </Stack.Navigator>
    );
};

export default ProfileStack;