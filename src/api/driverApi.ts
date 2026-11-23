import axiosInstance from './axiosInstance';
import { normalizeDriverProfile } from '../utils/imageUtils';
import { store } from '../redux/store';

export type TripNavigationType = 'np' | 'ph';

export interface UpdateDriverLocationPayload {
    ambulance_request_id: number;
    driver_id: number;
    latitude: number;
    longitude: number;
    type?: TripNavigationType; // 'np' = navigation to patient, 'ph' = patient to hospital
}

export interface UpdateDriverLocationResponse {
    success?: boolean;
    message?: string;
    data?: any;
    [key: string]: any;
}

/**
 * POST /api/ambulance/driver/update-location
 * Sends live driver GPS coordinates to server every 10 seconds during navigation.
 */

export const updateDriverLocation = async (
    payload: UpdateDriverLocationPayload
) => {
    return await axiosInstance.post<UpdateDriverLocationResponse>(
        '/api/ambulance/driver/update-location',
        payload
    );
};

export interface RespondToEmergencyPayload {
    action: 'accept' | 'reject';
    request_id: number;
}

export interface RespondToEmergencyResponse {
    success?: boolean;
    message?: string;
    data?: any;
    [key: string]: any;
}

/**
 * POST /api/ambulance/driver/response
 * Responds to incoming emergency trip request ('accept' | 'reject').
 */

export const respondToEmergencyRequest = async (
    payload: RespondToEmergencyPayload
) => {
    return await axiosInstance.post<RespondToEmergencyResponse>(
        '/api/ambulance/driver/response',
        payload
    );
};

export interface UpdateDriverOnlineStatusPayload {
    lat?: number | null;
    lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    userId?: number | string;
    isOnline?: boolean;
    user_id?: number | string;
    driver_id?: number | string;
    is_online?: boolean;
    curr_address?: string | null;
    address?: string | null;
}

export interface UpdateDriverOnlineStatusResponse {
    success?: boolean;
    message?: string;
    data?: any;
    [key: string]: any;
}

/**
 * PUT /api/ambulance/driver/status
 * Updates driver online/offline availability status.
 * Supports both snake_case (user_id, is_online) and camelCase (userId, isOnline).
 */
export const updateDriverOnlineStatus = async (
    payload: UpdateDriverOnlineStatusPayload
) => {
    const isValidId = (v: any): boolean => {
        if (v === undefined || v === null || v === '' || v === 0 || v === '0') return false;
        const num = Number(v);
        return !isNaN(num) && num > 0;
    };

    let effectiveUserId: number | null = null;
    if (isValidId(payload.user_id)) effectiveUserId = Number(payload.user_id);
    else if (isValidId(payload.userId)) effectiveUserId = Number(payload.userId);
    else if (isValidId(payload.driver_id)) effectiveUserId = Number(payload.driver_id);

    // Fallback to Redux store if caller didn't pass valid userId
    if (!effectiveUserId) {
        try {
            const stateUser = store.getState()?.auth?.user;
            if (isValidId(stateUser?.id)) effectiveUserId = Number(stateUser.id);
            else if (isValidId(stateUser?.user_id)) effectiveUserId = Number(stateUser.user_id);
            else if (isValidId(stateUser?.userId)) effectiveUserId = Number(stateUser.userId);
            else if (isValidId(stateUser?.driver_id)) effectiveUserId = Number(stateUser.driver_id);
        } catch {
            // ignore
        }
    }

    const effectiveIsOnline =
        payload.is_online !== undefined
            ? Boolean(payload.is_online)
            : (payload.isOnline !== undefined ? Boolean(payload.isOnline) : true);

    const lat = typeof payload.lat === 'number' ? payload.lat : (typeof payload.latitude === 'number' ? payload.latitude : 0);
    const lng = typeof payload.lng === 'number' ? payload.lng : (typeof payload.longitude === 'number' ? payload.longitude : 0);
    const currAddress = payload.curr_address ?? payload.address ?? '';

    // Exactly matching backend: `let {lat, lng, userId, isOnline} = req.body`
    const finalPayload = {
        lat,
        lng,
        userId: effectiveUserId,
        isOnline: effectiveIsOnline,

        // Also include snake_case for backward compatibility
        user_id: effectiveUserId,
        driver_id: effectiveUserId,
        is_online: effectiveIsOnline,
        latitude: lat,
        longitude: lng,
        curr_address: currAddress,
    };

    console.log('====================================================');
    console.log('🚀 [updateDriverOnlineStatus API CALLED]');
    console.log('   Endpoint: PUT /api/ambulance/driver/status');
    console.log('   Time    :', new Date().toLocaleTimeString());
    console.log('   Payload :', JSON.stringify(finalPayload, null, 2));
    console.log('====================================================');

    try {
        const response = await axiosInstance.put<UpdateDriverOnlineStatusResponse>(
            '/api/ambulance/driver/status',
            finalPayload
        );
        console.log('✅ [updateDriverOnlineStatus API SUCCESS]');
        console.log('   HTTP Status:', response.status);
        console.log('   Response Data:', JSON.stringify(response.data, null, 2));
        return response;
    } catch (error: any) {
        console.error('❌ [updateDriverOnlineStatus API ERROR]');
        console.error('   HTTP Status:', error?.response?.status);
        console.error('   Error Data :', error?.response?.data || error?.message || error);
        return error?.response || ({ data: { success: false, message: error?.message || 'Network request failed' } } as any);
    }
};

