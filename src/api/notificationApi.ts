import axiosInstance from './axiosInstance';

export interface NotificationFilter {
    column: string;
    operator: string;
    value: string | number;
}

export interface GetNotificationPayload {
    filters?: NotificationFilter[];
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
    created_modified_date?: string;
    archive_flag?: string;
    attachment?: string | null;
    client_id?: number;
    is_panel?: number;
    read_only?: string;
    result_type?: string;
    sharing_type?: string;
    total_count?: string;
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
 * Fetches notifications using filters array:
 * filters: [
 *   { column: 'owner_type', operator: '=', value: 'D' },
 *   { column: 'user_id', operator: '=', value: `${user?.id}` }
 * ]
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
