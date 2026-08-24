import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

type Country = {
    code: string;
    name: string;
    callingCode: string;
    flag: string;
};

const COUNTRIES: Country[] = [
    {
        code: 'IN',
        name: 'India',
        callingCode: '91',
        flag: '🇮🇳',
    },
    {
        code: 'US',
        name: 'United States',
        callingCode: '1',
        flag: '🇺🇸',
    },
    {
        code: 'GB',
        name: 'United Kingdom',
        callingCode: '44',
        flag: '🇬🇧',
    },
    {
        code: 'AE',
        name: 'United Arab Emirates',
        callingCode: '971',
        flag: '🇦🇪',
    },
    {
        code: 'AU',
        name: 'Australia',
        callingCode: '61',
        flag: '🇦🇺',
    },
    {
        code: 'CA',
        name: 'Canada',
        callingCode: '1',
        flag: '🇨🇦',
    },
    {
        code: 'DE',
        name: 'Germany',
        callingCode: '49',
        flag: '🇩🇪',
    },
    {
        code: 'FR',
        name: 'France',
        callingCode: '33',
        flag: '🇫🇷',
    },
    {
        code: 'SG',
        name: 'Singapore',
        callingCode: '65',
        flag: '🇸🇬',
    },
    {
        code: 'SA',
        name: 'Saudi Arabia',
        callingCode: '966',
        flag: '🇸🇦',
    },
];

const LoginScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryPickerVisible, setCountryPickerVisible] =
        useState(false);
    const navigation = useNavigation()


    const [selectedCountry, setSelectedCountry] =
        useState<Country>(COUNTRIES[0]);

    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    const isPhoneValid =
        selectedCountry.code === 'IN'
            ? cleanPhoneNumber.length === 10
            : cleanPhoneNumber.length >= 6;

    const handlePhoneChange = (text: string) => {
        const numbersOnly = text.replace(/[^0-9]/g, '');

        const maxLength =
            selectedCountry.code === 'IN' ? 10 : 15;

        setPhoneNumber(numbersOnly.slice(0, maxLength));
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setPhoneNumber('');
        setCountryPickerVisible(false);
    };

    const handleSendOTP = () => {
        if (!isPhoneValid) {
            return;
        }

        const fullPhoneNumber = `+${selectedCountry.callingCode}${cleanPhoneNumber}`;

        console.log('Send OTP for:', fullPhoneNumber);

        // API call here
        // Example:
        // await sendOTP(fullPhoneNumber);



        navigation.navigate("OTP" as never)

    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <View style={styles.content}>
                    <View style={styles.topSection}>

                        {/* =========================
                            Welcome Section
                        ========================== */}
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeTitle}>
                                Welcome Back!
                            </Text>

                            <Text style={styles.welcomeSubtitle}>
                                Login to continue
                            </Text>
                        </View>

                        {/* =========================
                            Phone Input
                        ========================== */}
                        <View style={styles.inputSection}>
                            <View style={styles.phoneInputContainer}>

                                {/* Country Selector */}
                                <TouchableOpacity
                                    style={styles.countrySelector}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        setCountryPickerVisible(true)
                                    }
                                >
                                    <Text style={styles.flag}>
                                        {selectedCountry.flag}
                                    </Text>

                                    <Text
                                        style={
                                            styles.callingCode
                                        }
                                    >
                                        +{selectedCountry.callingCode}
                                    </Text>

                                    <Text style={styles.arrow}>
                                        ▼
                                    </Text>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View style={styles.divider} />

                                {/* Phone Number */}
                                <TextInput
                                    style={styles.phoneInput}
                                    value={phoneNumber}
                                    onChangeText={handlePhoneChange}
                                    placeholder="98765 43210"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="phone-pad"
                                    maxLength={
                                        selectedCountry.code === 'IN'
                                            ? 10
                                            : 15
                                    }
                                    selectionColor="#2563EB"
                                    textAlignVertical="center"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* =========================
                            Send OTP Button
                        ========================== */}
                        <TouchableOpacity
                            style={[
                                styles.sendOTPButton,
                                !isPhoneValid &&
                                styles.sendOTPButtonDisabled,
                            ]}
                            onPress={handleSendOTP}
                            activeOpacity={0.8}
                            disabled={!isPhoneValid}
                        >
                            <Text style={styles.sendOTPText}>
                                Send OTP
                            </Text>
                        </TouchableOpacity>

                        {/* =========================
                            Footer
                        ========================== */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                By continuing, you agree to our
                            </Text>

                            <Text style={styles.footerText}>
                                <Text style={styles.footerLink}>
                                    Terms & Conditions
                                </Text>

                                {' & '}

                                <Text style={styles.footerLink}>
                                    Privacy Policy
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* =========================
                    Bottom Illustration
                ========================== */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={{
                            uri: 'https://via.placeholder.com/800x400/F4F7FB/888888?text=Ambulance+Illustration+Here',
                        }}
                        style={styles.illustrationImage}
                        resizeMode="cover"
                    />
                </View>
            </KeyboardAvoidingView>

            {/* =========================
                Country Picker Modal
            ========================== */}
            <Modal
                visible={countryPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() =>
                    setCountryPickerVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.countryModal}>

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Select Country
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setCountryPickerVisible(false)
                                }
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                            >
                                <Text style={styles.closeButton}>
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Country List */}
                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={(item) => item.code}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected =
                                    item.code ===
                                    selectedCountry.code;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.countryItem,
                                            isSelected &&
                                            styles.selectedCountryItem,
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() =>
                                            handleCountrySelect(
                                                item,
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.countryFlag
                                            }
                                        >
                                            {item.flag}
                                        </Text>

                                        <Text
                                            style={
                                                styles.countryName
                                            }
                                        >
                                            {item.name}
                                        </Text>

                                        <Text
                                            style={
                                                styles.countryCallingCode
                                            }
                                        >
                                            +{item.callingCode}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    /* =========================
       Container
    ========================== */

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
        paddingTop: 40,
        zIndex: 1,
    },

    topSection: {
        flex: 1,
    },

    /* =========================
       Welcome
    ========================== */

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

    /* =========================
       Phone Input
    ========================== */

    inputSection: {
        marginBottom: 24,
    },

    phoneInputContainer: {
        width: '100%',
        height: 60,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#FFFFFF',

        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',

        paddingHorizontal: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,

        elevation: 1,
    },

    countrySelector: {
        height: '100%',

        flexDirection: 'row',
        alignItems: 'center',

        paddingRight: 14,
    },

    flag: {
        fontSize: 21,
        lineHeight: 26,
        marginRight: 8,
    },

    callingCode: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '600',
        fontFamily: 'GoogleSans-Regular',
    },

    arrow: {
        fontSize: 8,
        color: '#64748B',
        marginLeft: 7,
        marginTop: 1,
    },

    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
        marginRight: 14,
    },

    phoneInput: {
        flex: 1,

        /*
         * Do NOT give the TextInput a fixed height.
         * The parent controls the 60px height.
         */
        height: '100%',

        fontSize: 18,
        lineHeight: 22,

        color: '#1E293B',
        fontWeight: '500',

        paddingHorizontal: 0,
        paddingVertical: 0,

        textAlignVertical: 'center',
        includeFontPadding: false,

        /*
         * Deliberately using system font here.
         * Android GoogleSans font metrics can cause
         * vertical clipping inside TextInput.
         */
        fontFamily:
            Platform.OS === 'android'
                ? 'sans-serif'
                : 'System',

        letterSpacing: 0.5,
    },

    /* =========================
       Send OTP
    ========================== */

    sendOTPButton: {
        height: 56,

        backgroundColor: '#2563EB',

        borderRadius: 12,

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 32,
    },

    sendOTPButtonDisabled: {
        backgroundColor: '#93C5FD',
    },

    sendOTPText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
        fontFamily: 'GoogleSans-Regular',
    },

    /* =========================
       Footer
    ========================== */

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

    /* =========================
       Illustration
    ========================== */

    illustrationContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'flex-end',
    },

    illustrationImage: {
        width: '100%',
        height: '100%',
    },

    /* =========================
       Country Modal
    ========================== */

    modalOverlay: {
        flex: 1,

        backgroundColor: 'rgba(0, 0, 0, 0.35)',

        justifyContent: 'flex-end',
    },

    countryModal: {
        backgroundColor: '#FFFFFF',

        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        maxHeight: '75%',

        paddingBottom: 20,
    },

    modalHeader: {
        height: 65,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 20,

        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'GoogleSans-Regular',
    },

    closeButton: {
        fontSize: 20,
        color: '#64748B',
    },

    countryItem: {
        minHeight: 58,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 20,

        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },

    selectedCountryItem: {
        backgroundColor: '#F8FAFC',
    },

    countryFlag: {
        fontSize: 22,
        width: 45,
    },

    countryName: {
        flex: 1,

        fontSize: 15,
        color: '#1E293B',

        fontFamily: 'GoogleSans-Regular',
    },

    countryCallingCode: {
        fontSize: 15,
        color: '#64748B',

        fontFamily: 'GoogleSans-Regular',
    },
});