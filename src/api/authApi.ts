import axiosInstance from './axiosInstance';

// ===============================
// TYPES
// ===============================

export interface SendOtpRequest {
    mobile_number: string;
}

export interface SendOtpResponse {
    success?: boolean;
    code?: number;
    message?: string;
    msg?: string;
    data?: any;
    otp?: string | number;
    [key: string]: any;
}

export interface VerifyOtpRequest {
    mobile_number: string;
    otp: string;
}

export interface VerifyOtpResponse {
    success?: boolean;
    code?: number;
    message?: string;
    msg?: string;
    token?: string;
    user?: any;
    [key: string]: any;
}

export interface VerifyOtpAmbDriverRequest {
    mobile_number: string;
    otp: string;
    cloud_id: string;
}

export interface SubscribedChannel {
    topic_name: string;
    channel_id: number;
}

export interface UserData {
    id: number | string;
    role_id?: number;
    name?: string;
    mobile_number?: string;
    phone?: string;
    email?: string;
    [key: string]: any;
}

export interface VerifyOtpAmbDriverResponse {
    success?: boolean;
    code?: number;
    message?: string;
    msg?: string;
    token?: string;
    UserData?: UserData;
    SUBSCRIBED_CHANNELS?: SubscribedChannel[];
    user?: any;
    data?: any;
    [key: string]: any;
}

// ===============================
// STATIC CONFIG
// ===============================

/** Static cloud ID — replace with dynamic value when available */
export const STATIC_CLOUD_ID = 'AMB_CLOUD_001';

// ===============================
// APIs
// ===============================

/**
 * Send OTP API
 * POST /user/sendOtp
 * @param payload - Object containing `mobile_number` or string mobile number
 */

export const sendOtpApi = async (
    payload: SendOtpRequest | string,
): Promise<SendOtpResponse> => {
    const data: SendOtpRequest =
        typeof payload === 'string'
            ? { mobile_number: payload }
            : payload;

    const response = await axiosInstance.post<SendOtpResponse>(
        '/user/sendOtp',
        data,
    );
    console.log('OTP Response', JSON.stringify(response.data, null, 2));
    return response.data;
};

/**
 * Verify OTP API (generic)
 * POST /user/verifyOtp
 */

export const verifyOtpApi = async (
    data: VerifyOtpRequest,
): Promise<VerifyOtpResponse> => {
    const response = await axiosInstance.post<VerifyOtpResponse>(
        '/user/verifyOtp',
        data,
    );
    console.log('Verify OTP Response', JSON.stringify(response, null, 2));
    return response.data;
};

/**
 * Verify OTP for Ambulance Driver
 * POST /user/verifyOtpAmbDriver
 * Body: { mobile_number, otp, cloud_id }
 */
export const verifyOtpAmbDriverApi = async (
    data: VerifyOtpAmbDriverRequest,
): Promise<VerifyOtpAmbDriverResponse> => {
    const response = await axiosInstance.post<VerifyOtpAmbDriverResponse>(
        '/user/verifyOtpAmbDriver',
        data,
    );
    console.log('Verify OTP AmbDriver Response', JSON.stringify(response.data, null, 2));
    return response.data;
};
