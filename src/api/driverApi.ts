import axiosInstance from './axiosInstance';

export interface UpdateDriverLocationPayload {
    ambulance_request_id: number;
    driver_id: number;
    latitude: number;
    longitude: number;
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
