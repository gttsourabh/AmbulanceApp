import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageProps,
    ImageSourcePropType,
    StyleProp,
    ImageStyle,
    View,
} from 'react-native';
import { API_BASE_URL, API_KEY } from '@env';
import { store } from '../../redux/store';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { colors } from '../../theme';

export interface ShowImageProps extends Omit<ImageProps, 'source'> {
    folderName: string;
    filename?: string | null;
    fallbackSource?: ImageSourcePropType;
    fallbackComponent?: React.ReactNode;
    renderFallback?: () => React.ReactNode;
    style?: StyleProp<ImageStyle>;
    showLoader?: boolean;
    loadingIndicatorSize?: 'small' | 'large';
    loadingIndicatorColor?: string;
}

// In-memory cache for downloaded base64 images to prevent redundant network calls
const imageCache = new Map<string, string>();

/**
 * Extracts pure filename from any URL or path
 */
export const extractFilename = (pathOrUrl?: string | null): string => {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
    const trimmed = pathOrUrl.trim();
    if (trimmed.startsWith('data:')) return trimmed; // already data URI
    const lastSlash = trimmed.lastIndexOf('/');
    if (lastSlash !== -1) {
        return trimmed.substring(lastSlash + 1);
    }
    return trimmed;
};

/**
 * Downloads a file as base64 from the server
 */
export const fetchImageBase64 = async (
    folderName: string,
    rawFilename?: string | null
): Promise<string | null> => {
    if (!rawFilename) return null;

    const trimmed = rawFilename.trim();
    // If already data URI, return as-is
    if (trimmed.startsWith('data:')) {
        return trimmed;
    }

    const filename = extractFilename(trimmed);
    if (!filename) return null;

    const cacheKey = `${folderName}:${filename}`;

    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!;
    }

    const cleanBaseUrl = (API_BASE_URL);
    const endpoint = `${cleanBaseUrl}/downloadFile`;

    let token = '';
    try {
        token = store.getState().auth.token || '';
        if (!token) {
            token = (await storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)) || '';
        }
    } catch {
        // ignore 
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: API_KEY,
    };

    if (token) {
        headers.token = token;
        headers.Authorization = `Bearer ${token}`;
    }

    const body = JSON.stringify({
        filename,
        folderName,
    });

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body,
        });

        console.log("response", JSON.stringify(response, null, 2))

        if (response.status === 200) {
            const json = await response.json();
            if (json?.code === 200 && json?.data) {
                const mimeType = json.MIMETYPE || 'image/png';
                const dataUri = `data:${mimeType};base64,${json.data}`;
                imageCache.set(cacheKey, dataUri);
                return dataUri;
            }
        }
    } catch (err) {
        console.warn(`[ShowImage] Fetch error on ${endpoint}:`, err);
    }

    return null;
};

const ShowImage: React.FC<ShowImageProps> = ({
    folderName,
    filename,
    fallbackSource,
    fallbackComponent,
    renderFallback,
    style,
    showLoader = true,
    loadingIndicatorSize = 'small',
    loadingIndicatorColor = colors.primary,
    ...props
}) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!filename) {
                if (isMounted) {
                    setImageUri(null);
                    setLoading(false);
                    setImageError(true);
                }
                return;
            }

            const clean = extractFilename(filename);
            const cacheKey = `${folderName}:${clean}`;

            if (imageCache.has(cacheKey)) {
                if (isMounted) {
                    setImageUri(imageCache.get(cacheKey)!);
                    setLoading(false);
                    setImageError(false);
                }
                return;
            }

            if (isMounted) {
                setLoading(true);
                setImageError(false);
            }

            try {
                const uri = await fetchImageBase64(folderName, filename);
                if (isMounted) {
                    if (uri) {
                        setImageUri(uri);
                        setImageError(false);
                    } else {
                        setImageUri(null);
                        setImageError(true);
                    }
                }
            } catch (error) {
                console.warn('[ShowImage] Error loading image:', filename, error);
                if (isMounted) {
                    setImageUri(null);
                    setImageError(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [filename, folderName]);

    // Render Fallback Helper
    const renderFallbackView = () => {
        if (fallbackComponent) {
            return <>{fallbackComponent}</>;
        }
        if (renderFallback) {
            return <>{renderFallback()}</>;
        }
        if (fallbackSource) {
            return <Image source={fallbackSource} style={style} {...props} />;
        }
        return null;
    };

    // Loading State
    if (loading && showLoader) {
        return (
            <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator
                    size={loadingIndicatorSize}
                    color={loadingIndicatorColor}
                />
            </View>
        );
    }

    // Error or No Image
    if (!imageUri || imageError) {
        return renderFallbackView();
    }

    // Remote / Base64 Loaded Image
    return (
        <Image
            source={{ uri: imageUri }}
            style={style}
            onError={() => setImageError(true)}
            {...props}
        />
    );
};

export default ShowImage;
