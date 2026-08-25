// import React from 'react';
// import {
//     createBottomTabNavigator,
// } from '@react-navigation/bottom-tabs';
// import {
//     StyleSheet,
//     Text,
//     View,
// } from 'react-native';

// import { AppIcon } from '../../icons';
// import { colors } from '../../theme';

// import HomeScreen from '../../screens/home/HomeScreen';
// import TripsScreen from '../../screens/trips/TripsScreen';
// import EarningsScreen from '../../screens/earnings/EarningsScreen';
// import ProfileScreen from '../../screens/profile/ProfileScreen';
// import HomeStack from '../stacks/Homestack';

// const Tab = createBottomTabNavigator();


// const MainTabNavigator = () => {
//     return (
//         <Tab.Navigator
//             initialRouteName="Home"

//             screenOptions={{
//                 headerShown: false,

//                 tabBarActiveTintColor: colors.primary,
//                 tabBarInactiveTintColor: colors.textLight,

//                 tabBarLabelStyle: {
//                     fontFamily: 'GoogleSans-Medium',
//                     fontSize: 12,
//                     marginTop: 2,
//                 },

//                 tabBarItemStyle: {
//                     paddingTop: 2,
//                 },

//                 tabBarStyle: {
//                     height: 78,
//                      backgroundColor: colors.background,

//                     // Remove top line
//                     borderTopWidth: 0,
//                     borderWidth: 0,

//                     // Remove Android elevation
//                     elevation: 0,

//                     // Remove iOS shadow
//                     shadowColor: 'transparent',
//                     shadowOpacity: 0,
//                     shadowOffset: {
//                         width: 0,
//                         height: 0,
//                     },
//                     shadowRadius: 0,

//                     paddingTop: 5,
//                     paddingBottom: 7,
//                 },
//             }}

//         >

//             {/* HOME */}
//             <Tab.Screen
//                 name="Home"
//                 component={HomeStack}
//                 options={{
//                     tabBarIcon: ({ focused }) => (
//                         <View
//                             style={[
//                                 styles.tabIconContainer,
//                                 focused && styles.activeTabIconContainer,
//                             ]}>
//                             <AppIcon
//                                 family="ionicons"
//                                 name={focused ? 'home' : 'home-outline'}
//                                 size={24}
//                                 color={
//                                     focused
//                                         ? colors.primary
//                                         : colors.textLight
//                                 }
//                             />
//                         </View>
//                     ),
//                 }}
//             />

//             {/* TRIPS */}
//             <Tab.Screen
//                 name="Trips"
//                 component={TripsScreen}
//                 options={{
//                     tabBarIcon: ({ focused }) => (
//                         <View
//                             style={[
//                                 styles.tabIconContainer,
//                                 focused && styles.activeTabIconContainer,
//                             ]}>
//                             <AppIcon
//                                 family="material"
//                                 name="ambulance"
//                                 size={24}
//                                 color={
//                                     focused
//                                         ? colors.primary
//                                         : colors.textLight
//                                 }
//                             />
//                         </View>
//                     ),
//                 }}
//             />

//             {/* EARNINGS */}
//             <Tab.Screen
//                 name="Earnings"
//                 component={EarningsScreen}
//                 options={{
//                     tabBarIcon: ({ focused }) => (
//                         <View
//                             style={[
//                                 styles.tabIconContainer,
//                                 focused && styles.activeTabIconContainer,
//                             ]}>
//                             <AppIcon
//                                 family="ionicons"
//                                 name={focused ? 'wallet' : 'wallet-outline'}
//                                 size={24}
//                                 color={
//                                     focused
//                                         ? colors.primary
//                                         : colors.textLight
//                                 }
//                             />
//                         </View>
//                     ),
//                 }}
//             />

//             {/* PROFILE */}
//             <Tab.Screen
//                 name="Profile"
//                 component={ProfileScreen}
//                 options={{
//                     tabBarIcon: ({ focused }) => (
//                         <View
//                             style={[
//                                 styles.tabIconContainer,
//                                 focused && styles.activeTabIconContainer,
//                             ]}>
//                             <AppIcon
//                                 family="feather"
//                                 name="user"
//                                 size={24}
//                                 color={
//                                     focused
//                                         ? colors.primary
//                                         : colors.textLight
//                                 }
//                             />
//                         </View>
//                     ),
//                 }}
//             />

