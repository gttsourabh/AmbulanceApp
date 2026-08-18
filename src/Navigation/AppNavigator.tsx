import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './tabs/MainTabNavigator';

import AvailabilityScreen from '../screens/Availability/AvailabilityScreen';

import IncomingRequestsScreen from "../screens/trips/Ongoingtrip/IncomingRequestScreen"
import PickupScreen from '../screens/trips/Ongoingtrip/PickupScreen';
import EnRouteScreen from '../screens/trips/Ongoingtrip/EnRouteScreen';
import OnTripScreen from '../screens/trips/Ongoingtrip/OnTripScreen';
import TripCompletedScreen from '../screens/trips/Ongoingtrip/TripCompletedScreen';
import IncomingRequestScreen from '../screens/trips/Ongoingtrip/IncomingRequestScreen';
import NavigationToPickup from '../screens/trips/Ongoingtrip/NavigationToPickup';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
                headerShown: false,
            }}
        >
      
            {/* =====================================================
          MAIN APP
      ===================================================== */}

            <Stack.Screen
                name="MainTabs"
                component={MainTabNavigator}
            />

            {/* =====================================================
          ONGOING TRIP FLOW
      ===================================================== */}

            <Stack.Screen
                name="IncomingRequests"
                component={IncomingRequestScreen}
                options={{
                    presentation: 'transparentModal',
                    animation: 'slide_from_bottom',
                    contentStyle: {
                        backgroundColor: 'transparent',
                    },
                }}
            />

            <Stack.Screen
                name="NavigationToPickup"
                component={NavigationToPickup}
            />

            <Stack.Screen
                name="Pickup"
                component={PickupScreen}
            />

            <Stack.Screen
                name="EnRoute"
                component={EnRouteScreen}
            />

            <Stack.Screen
                name="OnTrip"
                component={OnTripScreen}
            />

            <Stack.Screen
                name="TripCompleted"
                component={TripCompletedScreen}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;