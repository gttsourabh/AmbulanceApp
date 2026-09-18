import { HospitalItem, HOSPITALS_DATABASE } from '../data/hospitalsData';
import { getDistanceMeters, LatLng } from '../utils/geoUtils';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

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
 * Extracts city/town name from Google Places formatted address
 */
function extractCityFromAddress(address: string): string {
    if (!address) return '';
    const knownCities = [
        'Sangli', 'Miraj', 'Kupwad', 'Kolhapur', 'Ichalkaranji', 'Jaysingpur',
        'Satara', 'Karad', 'Pune', 'Pimpri-Chinchwad', 'Mumbai', 'Navi Mumbai',
        'Thane', 'Solapur', 'Nashik', 'Chhatrapati Sambhajinagar', 'Aurangabad',
        'Belagavi', 'Goa', 'Bengaluru', 'Hyderabad', 'Delhi'
    ];
    for (const city of knownCities) {
        if (address.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
        return parts[parts.length - 3] || parts[parts.length - 2] || '';
    }
    return '';
}

/**
 * Determines hospital category based on place name and types
 */
function determineHospitalType(name: string, types: string[] = []): HospitalItem['type'] {
    const n = name.toLowerCase();
    if (n.includes('civil') || n.includes('government') || n.includes('govt') || n.includes('district hospital') || n.includes('sub-district') || n.includes('rural hospital')) {
        return 'Government';
    }
    if (n.includes('trauma') || n.includes('accident') || n.includes('emergency')) {
        return 'Trauma Center';
    }
    if (n.includes('cardiac') || n.includes('heart') || n.includes('cardio')) {
        return 'Cardiac';
    }
    if (n.includes('multi') || n.includes('superspeciality') || n.includes('super specialty') || n.includes('institute') || n.includes('medical college')) {
        return 'Multi-Specialty';
    }
    return 'Private';
}

/**
 * Transforms a raw Google Place (Places API New) into standard HospitalItem
 */
export function transformGooglePlaceToHospitalItem(
    place: any,
    pickupLocation: LatLng
): HospitalItem | null {
    if (!place) return null;

    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;

    const name = place.displayName?.text || place.name || 'Hospital';
    const address = place.formattedAddress || 'Medical Center';
    const city = extractCityFromAddress(address);
    const phone = place.nationalPhoneNumber || '+912332374444';
    const rating = typeof place.rating === 'number' ? Number(place.rating.toFixed(1)) : 4.5;
    const type = determineHospitalType(name, place.types || []);

    const { distanceKm, etaMinutes } = calculateHospitalMetrics(pickupLocation, {
        latitude: lat,
        longitude: lng,
    });

    let icuBeds = 16;
    if (type === 'Government') icuBeds = 32;
    else if (type === 'Trauma Center') icuBeds = 24;
    else if (type === 'Cardiac') icuBeds = 20;
    else if (type === 'Multi-Specialty') icuBeds = 22;
    else icuBeds = 12;

    return {
        id: `google-${place.id || Math.random().toString(36).substring(2, 9)}`,
        name,
        type,
        address,
        city: city || undefined,
        latitude: lat,
        longitude: lng,
        phone,
        emergencyAvailable: true,
        icuBeds,
        specialties: ['24x7 Emergency', 'Critical Care', type],
        rating,
        distanceKm,
        etaMinutes,
    };
}

const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.types,nextPageToken';

/**
 * Live search against Google Places API (New) with automatic multi-page fetching
 * to return comprehensive results for any query.
 */
export async function searchGoogleHospitals(
    query: string,
    pickupLocation: LatLng
): Promise<HospitalItem[]> {
    const trimmed = query.trim();
    if (!trimmed) {
        return [];
    }

    try {
        console.log(`🔍 [Google Places API] Searching for: "${trimmed}"`);
        const resultsMap = new Map<string, any>();

        const makeSearchRequest = async (pageToken?: string) => {
            const bodyPayload: any = {
                textQuery: trimmed.toLowerCase().includes('hospital') ? trimmed : `${trimmed} hospital`,
                includedType: 'hospital',
                locationBias: {
                    circle: {
                        center: {
                            latitude: pickupLocation.latitude,
                            longitude: pickupLocation.longitude,
                        },
                        radius: 50000.0,
                    },
                },
                maxResultCount: 20,
            };
            if (pageToken) {
                bodyPayload.pageToken = pageToken;
            }

            const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': FIELD_MASK,
                },
                body: JSON.stringify(bodyPayload),
            });

            if (!res.ok) return null;
            return await res.json();
        };

        // Page 1
        const page1Data = await makeSearchRequest();
        if (page1Data?.places) {
            page1Data.places.forEach((p: any) => {
                if (p.id) resultsMap.set(p.id, p);
            });
        }

        // Page 2 (if available, to get 40+ hospitals)
        if (page1Data?.nextPageToken) {
            try {
                const page2Data = await makeSearchRequest(page1Data.nextPageToken);
                if (page2Data?.places) {
                    page2Data.places.forEach((p: any) => {
                        if (p.id) resultsMap.set(p.id, p);
                    });
                }
            } catch (p2Err) {
                console.log('Page 2 fetch error:', p2Err);
            }
        }

        const items: HospitalItem[] = [];
        for (const place of resultsMap.values()) {
            const item = transformGooglePlaceToHospitalItem(place, pickupLocation);
            if (item) {
                items.push(item);
            }
        }

        const q = trimmed.toLowerCase();
        const qClean = q.replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
        const qTokens = qClean.split(/\s+/).filter(t => t.length > 0 && t !== 'hospital');

        // Score each hospital item based on text relevance to query
        const scoredItems = items.map(item => {
            const name = item.name.toLowerCase().replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
            const addr = item.address.toLowerCase().replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
            const city = (item.city || '').toLowerCase();

            let relevance = 0;
            if (name === qClean) {
                relevance = 1000;
            } else if (name.startsWith(qClean)) {
                relevance = 800;
            } else if (qTokens.length > 0 && qTokens.every(t => name.includes(t))) {
                relevance = 600;
            } else if (qTokens.length > 0 && qTokens.some(t => name.includes(t))) {
                relevance = 400;
            } else if (city && (city === qClean || qTokens.some(t => city.includes(t)))) {
                relevance = 300;
            } else if (qTokens.length > 0 && qTokens.every(t => addr.includes(t))) {
                relevance = 200;
            } else if (qTokens.length > 0 && qTokens.some(t => addr.includes(t))) {
                relevance = 100;
            } else {
                relevance = 0;
            }

            return { item, relevance };
        });

        // If matching items exist, only show those relevant items; otherwise fallback to general
        const relevantItems = scoredItems.filter(s => s.relevance > 0);
        const finalSelection = relevantItems.length > 0 ? relevantItems : scoredItems;

        // Sort: Highest relevance first, then closest distance for equally relevant items
        finalSelection.sort((a, b) => {
            if (b.relevance !== a.relevance) {
                return b.relevance - a.relevance;
            }
            return Number(a.item.distanceKm || 0) - Number(b.item.distanceKm || 0);
        });

        console.log(`✅ [Google Places search] Found ${finalSelection.length} hospitals matching "${trimmed}" (Relevance ranked)`);
        return finalSelection.map(s => s.item);
    } catch (err: any) {
        console.warn('⚠️ [Google Places search error / fallback]:', err?.message);
        return searchLocalHospitalsFallback(query, pickupLocation);
    }
}