//         </Tab.Navigator>
//     );
// };

// export default MainTabNavigator;

// const styles = StyleSheet.create({
//     screen: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//          backgroundColor: colors.background,
//         padding: 5
//     },

//     title: {
//         fontFamily: 'GoogleSans-Bold',
//         fontSize: 28,
//         color: colors.textPrimary,
//     },

//     // Normal icon container
//     tabIconContainer: {
//         width: 43,
//         height: 43,

//         borderRadius: 100,


//         alignItems: 'center',
//         justifyContent: 'center',

//         // borderWidth: 1,
//         borderColor: 'transparent',
//     },

//     // Active icon container
//     activeTabIconContainer: {
//         backgroundColor: colors.primaryLight,
//         borderColor: colors.primary,
//     },
// });


import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    createBottomTabNavigator,
    BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import HomeStack from '../stacks/Homestack';

import TripsScreen from '../../screens/trips/TripsScreen';
import EarningsScreen from '../../screens/earnings/EarningsScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';

import { AppIcon } from '../../icons';
import {
    colors,
    typography,
    spacing,
} from '../../theme';
import ProfileStack from '../stacks/Profilestack';

const Tab = createBottomTabNavigator();

const { width } = Dimensions.get('window');


// =====================================================
// CUSTOM TAB BAR
// =====================================================

const CustomTabBar = ({
    state,
    navigation,
}: BottomTabBarProps) => {

    const currentIndex = state.index;

    const TAB_COUNT = 4;
    const tabWidth = width / TAB_COUNT;

    const floatingButtonSize = 62;

    const centerOffset =
        (tabWidth - floatingButtonSize) / 2;

    const tabPositions = [
        centerOffset,
        tabWidth + centerOffset,
        tabWidth * 2 + centerOffset,
        tabWidth * 3 + centerOffset,
    ];

    // =================================================
    // ANIMATION
    // =================================================

    const translateX = useRef(
        new Animated.Value(tabPositions[0]),
    ).current;

    const scale = useRef(
        new Animated.Value(1),
    ).current;

    const rotate = useRef(
        new Animated.Value(0),
    ).current;


    useEffect(() => {

        // Position animation
        Animated.spring(translateX, {
            toValue: tabPositions[currentIndex],

            // Elastic / bouncy effect
            friction: 5,
            tension: 100,

            useNativeDriver: true,
        }).start();


        // Scale animation
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.82,
                duration: 80,
                useNativeDriver: true,
            }),

            Animated.spring(scale, {
                toValue: 1,
                friction: 4,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();


        // Small rotation effect
        Animated.sequence([
            Animated.timing(rotate, {
                toValue: 1,
                duration: 70,
                useNativeDriver: true,
            }),

            Animated.spring(rotate, {
                toValue: 0,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

    }, [currentIndex]);


    const rotateInterpolation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '8deg'],
    });


    // =================================================
    // TAB DATA
    // =================================================

    const tabs = [
        {
            name: 'Home',
            label: 'Home',
            iconFamily: 'ionicons' as const,
            icon: 'home-outline',
            activeIcon: 'home',
        },
        {
            name: 'Trips',
            label: 'Trips',
            iconFamily: 'material' as const,
            icon: 'ambulance',
            activeIcon: 'ambulance',
        },
        {
            name: 'Earnings',
            label: 'Earnings',
            iconFamily: 'ionicons' as const,
            icon: 'wallet-outline',
            activeIcon: 'wallet',
        },
        {
            name: 'Profile',
            label: 'Profile',
            iconFamily: 'feather' as const,
            icon: 'user',
            activeIcon: 'user',
        },
    ];


    // =================================================
    // TAB PRESS
    // =================================================

    const handleTabPress = (index: number) => {

        const tab = tabs[index];

        const isFocused =
            state.index === index;

        if (!isFocused) {

            navigation.navigate(tab.name);

        } else {

            // If already on the tab,
            // emit tabPress so nested navigation
            // can handle it if required.

            navigation.emit({
                type: 'tabPress',
                target: state.routes[index].key,
                canPreventDefault: true,
            });
        }
    };


    return (
        <View
            style={[
                styles.tabContainer,

                Platform.OS === 'ios' &&
                styles.iosTabContainer,
            ]}
        >

            {/* =================================================
                BLUE BACKGROUND
            ================================================= */}

            <View style={styles.backgroundCurve} />


            {/* =================================================
                FLOATING ACTIVE BUTTON
            ================================================= */}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.floatingButton,

                    {
                        transform: [
                            {
                                translateX,
                            },
                            {
                                scale,
                            },
                            {
                                rotate: rotateInterpolation,
                            },
                        ],
                    },
                ]}
            >

                <AppIcon
                    family={tabs[currentIndex].iconFamily}
                    name={
                        tabs[currentIndex].activeIcon
                    }
                    size={24}
                    color={colors.white}
                />

            </Animated.View>


            {/* =================================================
                TAB ITEMS
            ================================================= */}

            <View style={styles.rowFull}>

                {tabs.map((tab, index) => {

                    const focused =
                        currentIndex === index;

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            activeOpacity={0.8}
                            onPress={() =>
                                handleTabPress(index)
                            }
                            style={styles.tabItem}
                        >

                            {!focused && (
                                <View
                                    style={
                                        styles.inactiveTab
                                    }
                                >

                                    <AppIcon
                                        family={
                                            tab.iconFamily
                                        }
                                        name={tab.icon}
                                        size={23}
                                        color={
                                            colors.textPrimary
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.tabLabel
                                        }
                                    >
                                        {tab.label}
                                    </Text>

                                </View>
                            )}

                        </TouchableOpacity>
                    );
                })}

            </View>

        </View>
    );
};


