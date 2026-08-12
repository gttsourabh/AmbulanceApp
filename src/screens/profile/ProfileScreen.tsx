import React from 'react';
import {
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
    onPress: () => void;
}

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileNavigationProp>();

    const profileOptions: ProfileOption[] = [
        {
            title: 'User Information',
            subtitle: 'View and manage your personal information',
            icon: 'account-outline',
            iconFamily: 'material',
            onPress: () => navigation.navigate('UserInfo'),
        },
        {
            title: 'Vehicle Information',
            subtitle: 'View and manage your vehicle details',
            icon: 'car-outline',
            iconFamily: 'material',
            onPress: () => navigation.navigate('VehicleDocument'),
        },
        {
            title: 'Settings',
            subtitle: 'Manage app preferences',
            icon: 'settings-outline',
            iconFamily: 'ionicons',
            onPress: () => navigation.navigate('Settings'),
        },
        {
            title: 'Help & Support',
            subtitle: 'Get help or contact support',
            icon: 'help-circle-outline',
            iconFamily: 'ionicons',
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
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{
                                uri: 'https://i.pravatar.cc/300?img=12',
                            }}
                            style={styles.profileImage}
                        />
                    </View>

                    <Text style={styles.profileName}>
                        Ramesh Kumar
                    </Text>

                    <Text style={styles.phoneNumber}>
                        +91 98765 43210
                    </Text>
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

                                <View style={styles.iconContainer}>
                                    <AppIcon
                                        family={item.iconFamily}
                                        name={item.icon}
                                        size={20}
                                        color={colors.textSecondary}
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

                                <AppIcon
                                    family="material"
                                    name="chevron-right"
                                    size={21}
                                    color={colors.textLight}
                                />
                            </TouchableOpacity>

                            {/* DIVIDER */}

                            {index !== profileOptions.length - 1 && (
                                <View style={styles.divider} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

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
        backgroundColor: colors.white,
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
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },

    profileImageContainer: {
        width: 82,
        height: 82,
        borderRadius: 31,
        backgroundColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },

    profileImage: {
        width: '100%',
        height: '100%',
    },

    profileName: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    // =====================================================
    // OPTIONS CARD
    // =====================================================

    optionsCard: {
        backgroundColor: colors.white,
        borderRadius: spacing.md,
        paddingHorizontal: spacing.md,
        ...shadows.card,
    },

    // =====================================================
    // OPTION ROW
    // =====================================================

    optionRow: {
        minHeight: 70,
        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: spacing.sm,
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
    },

    optionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textPrimary,
        marginBottom: 3,
    },

    optionSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },

    // =====================================================
    // DIVIDER
    // =====================================================

    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginLeft: 50,
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