
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '../icons/index';
import HomeScreen from '../screens/home/HomeScreen';


const Tab = createBottomTabNavigator();

// const HomeScreen = () => (
//     <View style={styles.container}>
//         <Text style={styles.title}>Home</Text>
//     </View>
// );

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
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AppIcon
                            family="ionicons"
                            name="home"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Trips"
                component={TripsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AppIcon
                            family="material"
                            name="ambulance"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AppIcon
                            family="material"
                            name="wallet-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AppIcon
                            family="material"
                            name="account-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
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