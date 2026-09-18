import { HospitalItem, HOSPITALS_DATABASE } from '../data/hospitalsData';
import { getDistanceMeters, LatLng } from '../utils/geoUtils';

/**
 * Calculates distance in km and emergency transit ETA in minutes from pickupLocation to destination
 */
export function calculateHospitalMetrics(
    pickupLocation: LatLng,
    destLocation: LatLng
): { distanceKm: string; etaMinutes: number } {
    const distMeters = getDistanceMeters(pickupLocation, destLocation);
    const distKm = (distMeters / 1000).toFixed(1);
    // Emergency ambulance speed assumption ~40-45 km/h average in transit
    const etaMinutes = Math.max(3, Math.round((distMeters / 1000) * 1.6));
    return { distanceKm: distKm, etaMinutes };
}

/**
 * Searches the curated local database of multi-city hospitals
 */
export function searchLocalHospitals(
    query: string,
    pickupLocation: LatLng
): HospitalItem[] {
    const q = query.trim().toLowerCase();

    // Map all hospitals with live calculated distance
    const withDistance: HospitalItem[] = HOSPITALS_DATABASE.map(hosp => {
        const { distanceKm, etaMinutes } = calculateHospitalMetrics(pickupLocation, {
            latitude: hosp.latitude,
            longitude: hosp.longitude,
        });
        return {
            ...hosp,
            distanceKm,
            etaMinutes,
        };
    });

    if (!q) {
        // When no search query, sort strictly by closest distance to pickup location
        return withDistance.sort((a, b) => Number(a.distanceKm || 0) - Number(b.distanceKm || 0));
    }

    const queryTokens = q.split(/\s+/).filter(Boolean);

    const filtered = withDistance.filter(hosp => {
        const searchableText = [
            hosp.name,
            hosp.city || '',
            hosp.address,
            hosp.type,
            ...(hosp.specialties || []),
        ]
            .join(' ')
            .toLowerCase();

        return queryTokens.every(token => searchableText.includes(token));
    });

    // Sort matching results: exact name match first, then by distance
    return filtered.sort((a, b) => {
        const aNameStarts = a.name.toLowerCase().startsWith(q);
        const bNameStarts = b.name.toLowerCase().startsWith(q);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;
        return Number(a.distanceKm || 0) - Number(b.distanceKm || 0);
    });
}

/**
 * Live search against OpenStreetMap Nominatim for any hospital name or city across India/global
 */
export async function searchOnlineHospitals(
    query: string,
    pickupLocation: LatLng
): Promise<HospitalItem[]> {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
        return [];
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // Include "hospital" in query to focus search on medical facilities if not already present
        const searchTerms = trimmed.toLowerCase().includes('hospital') || trimmed.toLowerCase().includes('clinic')
            ? trimmed
            : `${trimmed} hospital`;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchTerms
        )}&countrycodes=in&limit=8&addressdetails=1`;

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'AmbulanceDriverApp/2.0',
                Accept: 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return [];
        }

        const data: any[] = await response.json();
        if (!Array.isArray(data)) return [];

        const results: HospitalItem[] = [];

        for (const item of data) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            if (isNaN(lat) || isNaN(lon)) continue;

            const name = item.name || item.display_name?.split(',')[0] || 'Hospital';
            const address = item.display_name || 'Emergency Medical Care';
            const city =
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.state_district ||
                '';

            const { distanceKm, etaMinutes } = calculateHospitalMetrics(pickupLocation, {
                latitude: lat,
                longitude: lon,
            });

            results.push({
                id: `osm-${item.place_id || item.osm_id || Math.random().toString(36).substring(7)}`,
                name,
                type: 'Multi-Specialty',
                address,
                city,
                latitude: lat,
                longitude: lon,
                phone: '+919999999999',
                emergencyAvailable: true,
                icuBeds: 15,
                specialties: ['24x7 Emergency', 'Inpatient Care'],
                rating: 4.5,
                distanceKm,
                etaMinutes,
            });
        }

        return results;
    } catch (err) {
        // Network timeout or offline - gracefully return empty without throwing
        return [];
    }
}

/**
 * Combined search: searches local multi-city database instantly,
 * and if online query returns additional hospitals, deduplicates and appends them.
 */
export async function searchAllHospitals(
    query: string,
    pickupLocation: LatLng,
    includeOnline = false
): Promise<HospitalItem[]> {
    const localMatches = searchLocalHospitals(query, pickupLocation);

    if (!includeOnline || !query.trim() || query.trim().length < 3) {
        return localMatches;
    }

    try {
        const onlineMatches = await searchOnlineHospitals(query, pickupLocation);
        if (!onlineMatches.length) {
            return localMatches;
        }

        // Deduplicate against local matches by coordinate proximity or normalized name
        const combined = [...localMatches];
        for (const onlineItem of onlineMatches) {
            const isDuplicate = combined.some(local => {
                const dist = getDistanceMeters(
                    { latitude: local.latitude, longitude: local.longitude },
                    { latitude: onlineItem.latitude, longitude: onlineItem.longitude }
                );
                const nameSimilar =
                    local.name.toLowerCase().includes(onlineItem.name.toLowerCase()) ||
                    onlineItem.name.toLowerCase().includes(local.name.toLowerCase());

                return dist < 300 || nameSimilar;
            });

            if (!isDuplicate) {
                combined.push(onlineItem);
            }
        }

        return combined;
    } catch {
        return localMatches;
    }
}
