import React, { useState, useEffect } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { UserInfoSkeleton } from '../../components/Skeleton';
import { useAppSelector } from '../../redux/hook';

interface InfoItemProps {
    icon: string;
    title: string;
    value: string;
    valueColor?: string;
    iconBg: string;
    iconColor: string;
    onPress?: () => void;
}

const UserInfo = () => {
    const user = useAppSelector(state => state.auth.user);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 700);
        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setIsLoading(true);
        setTimeout(() => {
            setRefreshing(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleVehicle = () => {
        console.log('Vehicle Info');
    };

    const handleExperience = () => {
        console.log('Experience');
    };

    const handleDocuments = () => {
        console.log('Documents');
    };

    const renderInfoItem = ({
        icon,
        title,
        value,
        valueColor,
        iconBg,
        iconColor,
        onPress,
    }: InfoItemProps) => {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.infoRow}
                onPress={onPress}
            >
                {/* ICON */}

                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: iconBg },
                    ]}
                >
                    <AppIcon
                        family="material"
                        name={icon}
                        size={19}
                        color={iconColor}
                    />
                </View>

                {/* TEXT */}

                <View style={styles.infoContent}>
                    <Text
                        style={styles.infoTitle}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    <Text
                        style={[
                            styles.infoValue,
                            valueColor ? { color: valueColor } : null,
                        ]}
                        numberOfLines={1}
                    >
                        {value}
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
        );
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* ================= HEADER ================= */}

            <Header
                backEnabled
                title="User Information"
                showRightIcon={false}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {isLoading ? (
                    <UserInfoSkeleton />
                ) : (
                    <>
                        {/* ================= PROFILE ================= */}

                        <View style={styles.profileSection}>

                            <View style={styles.avatarContainer}>
                                <AppIcon
                                    family="material"
                                    name="account"
                                    size={40}
                                    color={colors.primary}
                                />
                            </View>

                            <Text style={styles.userName}>
                                {user?.name || 'Ambulance Driver'}
                            </Text>

                            <Text style={styles.phoneNumber}>
                                {user?.mobile_number ? `+91 ${user.mobile_number}` : (user?.phone ? `+91 ${user.phone}` : '+91 98765 43210')}
                            </Text>

                        </View>

                        {/* ================= INFORMATION CARD ================= */}

                        <Text style={styles.sectionTitle}>
                            Driver Details
                        </Text>

                <View style={styles.infoCard}>

                    {/* VEHICLE */}

                    {renderInfoItem({
                        icon: 'car-outline',
                        title: 'Vehicle Info',
                        value: 'KA 01 AB 1234',
                        iconBg: colors.primaryLight,
                        iconColor: colors.primary,
                        onPress: handleVehicle,
                    })}

                    <View style={styles.divider} />

                    {/* EXPERIENCE */}

                    {renderInfoItem({
                        icon: 'briefcase-outline',
                        title: 'Experience',
                        value: '3 Years',
                        iconBg: colors.warningLight,
                        iconColor: colors.warning,
                        onPress: handleExperience,
                    })}

                    <View style={styles.divider} />

                    {/* DOCUMENTS */}

                    {renderInfoItem({
                        icon: 'file-document-outline',
                        title: 'Documents',
                        value: 'Verified',
                        valueColor: colors.successDark,
                        iconBg: colors.successLight,
                        iconColor: colors.successDark,
                        onPress: handleDocuments,
                    })}

                </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserInfo;

const styles = StyleSheet.create({
    // =====================================================
    // SCREEN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileSection: {
        alignItems: 'center',

        paddingTop: 8,
        paddingBottom: 16,
    },

    avatarContainer: {
        width: 76,
        height: 76,

        borderRadius: 38,

        backgroundColor: colors.primaryLight,

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        borderWidth: 1,
        borderColor: colors.border,

        marginBottom: 8,
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        lineHeight: 16,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,

        marginTop: 3,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textSecondary,

        marginTop: 3,
    },

    // =====================================================
    // SECTION TITLE
    // =====================================================

    sectionTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textLight,
        letterSpacing: 0.6,
        textTransform: 'uppercase',

        marginBottom: 8,
        marginLeft: 2,
    },

    // =====================================================
    // INFORMATION CARD
    // =====================================================

    infoCard: {
        backgroundColor: colors.card,

        borderRadius: 18,

        paddingHorizontal: 14,

        borderWidth: 1,
        borderColor: colors.border,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },

    // =====================================================
    // INFO ROW
    // =====================================================

    infoRow: {
        height: 56,

        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 38,
        height: 38,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 10,
    },

    // =====================================================
    // CONTENT
    // =====================================================

    infoContent: {
        flex: 1,

        justifyContent: 'center',
    },

    infoTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        lineHeight: 14,
        includeFontPadding: false,
        color: colors.textPrimary,
        letterSpacing: 0.1,

        marginBottom: 2,
    },

    infoValue: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 13,
        includeFontPadding: false,
        color: colors.textSecondary,
    },

    chevronContainer: {
        width: 26,
        height: 26,

        borderRadius: 13,

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
        marginLeft: 48,
    },
});