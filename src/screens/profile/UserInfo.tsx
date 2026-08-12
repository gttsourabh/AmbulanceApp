import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, shadows, spacing } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface InfoItemProps {
    icon: string;
    title: string;
    value: string;
    valueColor?: string;
    onPress?: () => void;
}

const UserInfo = () => {
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
        onPress,
    }: InfoItemProps) => {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.infoRow}
                onPress={onPress}
            >
                {/* ICON */}

                <View style={styles.iconContainer}>
                    <AppIcon
                        family="material"
                        name={icon}
                        size={19}
                        color={colors.textSecondary}
                    />
                </View>

                {/* TEXT */}

                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>
                        {title}
                    </Text>

                    <Text
                        style={[
                            styles.infoValue,
                            valueColor ? { color: valueColor } : null,
                        ]}
                    >
                        {value}
                    </Text>
                </View>

                {/* ARROW */}

                <AppIcon
                    family="material"
                    name="chevron-right"
                    size={20}
                    color={colors.textLight}
                />
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

            <View style={styles.content}>

                {/* ================= PROFILE ================= */}

                <View style={styles.profileSection}>

                    <View style={styles.avatarContainer}>
                        <AppIcon
                            family="material"
                            name="account"
                            size={42}
                            color={colors.textSecondary}
                        />
                    </View>

                    <Text style={styles.userName}>
                        Ramesh Kumar
                    </Text>

                    <Text style={styles.phoneNumber}>
                        +91 98765 43210
                    </Text>

                </View>

                {/* ================= INFORMATION CARD ================= */}

                <View style={styles.infoCard}>

                    {/* VEHICLE */}

                    {renderInfoItem({
                        icon: 'car-outline',
                        title: 'Vehicle Info',
                        value: 'KA 01 AB 1234',
                        onPress: handleVehicle,
                    })}

                    <View style={styles.divider} />

                    {/* EXPERIENCE */}

                    {renderInfoItem({
                        icon: 'briefcase-outline',
                        title: 'Experience',
                        value: '3 Years',
                        onPress: handleExperience,
                    })}

                    <View style={styles.divider} />

                    {/* DOCUMENTS */}

                    {renderInfoItem({
                        icon: 'file-document-outline',
                        title: 'Documents',
                        value: 'Verified',
                        valueColor: '#22A06B',
                        onPress: handleDocuments,
                    })}

                </View>

            </View>
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
        backgroundColor: colors.white,
    },

    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileSection: {
        alignItems: 'center',

        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
    },

    avatarContainer: {
        width: 72,
        height: 72,

        borderRadius: 36,

        backgroundColor: '#F1F3F5',

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        marginBottom: spacing.xs,
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 13,
        color: colors.textPrimary,

        marginTop: 3,
    },

    phoneNumber: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textSecondary,

        marginTop: 3,
    },

    // =====================================================
    // INFORMATION CARD
    // =====================================================

    infoCard: {
        backgroundColor: colors.white,

        borderRadius: spacing.md,

        paddingHorizontal: spacing.md,

        ...shadows.card,
    },

    // =====================================================
    // INFO ROW
    // =====================================================

    infoRow: {
        minHeight: 58,

        flexDirection: 'row',
        alignItems: 'center',
    },

    // =====================================================
    // ICON
    // =====================================================

    iconContainer: {
        width: 36,

        alignItems: 'flex-start',
        justifyContent: 'center',
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
        color: colors.textPrimary,

        marginBottom: 3,
    },

    infoValue: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textSecondary,
    },

    // =====================================================
    // DIVIDER
    // =====================================================

    divider: {
        height: 1,
        backgroundColor: colors.divider,
    },
});