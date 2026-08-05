import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Arvaya</Text>
            <Text>Driver App</Text>
        </View>
    );
};

const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
        </View>
    );
};

const OtpScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>OTP Verification</Text>
        </View>
    );
};

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OtpScreen} />
        </Stack.Navigator>
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

export default AuthNavigator;