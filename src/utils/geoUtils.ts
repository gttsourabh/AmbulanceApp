export interface LatLng {
    latitude: number;
    longitude: number;
}

/**
 * Calculates distance in meters between two coordinates using Haversine formula
 */
export function getDistanceMeters(p1: LatLng, p2: LatLng): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const lat1 = (p1.latitude * Math.PI) / 180;
    const lat2 = (p2.latitude * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculates bearing / heading in degrees (0 - 360) from start to destination
 */
export function calculateBearing(start: LatLng, dest: LatLng): number {
    const startLat = (start.latitude * Math.PI) / 180;
    const startLng = (start.longitude * Math.PI) / 180;
    const destLat = (dest.latitude * Math.PI) / 180;
    const destLng = (dest.longitude * Math.PI) / 180;

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
        Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
}

/**
 * Projects a point onto a line segment (p1 -> p2).
 * Returns the closest point on the segment and distance in meters.
 */
function projectPointOnSegment(p: LatLng, p1: LatLng, p2: LatLng): { point: LatLng; distance: number; bearing: number } {
    const segLenMeters = getDistanceMeters(p1, p2);
    if (segLenMeters < 0.1) {
        return {
            point: p1,
            distance: getDistanceMeters(p, p1),
            bearing: 0,
        };
    }

    // Convert to metric projection using average latitude cosine scaling
    const latRad = ((p1.latitude + p2.latitude) / 2) * (Math.PI / 180);
    const cosLat = Math.cos(latRad);

    const dx = (p2.longitude - p1.longitude) * cosLat;
    const dy = p2.latitude - p1.latitude;
    const px = (p.longitude - p1.longitude) * cosLat;
    const py = p.latitude - p1.latitude;

    const denom = dx * dx + dy * dy;
    if (denom < 1e-14) {
        return {
            point: p1,
            distance: getDistanceMeters(p, p1),
            bearing: 0,
        };
    }

    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / denom));

    const projectedPoint: LatLng = {
        latitude: p1.latitude + t * (p2.latitude - p1.latitude),
        longitude: p1.longitude + t * (p2.longitude - p1.longitude),
    };

    return {
        point: projectedPoint,
        distance: getDistanceMeters(p, projectedPoint),
        bearing: calculateBearing(p1, p2),
    };
}

/**
 * Snaps a raw GPS point to the nearest point on the road polyline.
 * If the point is within maxSnapMeters of the route, it returns the snapped coordinate
 * and calculated road bearing. Otherwise, returns raw point.
 */
export function snapToRoutePolyline(
    rawPoint: LatLng,
    polyline: LatLng[],
    maxSnapMeters = 60
): { point: LatLng; snapped: boolean; roadBearing?: number } {
    if (!polyline || polyline.length < 2) {
        return { point: rawPoint, snapped: false };
    }

    let minDistance = Infinity;
    let closestPoint = rawPoint;
    let closestBearing = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
        const segStart = polyline[i];
        const segEnd = polyline[i + 1];

        const { point, distance, bearing } = projectPointOnSegment(rawPoint, segStart, segEnd);

        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
            closestBearing = bearing;
        }
    }

    if (minDistance <= maxSnapMeters) {
        return {
            point: closestPoint,
            snapped: true,
            roadBearing: closestBearing,
        };
    }

    return {
        point: rawPoint,
        snapped: false,
    };
}
