import { GOOGLE_MAPS_API_KEY } from '../config/maps';

/**
 * Reverse geocodes coordinates (lat, lng) into a formatted address string
 * using Google Maps Geocoding API (v4).
 * Docs: https://developers.google.com/maps/documentation/geocoding/geocoding-v4-overview
 */
export async function getReverseGeocodedAddress(
    lat: number,
    lng: number,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<string | null> {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        console.warn('⚠️ [Google Geocoding v4] Invalid coordinates:', lat, lng);
        return null;
    }

    if (!apiKey) {
        console.warn('⚠️ [Google Geocoding v4] Missing Google Maps API key');
        return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const url = `https://geocode.googleapis.com/v4/geocode/location/${lat},${lng}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'results.formattedAddress',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`⚠️ [Google Geocoding v4] HTTP error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const address = data.results?.[0]?.formattedAddress || null;

        if (address) {
            console.log('📍 [Google Geocoding v4 Success] Address:', address);
            return address;
        }

        console.warn('⚠️ [Google Geocoding v4] No address found in results');
        return null;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.warn('⚠️ [Google Geocoding v4] Request timed out after 8s');
        } else {
            console.warn('⚠️ [Google Geocoding v4] Request error:', error?.message || error);
        }
        return null;
    }
}
