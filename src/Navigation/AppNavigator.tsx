import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './tabs/MainTabNavigator';

import AvailabilityScreen from '../screens/Availability/AvailabilityScreen';

import IncomingRequestsScreen from "../screens/trips/Ongoingtrip/IncomingRequestScreen"
import PickupScreen from '../screens/trips/Ongoingtrip/PickupScreen';
import EnRouteScreen from '../screens/trips/Ongoingtrip/EnRouteScreen';
import OnTripScreen from '../screens/trips/Ongoingtrip/OnTripScreen';
import TripCompletedScreen from '../screens/trips/Ongoingtrip/TripCompletedScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Availability"
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* =====================================================
          AVAILABILITY
      ===================================================== */}

            <Stack.Screen
                name="Availability"
                component={AvailabilityScreen}
            />

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
                component={IncomingRequestsScreen}
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