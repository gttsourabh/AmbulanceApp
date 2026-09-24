import axiosInstance, { API_BASE_URL } from '../api/axiosInstance';
import type { DriverProfileData } from '../api/driverApi';

/**
 * Returns the current active server base URL (e.g. https://6mcr9zjh-8867.inc1.devtunnels.ms).
 */
export const getBaseServerUrl = (): string => {
    const raw = axiosInstance.defaults?.baseURL || API_BASE_URL || 'https://6mcr9zjh-8867.inc1.devtunnels.ms';
    return raw.replace(/\/+$/, '');
};

/**
 * Known backend image storage folders inside /static/
 */
export const IMAGE_FOLDERS = {
    PROFILE: 'driverProfileImages',
    DRIVING_LICENSE: 'driverDrivingLicenseImages',
    INSURANCE: 'driverInsuranceImages',
    POLLUTION_CERTIFICATE: 'driverPollutionCertificateImages',
    RC_BOOK: 'driverRcBookImages',
    VEHICLE: 'driverVehicleImages',
} as const;

export type ImageFolderType = keyof typeof IMAGE_FOLDERS | (typeof IMAGE_FOLDERS)[keyof typeof IMAGE_FOLDERS] | string;

/**
 * Converts a raw filename or relative path into a fully qualified URL.
 * If already an absolute http/https/file/data URL, it returns it unchanged.
 */
export const getImageUrl = (
    pathOrFilename?: string | null,
    folder: string = IMAGE_FOLDERS.PROFILE
): string | null => {
    if (!pathOrFilename || typeof pathOrFilename !== 'string') return null;
    const trimmed = pathOrFilename.trim();
    if (!trimmed) return null;

    // Check if already an absolute URL or local scheme
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('file://') ||
        trimmed.startsWith('content://')
    ) {
        return trimmed;
    }

    const base = getBaseServerUrl();
    const cleanPath = trimmed.replace(/^\/+/, '');

    // If it already starts with static/
    if (cleanPath.startsWith('static/')) {
        return `${base}/${cleanPath}`;
    }

    // If already starts with the folder name
    if (cleanPath.startsWith(folder)) {
        return `${base}/static/${cleanPath}`;
    }

    return `${base}/static/${folder}/${cleanPath}`;
};

/**
 * Helper getters for specific image categories
 */
export const getProfileImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.PROFILE);

export const getDrivingLicenseImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.DRIVING_LICENSE);

export const getInsuranceImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.INSURANCE);

export const getPollutionCertificateImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.POLLUTION_CERTIFICATE);

export const getRcBookImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.RC_BOOK);

export const getVehicleImageUrl = (img?: string | null): string | null =>
    getImageUrl(img, IMAGE_FOLDERS.VEHICLE);

/**
 * Normalizes a DriverProfileData object from API responses or navigation params
 * so all image properties are converted to full accessible URLs.
 */
export const normalizeDriverProfile = (driver: any): DriverProfileData | null => {
    if (!driver || typeof driver !== 'object') return null;

    const normalized: any = { ...driver };

    // 1. Profile image
    const rawProfile =
        driver.profile_image_url ||
        driver.profile_image ||
        driver.profile_photo ||
        driver.photo ||
        driver.image ||
        driver.avatar ||
        driver.driver_image ||
        driver.driver_photo ||
        driver.image_url ||
        driver.photo_url ||
        null;

    if (rawProfile) {
        const fullProfileUrl = getProfileImageUrl(rawProfile);
        if (fullProfileUrl) {
            normalized.profile_image_url = fullProfileUrl;
            normalized.profile_image = fullProfileUrl;
            normalized.image = fullProfileUrl;
            normalized.photo = fullProfileUrl;
        }
    }

    // 2. Vehicle image
    const rawVehicle = driver.vehicle_image_url || driver.vehicle_image || null;
    if (rawVehicle) {
        const fullVehicleUrl = getVehicleImageUrl(rawVehicle);
        if (fullVehicleUrl) {
            normalized.vehicle_image_url = fullVehicleUrl;
            normalized.vehicle_image = fullVehicleUrl;
        }
    }

    // 3. Driving license
    const rawLicense = driver.driving_license_image_url || driver.driving_license_image || null;
    if (rawLicense) {
        const fullLicenseUrl = getDrivingLicenseImageUrl(rawLicense);
        if (fullLicenseUrl) {
            normalized.driving_license_image_url = fullLicenseUrl;
            normalized.driving_license_image = fullLicenseUrl;
        }
    }

    // 4. Insurance
    const rawInsurance = driver.insurance_image_url || driver.insurance_image || null;
    if (rawInsurance) {
        const fullInsuranceUrl = getInsuranceImageUrl(rawInsurance);
        if (fullInsuranceUrl) {
            normalized.insurance_image_url = fullInsuranceUrl;
            normalized.insurance_image = fullInsuranceUrl;
        }
    }

    // 5. Pollution certificate
    const rawPollution = driver.pollution_certificate_image_url || driver.pollution_certificate_image || null;
    if (rawPollution) {
        const fullPollutionUrl = getPollutionCertificateImageUrl(rawPollution);
        if (fullPollutionUrl) {
            normalized.pollution_certificate_image_url = fullPollutionUrl;
            normalized.pollution_certificate_image = fullPollutionUrl;
        }
    }

    // 6. RC book
    const rawRc = driver.rc_book_image_url || driver.rc_book_image || null;
    if (rawRc) {
        const fullRcUrl = getRcBookImageUrl(rawRc);
        if (fullRcUrl) {
            normalized.rc_book_image_url = fullRcUrl;
            normalized.rc_book_image = fullRcUrl;
        }
    }

    return normalized;
};
