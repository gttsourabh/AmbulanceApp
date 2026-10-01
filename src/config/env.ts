/**
 * Application Environment Configuration
 * Centralized access to all environment variables and configuration constants.
 */
export const ENV = {
    // App Details
    APP_ENV: 'production',
    APP_NAME: 'Secure Ambulance',
    APP_PACKAGE_NAME: 'com.secureambulance',

    // API & Backend
    // API_BASE_URL: 'https://arvaya.uvtechsoft.com:7001',
    API_BASE_URL: 'https://6mcr9zjh-8867.inc1.devtunnels.ms',
    API_KEY: 'JP76Ol1r5lMvzljKmeaTdP9EthTYzKFH',
    API_TIMEOUT: 15000,

    // Development Tunnel Fallbacks
    DEV_TUNNELS: {
        BAHUBALI: 'https://6mcr9zjh-8867.inc1.devtunnels.ms',
        PRANALI: 'https://98769p8r-8867.inc1.devtunnels.ms',
    },

    // Google Maps & Places Platform
    GOOGLE_MAPS_API_KEY: 'AIzaSyAb1gQL2IMHkFMdEqZ8Dzz4xiN4ulVpfI0',
    GOOGLE_ROUTES_API_URL: 'https://routes.googleapis.com/directions/v2:computeRoutes',
    GOOGLE_PLACES_SEARCH_TEXT_URL: 'https://places.googleapis.com/v1/places:searchText',
    GOOGLE_PLACES_SEARCH_NEARBY_URL: 'https://places.googleapis.com/v1/places:searchNearby',

    // Firebase Credentials
    FIREBASE: {
        API_KEY: 'AIzaSyBp7sKOD1lgbJit24OtjqgxiEICvb--I08',
        PROJECT_ID: 'arvaya-d841e',
        PROJECT_NUMBER: '577574167930',
        STORAGE_BUCKET: 'arvaya-d841e.firebasestorage.app',
        APP_ID: '1:577574167930:android:1a2aa199b289262676a2c3',
    },

} as const;

export default ENV;
