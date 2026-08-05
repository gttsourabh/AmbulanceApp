import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const HomeScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
    </View>
);

const TripsScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Trips</Text>
    </View>
);

const EarningsScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Earnings</Text>
    </View>
);

const ProfileScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
    </View>
);

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#155EEF',
                tabBarInactiveTintColor: '#8A8F98',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
            />

            <Tab.Screen
                name="Trips"
                component={TripsScreen}
            />

            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
    },
});

export default MainTabNavigator;