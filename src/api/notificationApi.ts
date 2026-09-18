import axiosInstance from './axiosInstance';

export interface GetNotificationPayload {
    filter?: string;
    [key: string]: any;
}

export interface NotificationRecord {
    id: number | string;
    title?: string;
    heading?: string;
    message?: string;
    body?: string;
    description?: string;
    owner_type?: string;
    user_id?: number | string;
    is_read?: number | boolean;
    created_at?: string;
    updated_at?: string;
    time?: string;
    date?: string;
    [key: string]: any;
}

export interface GetNotificationResponse {
    code?: number;
    success?: boolean;
    message?: string;
    data?: NotificationRecord[] | any;
    [key: string]: any;
}

/**
 * POST /api/notification/get
 * Fetches driver notifications using filter: ' and owner_type="d" and user_id=?'
 */
export const getNotificationsApi = async (
    payload: GetNotificationPayload
) => {
    try {
        return await axiosInstance.post<GetNotificationResponse>(
            '/api/notification/get',
            payload
        );
    } catch (err: any) {
        // Fallback to GET if server endpoint expects GET
        if (err?.response?.status === 405) {
            return await axiosInstance.get<GetNotificationResponse>(
                '/api/notification/get',
                { params: payload }
            );
        }
        throw err;
    }
};
