import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import {
    createBottomTabNavigator,
    BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeStack from '../stacks/Homestack';
import TripsScreen from '../../screens/trips/TripsScreen';
import EarningsScreen from '../../screens/earnings/EarningsScreen';
import ProfileStack from '../stacks/Profilestack';

import { AppIcon, IconFamily } from '../../icons';
import { colors } from '../../theme';

// =====================================================
// TAB CONFIGURATION
// =====================================================

interface TabConfig {
    name: string;
    label: string;
    iconFamily: IconFamily;
    activeIcon: string;
    inactiveIcon: string;
    hasLiveBadge?: boolean;
}

const TABS: TabConfig[] = [
    {
        name: 'Home',
        label: 'Home',
        iconFamily: 'ionicons',
        activeIcon: 'home',
        inactiveIcon: 'home-outline',
        hasLiveBadge: true,
    },
    {
        name: 'Trips',
        label: 'Trips',
        iconFamily: 'material',
        activeIcon: 'ambulance',
        inactiveIcon: 'ambulance',
    },
    {
        name: 'Earnings',
        label: 'Earnings',
        iconFamily: 'ionicons',
        activeIcon: 'wallet',
        inactiveIcon: 'wallet-outline',
    },
    {
        name: 'Profile',
        label: 'Profile',
        iconFamily: 'ionicons',
        activeIcon: 'person',
        inactiveIcon: 'person-outline',
    },
];

const TAB_BAR_HEIGHT = 66;
const BUTTON_SIZE = 54;

// =====================================================
// CUSTOM FLOATING RAISED CIRCLE AMBULANCE TAB BAR
// =====================================================

const CustomTabBar: React.FC<BottomTabBarProps> = ({
    state,
    navigation,
}) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const currentIndex = state.index;
    const tabCount = TABS.length;

    // Outer margin = 16 each side (32 total)
    const containerWidth = width - 32;
    const tabWidth = containerWidth / tabCount;
    // Exactly center the raised button over the active tab slot
    const sliderOffset = (tabWidth - BUTTON_SIZE) / 2;

    // Sliding indicator translation for the active raised button
    const translateX = useRef(
        new Animated.Value(currentIndex * tabWidth + sliderOffset),
    ).current;

    // Scale bounce for the raised circle on tab change
    const raisedScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Slide active raised button smoothly to selected tab
        Animated.spring(translateX, {
            toValue: currentIndex * tabWidth + sliderOffset,
            friction: 8,
            tension: 65,
            useNativeDriver: true,
        }).start();

        // Bounce pop effect for raised button
        Animated.sequence([
            Animated.timing(raisedScale, {
                toValue: 0.88,
                duration: 70,
                useNativeDriver: true,
            }),
            Animated.spring(raisedScale, {
                toValue: 1,
                friction: 4,
                tension: 130,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex, tabWidth, sliderOffset]);

    const handleTabPress = (index: number) => {
        const route = state.routes[index];
        const isFocused = state.index === index;

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const activeTab = TABS[currentIndex];

    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.floatingWrapper,
                {
                    bottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
                },
            ]}
        >
            <View style={styles.tabBarContainer}>
                {/* SLIDING RAISED CIRCLE BUTTON */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.slidingRaisedContainer,
                        {
                            transform: [
                                { translateX },
                                { scale: raisedScale },
                            ],
                        },
                    ]}
                >
                    <View style={styles.floatingColoredButton}>
                        <AppIcon
                            family={activeTab.iconFamily}
                            name={activeTab.activeIcon}
                            size={24}
                            color={colors.white}
                        />
                    </View>
                </Animated.View>

                {/* TAB ITEMS */}
                {TABS.map((tab, index) => {
                    const isFocused = currentIndex === index;

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            activeOpacity={0.75}
                            onPress={() => handleTabPress(index)}
                            style={[styles.tabItem, { width: tabWidth }]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isFocused }}
                            accessibilityLabel={tab.label}
                        >
                            <View style={styles.tabItemContent}>
                                {/* INACTIVE ICON (HIDDEN WHEN ACTIVE BECAUSE RAISED CIRCLE SHOWS IT) */}
                                <View
                                    style={[
                                        styles.iconContainer,
                                        isFocused && styles.hiddenIcon,
                                    ]}
                                >
                                    <AppIcon
                                        family={tab.iconFamily}
                                        name={tab.inactiveIcon}
                                        size={22}
                                        color="#7A8B97"
                                    />

                                    {/* LIVE ONLINE BEACON FOR AMBULANCE DRIVER */}
                                    {tab.hasLiveBadge && (
                                        <View style={styles.liveBadgeDot} />
                                    )}
                                </View>

                                {/* TAB LABEL */}
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        isFocused
                                            ? styles.activeTabLabel
                                            : styles.inactiveTabLabel,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {tab.label}
                                </Text>
                            </View>
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

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Trips" component={TripsScreen} />
            <Tab.Screen name="Earnings" component={EarningsScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
    floatingWrapper: {
        position: 'absolute',
        left: 16,
        right: 16,
        alignItems: 'center',
        zIndex: 100,
    },

    tabBarContainer: {
        width: '100%',
        height: TAB_BAR_HEIGHT,
        borderRadius: 24,
        backgroundColor: colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',

        // Ambient diffuse elevation
        shadowColor: '#102A30',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 10,
    },

    slidingRaisedContainer: {
        position: 'absolute',
        top: -18,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
    },

    floatingColoredButton: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',

        // Vibrant ambient shadow on the standalone floating button
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 12,
    },

    tabItem: {
        height: TAB_BAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 9,
        zIndex: 10,
    },

    tabItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    iconContainer: {
        width: 28,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    hiddenIcon: {
        opacity: 0,
    },

    liveBadgeDot: {
        position: 'absolute',
        top: -1,
        right: 1,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: colors.success,
        borderWidth: 1.5,
        borderColor: colors.card,
    },

    tabLabel: {
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        marginTop: 4,
        letterSpacing: 0.2,
        textAlign: 'center',
    },

    activeTabLabel: {
        fontFamily: 'GoogleSans-Bold',
        color: '#1A1A1A',
    },

    inactiveTabLabel: {
        fontFamily: 'GoogleSans-Medium',
        color: '#7A8B97',
    },
});