export interface RequestFilterItem {
    column: string;
    operator: '=' | '!=' | 'IN' | 'NOT IN' | 'BETWEEN' | 'LIKE' | string;
    value: string | number | boolean | (string | number)[];
}

export interface GetAmbulanceRequestPayload {
    pageIndex?: number;
    pageSize?: number;
    sortKey?: string;
    sortValue?: 'ASC' | 'DESC' | string;
    filters?: RequestFilterItem[];
    driver_id?: number | string;
    status?: string;
    [key: string]: any;
}

export interface AmbulanceRequestItem {
    id: number;
    patient_id?: number;
    patient_name?: string;
    requester_phone?: string;
    emergency_type?: string;
    pickup_lat?: string | number;
    pickup_lng?: string | number;
    pickup_address?: string;
    status: string;
    driver_name?: string | null;
    driver_mobile_no?: string | null;
    ambulance_no?: string | null;
    eta_minutes?: number | null;
    assigned_at?: string | null;
    dispatched_at?: string | null;
    completed_at?: string | null;
    cancellation_reason?: string | null;
    created_at?: string;
    driver_id?: number;
    drop_lat?: string | number | null;
    drop_lng?: string | number | null;
    drop_address?: string | null;
    distance?: string | null;
    time?: string | null;
    amount?: string | number | null;
    fare?: string | number | null;
    [key: string]: any;
}

export interface GetAmbulanceRequestResponse {
    code?: number;
    success?: boolean;
    message?: string;
    data: AmbulanceRequestItem[];
    [key: string]: any;
}

/**
 * POST /api/ambulance/getAmbulanceRequest
 * Fetches ambulance requests for a driver (Screens 10 & 12).
 * Body: { driver_id, status? }
 */

export const getAmbulanceRequestApi = async (
    payload: GetAmbulanceRequestPayload
) => {
    return await axiosInstance.post<GetAmbulanceRequestResponse>(
        '/api/ambulance/getAmbulanceRequest',
        payload
    );
};




