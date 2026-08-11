import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '../../theme';

interface LoaderProps {
    visible?: boolean;
    message?: string;
    size?: 'small' | 'large';
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    visible = true,
    message,
    size = 'large',
    fullScreen = false,
}) => {
    if (!visible) {
        return null;
    }

    if (fullScreen) {
        return (
            <View style={styles.overlay}>
                <View style={styles.loaderBox}>
                    <ActivityIndicator
                        size={size}
                        color={colors.primary}
                    />

                    {message && (
                        <Text style={styles.message}>
                            {message}
                        </Text>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator
                size={size}
                color={colors.primary}
            />

            {message && (
                <Text style={styles.message}>
                    {message}
                </Text>
            )}
        </View>
    );
};

export default Loader;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'rgba(255, 255, 255, 0.75)',
    },

    loaderBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        marginTop: 10,
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        color: colors.textSecondary,
    },
});