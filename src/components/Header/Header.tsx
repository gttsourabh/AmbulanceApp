import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppIcon } from '../../icons';
import {
    colors,
    typography,
    spacing,
} from '../../theme';

interface HeaderProps {
    title?: string;

    // Back
    backEnabled?: boolean;

    // Left
    leftIcon?: string;
    leftIconFamily?: 'material' | 'ionicons' | 'feather' | 'fontawesome';
    leftIconSize?: number;
    leftIconColor?: string;
    onLeftPress?: () => void;
    showLeftIcon?: boolean;

    // Right
    rightIcon?: string;
    rightIconFamily?: 'material' | 'ionicons' | 'feather' | 'fontawesome';
    rightIconSize?: number;
    rightIconColor?: string;
    onRightPress?: () => void;
    showRightIcon?: boolean;

    // Center
    centerContent?: React.ReactNode;

    // Styling
    backgroundColor?: string;
    titleSize?: number;
    titleColor?: string;
}

const Header: React.FC<HeaderProps> = ({
    title,

    backEnabled = false,

    leftIcon,
    leftIconFamily = 'material',
    leftIconSize = 24,
    leftIconColor = colors.textPrimary,
    onLeftPress,
    showLeftIcon = true,

    rightIcon,
    rightIconFamily = 'material',
    rightIconSize = 24,
    rightIconColor = colors.textPrimary,
    onRightPress,
    showRightIcon = true,

    centerContent,

    backgroundColor = colors.white,
    titleSize = typography.fontSize.lg,
    titleColor = colors.textPrimary,
}) => {

    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor,
                },
            ]}
        >

            {/* LEFT */}
            <View style={styles.side}>

                {backEnabled ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.iconButton}
                        onPress={handleBack}
                    >
                        <AppIcon
                            family="ionicons"
                            name="chevron-back"
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                ) : showLeftIcon && leftIcon ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.iconButton}
                        onPress={onLeftPress}
                    >
                        <AppIcon
                            family={leftIconFamily}
                            name={leftIcon}
                            size={leftIconSize}
                            color={leftIconColor}
                        />
                    </TouchableOpacity>
                ) : null}

            </View>

            {/* CENTER */}
            <View style={styles.center}>

                {centerContent ? (
                    centerContent
                ) : title ? (
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.title,
                            {
                                fontSize: titleSize,
                                color: titleColor,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                ) : null}

            </View>

            {/* RIGHT */}
            <View style={styles.side}>

                {showRightIcon && rightIcon ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.iconButton}
                        onPress={onRightPress}
                    >
                        <AppIcon
                            family={rightIconFamily}
                            name={rightIcon}
                            size={rightIconSize}
                            color={rightIconColor}
                        />
                    </TouchableOpacity>
                ) : null}

            </View>

        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        height: 58,
        paddingHorizontal: spacing.md,

        flexDirection: 'row',
        alignItems: 'center',
    },

    side: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontFamily: 'GoogleSans-Bold',
        // fontWeight: typography.fontWeight.bold,
    },

    iconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
});