/**
 * Live search for all hospitals in the region using parallel multi-query Google Places API
 * (fetches general hospitals, multi-specialty, trauma centers, and emergency clinics)
 * to return 50-60+ real Google hospitals instead of only 20.
 */
export async function fetchGoogleNearbyHospitals(
    pickupLocation: LatLng,
    radiusMeters: number = 35000
): Promise<HospitalItem[]> {
    try {
        console.log(`📍 [Google Places API] Multi-query fetch around (${pickupLocation.latitude}, ${pickupLocation.longitude})`);
        const allPlacesMap = new Map<string, any>();

        // 1. searchNearby API call
        const nearbyPromise = fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.types',
            },
            body: JSON.stringify({
                includedTypes: ['hospital'],
                maxResultCount: 20,
                locationRestriction: {
                    circle: {
                        center: pickupLocation,
                        radius: radiusMeters,
                    },
                },
            }),
        }).then(r => r.ok ? r.json() : null).catch(() => null);

        // 2. Parallel searchText queries to discover all regional hospital facilities
        const queries = [
            'multispeciality hospital',
            'government civil hospital trauma center',
            'hospital emergency clinic'
        ];

        const textPromises = queries.map(q =>
            fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.types',
                },
                body: JSON.stringify({
                    textQuery: q,
                    locationBias: {
                        circle: {
                            center: pickupLocation,
                            radius: radiusMeters,
                        },
                    },
                    maxResultCount: 20,
                }),
            }).then(r => r.ok ? r.json() : null).catch(() => null)
        );

        const responses = await Promise.all([nearbyPromise, ...textPromises]);

        for (const res of responses) {
            if (res?.places && Array.isArray(res.places)) {
                for (const place of res.places) {
                    if (place.id && !allPlacesMap.has(place.id)) {
                        allPlacesMap.set(place.id, place);
                    }
                }
            }
        }

        const items: HospitalItem[] = [];
        for (const place of allPlacesMap.values()) {
            const item = transformGooglePlaceToHospitalItem(place, pickupLocation);
            if (item) {
                items.push(item);
            }
        }

        console.log(`✅ [Google Places API] Successfully loaded ${items.length} total hospitals!`);

        if (items.length === 0) {
            return getLocalHospitalsFallback(pickupLocation);
        }

        return items.sort((a, b) => Number(a.distanceKm || 0) - Number(b.distanceKm || 0));
    } catch (err: any) {
        console.warn('⚠️ [Google Places API multi-fetch error / fallback]:', err?.message);
        return getLocalHospitalsFallback(pickupLocation);
    }
}

/**
 * Offline / network failure fallback returning curated hospitals
 */
function getLocalHospitalsFallback(pickupLocation: LatLng): HospitalItem[] {
    return HOSPITALS_DATABASE.map(hosp => {
        const { distanceKm, etaMinutes } = calculateHospitalMetrics(pickupLocation, {
            latitude: hosp.latitude,
            longitude: hosp.longitude,
        });
        return {
            ...hosp,
            distanceKm,
            etaMinutes,
        };
    }).sort((a, b) => Number(a.distanceKm || 0) - Number(b.distanceKm || 0));
}

/**
 * Offline / network failure fallback for search queries
 */
function searchLocalHospitalsFallback(
    query: string,
    pickupLocation: LatLng
): HospitalItem[] {
    const all = getLocalHospitalsFallback(pickupLocation);
    const q = query.trim().toLowerCase().replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    if (!q) return all;

    const tokens = q.split(/\s+/).filter(Boolean);
    return all.filter(hosp => {
        const searchable = [
            hosp.name,
            hosp.city || '',
            hosp.address,
            hosp.type,
            ...(hosp.specialties || []),
        ]
            .join(' ')
            .toLowerCase()
            .replace(/[.,'\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');

        return tokens.every(token => searchable.includes(token));
    });
}
