import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AppIcon } from '../../icons/index';

interface SplashScreenProps {
    onFinish: (authenticated: boolean) => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
    const progress = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),

            Animated.timing(progress, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: false,
            }),
        ]).start();

        const timer = setTimeout(() => {

            onFinish(false);

        }, 2500);

        return () => {
            clearTimeout(timer);
        };
    }, [fadeAnim, progress, onFinish]);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>

            {/* Logo */}
            <Animated.View
                style={[
                    styles.logoSection,
                    {
                        opacity: fadeAnim,
                    },
                ]}>
                <AppIcon
                    family="material"
                    name="heart"
                    size={85}
                    color="#155EEF"
                />

                <Text style={styles.logoText}>ARVAYA</Text>

                <Text style={styles.tagline}>
                    Care · Track · Save Lives
                </Text>
            </Animated.View>

            {/* Driver App */}
            <Text style={styles.driverText}>
                Driver App
            </Text>

            {/* City Background */}
            <View style={styles.cityContainer}>

                <View style={[styles.building, styles.b1]} />
                <View style={[styles.building, styles.b2]} />
                <View style={[styles.building, styles.b3]} />
                <View style={[styles.building, styles.b4]} />
                <View style={[styles.building, styles.b5]} />
                <View style={[styles.building, styles.b6]} />
                <View style={[styles.building, styles.b7]} />

                <View style={styles.ground} />

            </View>

            {/* Bottom */}
            <View style={styles.bottomSection}>

                <Text style={styles.poweredText}>
                    Powered by Arvaya
                </Text>

                <View style={styles.progressBackground}>
                    <Animated.View
                        style={[
                            styles.progress,
                            {
                                width: progressWidth,
                            },
                        ]}
                    />
                </View>

            </View>

        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F8F9FF',
        alignItems: 'center',
        fontFamily: 'GoogleSans-Regular',
        fontSize: 20,
    },

    // Logo
    logoSection: {
        alignItems: 'center',
        marginTop: '25%',
    },

    logoText: {
        marginTop: 5,
        fontSize: 38,
        fontWeight: '800',
        letterSpacing: 2,
        color: '#155EEF',
        fontFamily: 'GoogleSans-Regular',

    },

    tagline: {
        marginTop: 3,
        fontSize: 16,
        fontWeight: '500',
        color: '#5575C8',
        fontFamily: 'GoogleSans-Regular',

    },

    // Driver
    driverText: {
        marginTop: '12%',
        fontSize: 23,
        fontWeight: '700',
        color: '#12336B',
        fontFamily: 'GoogleSans-Regular',

    },

    // City
    cityContainer: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        height: 150,
        flexDirection: 'row',
        alignItems: 'flex-end',
        opacity: 0.3,
        fontFamily: 'GoogleSans-Regular',

    },

    building: {
        backgroundColor: '#DDE5FA',
        marginRight: 3,
        fontFamily: 'GoogleSans-Regular',

    },

    b1: {
        width: '12%',
        height: 70,
    },

    b2: {
        width: '14%',
        height: 105,
    },

    b3: {
        width: '10%',
        height: 60,
    },

    b4: {
        width: '15%',
        height: 125,
    },

    b5: {
        width: '12%',
        height: 85,
    },

    b6: {
        width: '15%',
        height: 110,
    },

    b7: {
        width: '12%',
        height: 70,
    },

    ground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 25,
        backgroundColor: '#E7ECFA',
    },

    // Bottom
    bottomSection: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    poweredText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#253B6B',
        marginBottom: 18,
        fontFamily: 'GoogleSans-Regular',

    },

    progressBackground: {
        width: '65%',
        height: 4,
        borderRadius: 5,
        backgroundColor: '#DCE3F8',
        overflow: 'hidden',
        
    },

    progress: {
        height: 4,
        borderRadius: 5,
        backgroundColor: '#155EEF',
    },
});