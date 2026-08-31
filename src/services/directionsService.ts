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

export interface MultiRouteResult {
    primaryRoute: RouteResult;
    alternativeRoute?: RouteResult;
}

/**
 * Fetches driving directions from Google Directions API with alternative routes.
 * Returns the NEAREST route as primaryRoute (highlighted) and the second nearest as alternativeRoute (subtle/dashed).
 */
export async function getDrivingRoutesWithAlternatives(
    origin: LatLng,
    destination: LatLng,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<MultiRouteResult | null> {
    try {
        const originStr = `${origin.latitude},${origin.longitude}`;
        const destStr = `${destination.latitude},${destination.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&alternatives=true&mode=driving&key=${apiKey}`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.status !== 'OK' || !json.routes || json.routes.length === 0) {
            console.warn('Google Directions API error or no routes:', json.status, json.error_message);
            return null;
        }

        // Sort all routes by distance (ascending) to rank by shortest/nearest distance
        const sortedRoutes = [...json.routes].sort((a, b) => {
            const distA = a.legs?.[0]?.distance?.value ?? Infinity;
            const distB = b.legs?.[0]?.distance?.value ?? Infinity;
            return distA - distB;
        });

        const formatRoute = (routeItem: any): RouteResult | null => {
            const leg = routeItem.legs?.[0];
            const encodedPolyline = routeItem.overview_polyline?.points;
            if (!encodedPolyline) return null;

            return {
                coordinates: decodePolyline(encodedPolyline),
                distanceText: leg?.distance?.text || `${((leg?.distance?.value || 0) / 1000).toFixed(1)} km`,
                durationText: leg?.duration?.text ? `${leg.duration.text} away` : '',
                distanceMeters: leg?.distance?.value || 0,
                durationSeconds: leg?.duration?.value || 0,
                summary: routeItem.summary || '',
            };
        };

        const primary = formatRoute(sortedRoutes[0]);
        if (!primary) return null;

        const alternative = sortedRoutes.length > 1 ? formatRoute(sortedRoutes[1]) || undefined : undefined;

        return {
            primaryRoute: primary,
            alternativeRoute: alternative,
        };
    } catch (error) {
        console.error('Failed to fetch driving routes:', error);
        return null;
    }
}

/**
 * Fetches driving directions from Google Directions API with alternative routes,
 * and picks the NEAREST (shortest distance) route to display on the map.
 */
export async function getNearestDrivingRoute(
    origin: LatLng,
    destination: LatLng,
    apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<RouteResult | null> {
    const res = await getDrivingRoutesWithAlternatives(origin, destination, apiKey);
    return res?.primaryRoute || null;
}
