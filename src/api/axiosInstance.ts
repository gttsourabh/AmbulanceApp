import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'YOUR_API_BASE_URL',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================

axiosInstance.interceptors.request.use(
    config => {
        if (__DEV__) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚀 API REQUEST');
            console.log('Method:', config.method?.toUpperCase());
            console.log('URL:', `${config.baseURL}${config.url}`);
            console.log('Params:', config.params);
            console.log('Body:', config.data);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        return config;
    },

    error => {
        if (__DEV__) {
            console.log('❌ REQUEST ERROR');
            console.log(error);
        }

        return Promise.reject(error);
    },
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================

axiosInstance.interceptors.response.use(
    response => {
        if (__DEV__) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ API RESPONSE');
            console.log(
                'URL:',
                `${response.config.baseURL}${response.config.url}`,
            );
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        return response;
    },

    error => {
        if (__DEV__) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('❌ API ERROR');

            if (error.response) {
                console.log(
                    'URL:',
                    `${error.config?.baseURL}${error.config?.url}`,
                );
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
            } else if (error.request) {
                console.log('No response received from server');
                console.log('Request:', error.request);
            } else {
                console.log('Error:', error.message);
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;