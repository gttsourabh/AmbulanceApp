import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    DimensionValue,
    Easing,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

export type SkeletonVariant = 'rect' | 'circle' | 'text' | 'rounded';

export interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    variant?: SkeletonVariant;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
    shimmerColor?: string;
    duration?: number;
    children?: React.ReactNode;
}

const DEFAULT_BASE_COLOR = '#E2E8F0';
const DEFAULT_SHIMMER_COLOR = '#FFFFFF';

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius,
    variant = 'rounded',
    style,
    backgroundColor = DEFAULT_BASE_COLOR,
    shimmerColor = DEFAULT_SHIMMER_COLOR,
    duration = 1250,
    children,
}) => {
    const [containerWidth, setContainerWidth] = useState<number>(200);

    // Pulse animation
    const pulseAnim = useRef(new Animated.Value(0.55)).current;
    // Shimmer wave translation
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous pulse animation
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.95,
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.55,
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );

        // Continuous shimmer sweep animation
        const shimmerLoop = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        pulseLoop.start();
        shimmerLoop.start();

        return () => {
            pulseLoop.stop();
            shimmerLoop.stop();
        };
    }, [duration, pulseAnim, shimmerAnim]);

    const handleLayout = (e: LayoutChangeEvent) => {
        const { width: layoutWidth } = e.nativeEvent.layout;
        if (layoutWidth > 0 && layoutWidth !== containerWidth) {
            setContainerWidth(layoutWidth);
        }
    };

    // Determine border radius according to variant
    const getBorderRadius = (): number => {
        if (borderRadius !== undefined) {
            return borderRadius;
        }
        switch (variant) {
            case 'circle':
                return 9999;
            case 'rounded':
                return 12;
            case 'text':
                return 6;
            case 'rect':
            default:
                return 0;
        }
    };

    const computedBorderRadius = getBorderRadius();

    // Calculate shimmer strip translation
    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-containerWidth * 1.2, containerWidth * 1.2],
    });

    return (
        <Animated.View
            onLayout={handleLayout}
            style={[
                styles.container,
                {
                    width,
                    height,
                    borderRadius: computedBorderRadius,
                    backgroundColor,
                    opacity: pulseAnim,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.shimmerTrack,
                    {
                        width: containerWidth * 0.8,
                        transform: [{ translateX: shimmerTranslate }],
                    },
                ]}
            >
                <View
                    style={[
                        styles.shimmerBand,
                        {
                            backgroundColor: shimmerColor,
                        },
                    ]}
                />
            </Animated.View>
            {children}
        </Animated.View>
    );
};

export default Skeleton;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    shimmerTrack: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shimmerBand: {
        width: '100%',
        height: '100%',
        opacity: 0.35,
        borderRadius: 8,
    },
});
