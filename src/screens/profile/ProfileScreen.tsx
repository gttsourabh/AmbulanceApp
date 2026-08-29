import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../redux/hook';
import { logout } from '../../redux/slices/authSlice';
import { storage } from '../../storage/storage';

import {
    colors,
    typography,
    shadows,
    spacing,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { ProfileStackParamList } from '../../Navigation/stacks/Profilestack';

type ProfileNavigationProp =
    NativeStackNavigationProp<ProfileStackParamList>;

interface ProfileOption {
    title: string;
    subtitle: string;
    icon: string;
    iconFamily: 'material' | 'ionicons' | 'feather' | 'fontawesome';
    iconBg: string;
    iconColor: string;
    onPress: () => void;
}

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileNavigationProp>();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await storage.clear();
                        dispatch(logout());
                    },
                },
            ],
        );
    };

    const profileOptions: ProfileOption[] = [
        {
            title: 'User Information',
            subtitle: 'View and manage your personal information',
            icon: 'account-outline',
            iconFamily: 'material',
            iconBg: colors.primaryLight,
            iconColor: colors.primary,
            onPress: () => navigation.navigate('UserInfo'),
        },
        {
            title: 'Vehicle Information',
            subtitle: 'View and manage your vehicle details',
            icon: 'car-outline',
            iconFamily: 'material',
            iconBg: colors.infoLight,
            iconColor: colors.info,
            onPress: () => navigation.navigate('VehicleDocument'),
        },
        {
            title: 'Settings',
            subtitle: 'Manage app preferences',
            icon: 'settings-outline',
            iconFamily: 'ionicons',
            iconBg: colors.warningLight,
            iconColor: colors.warning,
            onPress: () => navigation.navigate('Settings'),
        },
        {
            title: 'Help & Support',
            subtitle: 'Get help or contact support',
            icon: 'help-circle-outline',
            iconFamily: 'ionicons',
            iconBg: colors.successLight,
            iconColor: colors.successDark,
            onPress: () => navigation.navigate('Help'),
        },
    ];

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* HEADER */}

            <Header

                title="Profile"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* PROFILE */}

                <View style={styles.profileSection}>
                    <View style={styles.profileImageRing}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{
                                    uri: 'https://i.pravatar.cc/300?img=12',
                                }}
                                style={styles.profileImage}
                            />
                        </View>

                        <View style={styles.editBadge}>
                            <AppIcon
                                family="material"
                                name="pencil"
                                size={12}
                                color={colors.white}
                            />
                        </View>
                    </View>

                    <Text style={styles.profileName}>
                        Ramesh Kumar
                    </Text>

                    <Text style={styles.phoneNumber}>
                        +91 98765 43210
                    </Text>

                    <View style={styles.verifiedPill}>
                        <AppIcon
                            family="material"
                            name="check-decagram"
                            size={13}
                            color={colors.successDark}
                        />

                        <Text style={styles.verifiedText}>
                            Verified Driver
                        </Text>
                    </View>
                </View>

                {/* PROFILE OPTIONS */}

                <View style={styles.optionsCard}>
                    {profileOptions.map((item, index) => (
                        <React.Fragment key={item.title}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.optionRow}
                                onPress={item.onPress}
                            >
                                {/* ICON */}

                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: item.iconBg },
                                    ]}
                                >
                                    <AppIcon
                                        family={item.iconFamily}
                                        name={item.icon}
                                        size={20}
                                        color={item.iconColor}
                                    />
                                </View>

                                {/* TEXT */}

                                <View style={styles.optionContent}>
                                    <Text style={styles.optionTitle}>
                                        {item.title}
                                    </Text>

                                    <Text style={styles.optionSubtitle}>
                                        {item.subtitle}
                                    </Text>
                                </View>

                                {/* ARROW */}

                                <View style={styles.chevronContainer}>
                                    <AppIcon
                                        family="material"
                                        name="chevron-right"
                                        size={19}
                                        color={colors.textLight}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* DIVIDER */}

                            {index !== profileOptions.length - 1 && (
                                <View style={styles.divider} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {/* LOGOUT */}

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <AppIcon
                        family="material"
                        name="logout"
                        size={18}
                        color={colors.danger}
                    />

                    <Text style={styles.logoutText}>
                        Log Out
                    </Text>
                </TouchableOpacity>

                {/* VERSION */}

                <Text style={styles.versionText}>
                    Version 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
         backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.huge,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileSection: {
        alignItems: 'center',
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },

    profileImageRing: {
        width: 96,
        height: 96,

        borderRadius: 48,

        alignItems: 'center',
        justifyContent: 'center',

        marginBottom: spacing.md,

        backgroundColor: colors.card,

        borderWidth: 2,
        borderColor: colors.primaryLight,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },

    profileImageContainer: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    profileImage: {
        width: '100%',
        height: '100%',
    },

    editBadge: {
        position: 'absolute',

        bottom: 0,
        right: 0,

        width: 26,
        height: 26,

        borderRadius: 13,

        backgroundColor: colors.primary,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 2,
        borderColor: colors.card,
    },

    profileName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: 4,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },

    verifiedPill: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 10,
        paddingVertical: 4,

        borderRadius: 20,

        backgroundColor: colors.successLight,

        gap: 4,
    },

    verifiedText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        color: colors.successDark,
        letterSpacing: 0.2,
    },

    // =====================================================
    // OPTIONS CARD
    // =====================================================

    optionsCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderColor: colors.border,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },

    // =====================================================
    // OPTION ROW
    // =====================================================

    optionRow: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },

    // =====================================================
    // CONTENT
    // =====================================================

    optionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: spacing.xs,
    },

    optionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: 3,
    },

    optionSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    chevronContainer: {
        width: 28,
        height: 28,

        borderRadius: 14,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.background,
    },

    // =====================================================
    // DIVIDER
    // =====================================================

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 52,
    },

    // =====================================================
    // LOGOUT
    // =====================================================

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: spacing.xs,

        minHeight: 54,

        marginTop: spacing.lg,

        borderRadius: 16,

        backgroundColor: colors.dangerLight,
    },

    logoutText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.danger,
        letterSpacing: 0.1,
    },

    // =====================================================
    // VERSION
    // =====================================================

    versionText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
});