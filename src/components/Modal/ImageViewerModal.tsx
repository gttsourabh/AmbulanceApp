import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageViewerModalProps {
    visible: boolean;
    imageUrl?: string | null;
    title?: string;
    subtitle?: string;
    onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    visible,
    imageUrl,
    title,
    subtitle,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset states when a new image or visibility changes
    useEffect(() => {
        if (visible && imageUrl) {
            setIsLoading(true);
            setHasError(false);
        }
    }, [visible, imageUrl]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* BACKDROP DISMISS (taps outside dismiss) */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                    {/* ================= HEADER BAR ================= */}
                    <View style={styles.headerBar}>
                        <View style={styles.headerInfo}>
                            {title ? (
                                <Text style={styles.headerTitle} numberOfLines={1}>
                                    {title}
                                </Text>
                            ) : null}
                            {subtitle ? (
                                <Text style={styles.headerSubtitle} numberOfLines={1}>
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            activeOpacity={0.7}
                            onPress={onClose}
                            accessibilityLabel="Close image preview"
                            accessibilityRole="button"
                        >
                            <AppIcon
                                family="material"
                                name="close"
                                size={22}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ================= IMAGE VIEWER AREA ================= */}
                    <View style={styles.imageContainer}>
                        {imageUrl && !hasError ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadStart={() => setIsLoading(true)}
                                onLoadEnd={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false);
                                    setHasError(true);
                                }}
                            />
                        ) : null}

                        {/* SPINNER WHILE LOADING */}
                        {isLoading && !hasError ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color="#FFFFFF" />
                                <Text style={styles.loadingText}>Loading image...</Text>
                            </View>
                        ) : null}

                        {/* ERROR FALLBACK */}
                        {hasError || !imageUrl ? (
                            <View style={styles.errorContainer}>
                                <View style={styles.errorIconWrap}>
                                    <AppIcon
                                        family="material"
                                        name="image-broken-variant"
                                        size={48}
                                        color="rgba(255,255,255,0.6)"
                                    />
                                </View>
                                <Text style={styles.errorTitle}>
                                    Unable to load image
                                </Text>
                                <Text style={styles.errorSubtitle}>
                                    The image could not be retrieved from the server.
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* ================= FOOTER / DISMISS HINT ================= */}
                    <View style={styles.footerBar}>
                        <View style={styles.hintBadge}>
                            <AppIcon
                                family="material"
                                name="gesture-tap"
                                size={14}
                                color="rgba(255,255,255,0.7)"
                            />
                            <Text style={styles.hintText}>
                                Tap anywhere outside to close
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

export default React.memo(ImageViewerModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 15, 29, 0.95)',
        justifyContent: 'space-between',
    },

    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
    },

    // =====================================================
    // HEADER BAR
    // =====================================================

    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        zIndex: 10,
    },

    headerInfo: {
        flex: 1,
        paddingRight: 16,
    },

    headerTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 16,
        lineHeight: 20,
        includeFontPadding: false,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },

    headerSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        lineHeight: 16,
        includeFontPadding: false,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },

    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // =====================================================
    // IMAGE CONTAINER
    // =====================================================

    imageContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    image: {
        width: SCREEN_WIDTH - 24,
        height: SCREEN_HEIGHT * 0.72,
    },

    loaderContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },

    loadingText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 13,
        lineHeight: 16,
        includeFontPadding: false,
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // =====================================================
    // ERROR CONTAINER
    // =====================================================

    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },

    errorIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    errorTitle: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 15,
        lineHeight: 18,
        includeFontPadding: false,
        color: '#FFFFFF',
        marginBottom: 6,
    },

    errorSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        lineHeight: 16,
        includeFontPadding: false,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },

    // =====================================================
    // FOOTER
    // =====================================================

    footerBar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 16,
        paddingTop: 8,
    },

    hintBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },

    hintText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        lineHeight: 14,
        includeFontPadding: false,
        color: 'rgba(255, 255, 255, 0.75)',
        letterSpacing: 0.2,
    },
});
