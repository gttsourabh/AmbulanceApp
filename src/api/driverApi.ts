import axiosInstance from './axiosInstance';

export type TripNavigationType = 'np' | 'pd';

export interface UpdateDriverLocationPayload {
    ambulance_request_id: number;
    driver_id: number;
    latitude: number;
    longitude: number;
    type?: TripNavigationType; // 'np' = navigation to patient, 'pd' = patient to doctor
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
    user_id: number | string;
    is_online: boolean;
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
 * Payload: { user_id, is_online }
 */
export const updateDriverOnlineStatus = async (
    payload: UpdateDriverOnlineStatusPayload
) => {
    return await axiosInstance.put<UpdateDriverOnlineStatusResponse>(
        '/api/ambulance/driver/status',
        payload
    );
};

export interface GetAmbulanceRequestPayload {
    driver_id: number | string;
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

