import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

import { colors, typography, shadows, spacing } from '../../theme';
import { AppIcon } from '../../icons';

interface ButtonProps {
    title: string;
    onPress: () => void;

    icon?: string;
    iconFamily?: any;
    iconSize?: number;

    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
    loading?: boolean;

    style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    icon,
    iconFamily = 'material',
    iconSize = 18,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.button,
                styles[`${variant}Button`],
                isDisabled && styles.disabledButton,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={
                        variant === 'outline'
                            ? '#315EFF'
                            : colors.white
                    }
                />
            ) : (
                <>
                    {icon && (
                        <AppIcon
                            family={iconFamily}
                            name={icon}
                            size={iconSize}
                            color={
                                variant === 'outline'
                                    ? '#315EFF'
                                    : colors.white
                            }
                        />
                    )}

                    <Text
                        style={[
                            styles.text,
                            styles[`${variant}Text`],
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        height: 48,

        borderRadius: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        gap: spacing.xs,

        ...shadows.card,
    },

    // =====================================================
    // PRIMARY
    // =====================================================

    primaryButton: {
        backgroundColor: '#315EFF',
    },

    primaryText: {
        color: colors.white,
    },

    // =====================================================
    // SECONDARY
    // =====================================================

    secondaryButton: {
        backgroundColor: '#173B91',
    },

    secondaryText: {
        color: colors.white,
    },

    // =====================================================
    // DANGER
    // =====================================================

    dangerButton: {
        backgroundColor: '#EF4444',
    },

    dangerText: {
        color: colors.white,
    },

    // =====================================================
    // OUTLINE
    // =====================================================

    outlineButton: {
        backgroundColor: colors.white,

        borderWidth: 1,
        borderColor: '#315EFF',
    },

    outlineText: {
        color: '#315EFF',
    },

    // =====================================================
    // TEXT
    // =====================================================

    text: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xs,
    },

    // =====================================================
    // DISABLED
    // =====================================================

    disabledButton: {
        opacity: 0.5,
    },
});