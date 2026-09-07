import { GOOGLE_MAPS_API_KEY } from '../config/maps';

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface RouteResult {
    coordinates: LatLng[];
    distanceText: string;
    durationText: string;
    distanceMeters: number;
    durationSeconds: number;
    summary: string;
}

export interface MultiRouteResult {
    primaryRoute: RouteResult;
    alternativeRoute?: RouteResult;
}

/**
 * Decodes Google's encoded polyline string into an array of {latitude, longitude}
 */
/* eslint-disable no-bitwise */
export function decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b = 0;
        let shift = 0;
        let result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
}

function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
    const mins = Math.round(seconds / 60);
    if (mins < 1) return '1 min away';
    if (mins < 60) return `${mins} mins away`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs} hr ${remMins} min away` : `${hrs} hr away`;
}

/**
 * Fetches driving directions with alternative routes using Google Routes API (v2).
 */
export async function fetchGoogleRoutes(
    origin: LatLng,
    destination: LatLng,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<MultiRouteResult | null> {
    try {
        const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description',
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
                destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
                travelMode: 'DRIVE',
                computeAlternativeRoutes: true,
            }),
        });

        const json = await response.json();
        if (!json.routes || json.routes.length === 0) {
            console.warn('Google Routes API returned no routes:', json.error?.message || json);
            return null;
        }

        const formatRoute = (r: any): RouteResult | null => {
            const encoded = r.polyline?.encodedPolyline;
            if (!encoded) return null;
            const distM = r.distanceMeters || 0;
            const durSec = typeof r.duration === 'string'
                ? parseInt(r.duration.replace('s', ''), 10)
                : (r.duration || 0);

            return {
                coordinates: decodePolyline(encoded),
                distanceText: formatDistance(distM),
                durationText: formatDuration(durSec),
                distanceMeters: distM,
                durationSeconds: durSec,
                summary: r.description || '',
            };
        };

        const primary = formatRoute(json.routes[0]);
        if (!primary) return null;

        const alternative = json.routes.length > 1 ? formatRoute(json.routes[1]) || undefined : undefined;

        console.log(`🗺️ [GOOGLE ROUTE SUCCESS] Primary: ${primary.distanceText} (${primary.durationText}) | Points: ${primary.coordinates.length}`);

        return {
            primaryRoute: primary,
            alternativeRoute: alternative,
        };
    } catch (err) {
        console.warn('Google Routes API fetch error:', err);
        return null;
    }
}

/**
 * Fetches driving directions with alternative routes using Google Routes API.
 */
export async function getDrivingRoutesWithAlternatives(
    origin: LatLng,
    destination: LatLng,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<MultiRouteResult | null> {
    if (!apiKey) {
        console.warn('Google Maps API key is missing.');
        return null;
    }

    return await fetchGoogleRoutes(origin, destination, apiKey);
}

/**
 * Fetches driving directions and picks the primary route using Google Routes API.
 */
export async function getNearestDrivingRoute(
    origin: LatLng,
    destination: LatLng,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<RouteResult | null> {
    const res = await getDrivingRoutesWithAlternatives(origin, destination, apiKey);
    return res?.primaryRoute || null;
}