export interface DriverProfileData {
    id?: number | string;
    client_id?: number | string;
    device_id?: string;
    user_id?: number | string;
    driver_id?: number | string;
    name?: string;
    driver_name?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    mobile_number?: string;
    mobile_no?: string;
    driver_mobile_no?: string;
    phone?: string;
    phone_number?: string;
    contact_no?: string;
    contact_number?: string;
    email_id?: string;
    email?: string;
    vehicle_number?: string;
    vehicle_no?: string;
    ambulance_no?: string;
    vehicle_name?: string;
    vehicle_image_url?: string;
    profile_image_url?: string;
    profile_image?: string;
    profile_photo?: string;
    photo?: string;
    image?: string;
    avatar?: string;
    driver_image?: string;
    driver_photo?: string;
    image_url?: string;
    photo_url?: string;
    document_status?: string;
    driving_license_status?: string;
    driving_license_image_url?: string;
    rc_book_status?: string;
    rc_book_image_url?: string;
    insurance_status?: string;
    insurance_image_url?: string;
    pollution_certificate_status?: string;
    pollution_certificate_image_url?: string;
    firebase_reg_token?: string;
    experience?: string | number;
    is_active?: number | boolean;
    is_online?: number | boolean;
    is_verified?: number | boolean | string;
    status?: string;
    last_login_datetime?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

export interface GetDriverResponse {
    code?: number;
    success?: boolean;
    message?: string;
    data?: DriverProfileData[] | DriverProfileData | any;
    result?: DriverProfileData[] | DriverProfileData | any;
    driver?: DriverProfileData[] | DriverProfileData | any;
    drivers?: DriverProfileData[] | DriverProfileData | any;
    [key: string]: any;
}

/**
 * POST /api/driver/get
 * Fetches driver profile details by id.
 * Body: { id }
 */
export const getDriverApi = async (payload?: any) => {
    try {
        return await axiosInstance.post<GetDriverResponse>(
            '/api/driver/get',
            payload
        );
    } catch (err: any) {
        throw err;
    }
};

export interface GetRouteOverviewPayload {
    driver_id: number | string;
    [key: string]: any;
}

export interface RouteOverviewData {
    total_count?: number | string;
    assigned_count?: number | string;
    completed_count?: number | string;
    completed?: number | string;
    completed_trips?: number | string;
    total_completed?: number | string;
    cancelled?: number | string;
    cancelled_trips?: number | string;
    cancelled_count?: number | string;
    rejected?: number | string;
    earnings?: number | string;
    total_earnings?: number | string;
    today_earnings?: number | string;
    amount?: number | string;
    fare?: number | string;
    total_trips?: number | string;
    [key: string]: any;
}

export interface GetRouteOverviewResponse {
    code?: number;
    success?: boolean;
    message?: string;
    data?: RouteOverviewData | RouteOverviewData[] | any;
    result?: RouteOverviewData | RouteOverviewData[] | any;
    [key: string]: any;
}

/**
 * POST /api/ambulance/getRouteOverview
 * Fetches today's route overview (completed, cancelled, earnings) for driver.
 * Body: { driver_id }
 */
export const getRouteOverviewApi = async (
    _payload?: GetRouteOverviewPayload
) => {
    try {
        return await axiosInstance.get<GetRouteOverviewResponse>(
            '/api/ambulance/getRouteOverview'
        );
    } catch (err: any) {
        throw err;
    }
};

/**
 * Helper to extract single driver object from API response structure.
 */
export const extractDriverFromResponse = (res: any): DriverProfileData | null => {
    if (!res) return null;
    const body = res?.data !== undefined ? res.data : res;
    if (!body) return null;

    let rawDriver: any = null;
    if (Array.isArray(body)) {
        rawDriver = body.length > 0 ? body[0] : null;
    } else if (Array.isArray(body.data)) {
        rawDriver = body.data.length > 0 ? body.data[0] : null;
    } else if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
        rawDriver = body.data;
    } else if (Array.isArray(body.result)) {
        rawDriver = body.result.length > 0 ? body.result[0] : null;
    } else if (body.result && typeof body.result === 'object' && !Array.isArray(body.result)) {
        rawDriver = body.result;
    } else if (Array.isArray(body.drivers)) {
        rawDriver = body.drivers.length > 0 ? body.drivers[0] : null;
    } else if (body.driver && typeof body.driver === 'object' && !Array.isArray(body.driver)) {
        rawDriver = body.driver;
    } else if (Array.isArray(body.records)) {
        rawDriver = body.records.length > 0 ? body.records[0] : null;
    } else if (Array.isArray(body.rows)) {
        rawDriver = body.rows.length > 0 ? body.rows[0] : null;
    } else if (
        typeof body === 'object' &&
        !Array.isArray(body) &&
        (body.name || body.driver_name || body.vehicle_number || body.vehicle_no)
    ) {
        rawDriver = body;
    }

    return rawDriver ? normalizeDriverProfile(rawDriver) : null;
};

export interface UpdateAmbulanceStatusPayload {
    request_id: number;
    status: string;
    np_distance?: string | number;
    drop_lat?: string | number;
    drop_lng?: string | number;
    drop_address?: string;
    ph_distance?: string | number;
    [key: string]: any;
}

export interface UpdateAmbulanceStatusResponse {
    success?: boolean;
    message?: string;
    data?: any;
    [key: string]: any;
}

/**
 * POST /api/ambulance/update-status
 * Updates ambulance request status and shortest navigation distance to patient (np_distance).
 */
export const updateAmbulanceStatusApi = async (
    payload: UpdateAmbulanceStatusPayload
) => {
    try {
        return await axiosInstance.post<UpdateAmbulanceStatusResponse>(
            '/api/ambulance/update-status',
            payload
        );
    } catch (err: any) {
        if (err?.response?.status === 405) {
            return await axiosInstance.put<UpdateAmbulanceStatusResponse>(
                '/api/ambulance/update-status',
                payload
            );
        }
        throw err;
    }
};

export interface ActiveTripResponse {
    code?: number;
    message?: string;
    has_active_trip?: boolean;
    data?: AmbulanceRequestItem | any | null;
    [key: string]: any;
}

/**
 * GET /api/ambulance/driver/active-trip
 * Fetches the currently ongoing / active trip for the driver.
 */
export const getActiveTripApi = async (params?: {
    driver_id?: number | string;
    [key: string]: any;
}) => {
    try {
        return await axiosInstance.get<ActiveTripResponse>(
            '/api/ambulance/driver/active-trip',
            { params }
        );
    } catch (err: any) {
        throw err;
    }
};