// =====================================================
// MAIN TAB NAVIGATOR
// =====================================================

const MainTabNavigator = () => {

    return (
        <Tab.Navigator
            initialRouteName="Home"

            tabBar={(props) => (
                <CustomTabBar {...props} />
            )}

            screenOptions={{
                headerShown: false,
            }}
        >

            {/* =================================================
                HOME → HOME STACK
                ================================================= */}

            <Tab.Screen
                name="Home"
                component={HomeStack}
            />


            {/* =================================================
                TRIPS → DIRECT SCREEN
                ================================================= */}

            <Tab.Screen
                name="Trips"
                component={TripsScreen}
            />


            {/* =================================================
                EARNINGS → DIRECT SCREEN
                ================================================= */}

            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
            />


            {/* =================================================
                PROFILE → DIRECT SCREEN
                ================================================= */}

            <Tab.Screen
                name="Profile"
                component={ProfileStack}
            />



        </Tab.Navigator>
    );
};


export default MainTabNavigator;


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    // =================================================
    // MAIN CONTAINER
    // =================================================

    tabContainer: {
        position: 'absolute',

        bottom: 0,
        left: 0,
        right: 0,

        height: 65,

        justifyContent: 'flex-end',
    },

    iosTabContainer: {
        height: 100,
        paddingBottom: 22,
    },

    // =================================================
    // HEALTH GREEN CURVE
    // =================================================

    backgroundCurve: {
        position: 'absolute',

        bottom: 0,

        height: 70,
        width: '100%',

        alignSelf: 'center',

        // backgroundColor: 'rgba(17, 70, 243, 0.8)',

        // borderRadius: 15,

        // borderTopEndRadius: 15
    },

    // =================================================
    // TAB ROW
    // =================================================

    rowFull: {
        width: '100%',

        height: 70,

        flexDirection: 'row',

        alignItems: 'center',
        justifyContent: 'space-around',

        paddingHorizontal: spacing.sm,

        zIndex: 10,
    },

    // =================================================
    // TAB ITEM
    // =================================================

    tabItem: {
        width: width / 4,

        height: 70,

        alignItems: 'center',
        justifyContent: 'center',
    },

    // =================================================
    // INACTIVE TAB
    // =================================================

    inactiveTab: {
        alignItems: 'center',
        justifyContent: 'center',

        minWidth: 50,
    },

    // =================================================
    // LABEL
    // =================================================

    tabLabel: {
        marginTop: 1,

        fontFamily: 'GoogleSans-Regular',
        // fontSize: typography.fontSize.xs,

        color: colors.textPrimary,
    },

    // =================================================
    // ACTIVE FLOATING BUTTON
    // =================================================

    floatingButton: {
        position: 'absolute',

        left: 0,

        bottom: 14,

        width: 62,
        height: 62,

        borderRadius: 15,

        // backgroundColor: 'rgba(17, 70, 243, 1)',
        backgroundColor: colors.primary,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 3,
        borderColor: colors.white,

        elevation: 10,

        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 10,

        zIndex: 20,
    },


});