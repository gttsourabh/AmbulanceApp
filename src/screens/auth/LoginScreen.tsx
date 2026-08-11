import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
} from 'react-native';

const LoginScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSendOTP = () => {
        // Handle OTP sending logic here
        console.log('Send OTP for:', phoneNumber);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <View style={styles.topSection}>
                        {/* Welcome Section */}
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                            <Text style={styles.welcomeSubtitle}>Login to continue</Text>
                        </View>

                        {/* Phone Input Section */}
                        <View style={styles.inputSection}>
                            <View style={styles.phoneInputContainer}>
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.flagIcon}>🇺🇸</Text>
                                    <Text style={styles.countryCodeText}>+91</Text>
                                    <Text style={styles.dropdownIcon}>▼</Text>
                                </View>
                                <View style={styles.divider} />
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="98765 43210"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        {/* Send OTP Button */}
                        <TouchableOpacity
                            style={styles.sendOTPButton}
                            onPress={handleSendOTP}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sendOTPText}>Send OTP</Text>
                        </TouchableOpacity>

                        {/* Footer Terms */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>By continuing, you agree to our</Text>
                            <Text style={styles.footerText}>
                                <Text style={styles.footerLink}>Terms & Conditions</Text>
                                {' & '}
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Illustration */}
                <View style={styles.illustrationContainer}>
                    <Image
                        // Replace this URI with your local image asset, e.g.:
                        // source={require('./assets/ambulance-city.png')}
                        source={{ uri: 'https://via.placeholder.com/800x400/F4F7FB/888888?text=Ambulance+Illustration+Here' }}
                        style={styles.illustrationImage}
                        resizeMode="cover"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40, // Increased top padding slightly to account for the removed status bar space
        zIndex: 1,
    },
    topSection: {
        flex: 1,
    },
    // Welcome Section
    welcomeSection: {
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 8,
        fontFamily: 'GoogleSans-Regular',

    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
        letterSpacing: 0.2,
        fontFamily: 'GoogleSans-Regular',

    },
    // Phone Input
    inputSection: {
        marginBottom: 24,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        height: 60,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        fontFamily: 'GoogleSans-Regular',

    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
    },
    flagIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginRight: 4,
        fontFamily: 'GoogleSans-Regular',

    },
    dropdownIcon: {
        fontSize: 10,
        color: '#64748B',
        marginLeft: 2,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
        marginRight: 12,
    },
    phoneInput: {
        flex: 1,
        fontSize: 18,
        color: '#1E293B',
        paddingVertical: 0,
        fontWeight: '500',
        letterSpacing: 0.5,
        fontFamily: 'GoogleSans-Regular',

    },
    // Send OTP Button
    sendOTPButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        fontFamily: 'GoogleSans-Regular',

    },
    sendOTPText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
        fontFamily: 'GoogleSans-Regular',

    },
    // Footer
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        letterSpacing: 0.2,
        fontWeight: '500',
        fontFamily: 'GoogleSans-Regular',

    },
    footerLink: {
        color: '#2563EB',
        fontWeight: '700',
        fontFamily: 'GoogleSans-Regular',

    },
    // Bottom Illustration
    illustrationContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'flex-end',
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
});