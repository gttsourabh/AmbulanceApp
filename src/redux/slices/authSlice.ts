// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface AuthState {
    user: UserData | null;
    token: string | null;
    subscribedChannels: SubscribedChannel[];
    userChannel: string | null;
    driverChannel: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    subscribedChannels: [],
    userChannel: null,
    driverChannel: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',

    initialState,

    reducers: {
        // Login started
        loginStart: state => {
            state.loading = true;
            state.error = null;
        },

        // Login successful — stores token, UserData, and subscribedChannels
        loginSuccess: (
            state,
            action: PayloadAction<{
                user: UserData;
                token: string;
                subscribedChannels?: SubscribedChannel[];
                userChannel?: string | null;
                driverChannel?: string | null;
            }>,
        ) => {
            const channels = action.payload.subscribedChannels || [];
            const userTopic =
                channels.find(c => c.topic_name?.startsWith('USER_'))?.topic_name || null;
            const driverTopic =
                channels.find(c => c.topic_name?.includes('DRIVER'))?.topic_name || null;

            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.subscribedChannels = channels;
            state.userChannel = action.payload.userChannel ?? userTopic;
            state.driverChannel = action.payload.driverChannel ?? driverTopic;
            state.isAuthenticated = true;
            state.error = null;
        },

        // Login failed
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.subscribedChannels = [];
            state.userChannel = null;
            state.driverChannel = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        },

        // Logout
        logout: state => {
            state.user = null;
            state.token = null;
            state.subscribedChannels = [];
            state.userChannel = null;
            state.driverChannel = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },

        // Restore login session from storage
        restoreSession: (
            state,
            action: PayloadAction<{
                user: UserData;
                token: string;
                subscribedChannels?: SubscribedChannel[];
                userChannel?: string | null;
                driverChannel?: string | null;
            }>,
        ) => {
            const channels = action.payload.subscribedChannels || [];
            const userTopic =
                channels.find(c => c.topic_name?.startsWith('USER_'))?.topic_name || null;
            const driverTopic =
                channels.find(c => c.topic_name?.includes('DRIVER'))?.topic_name || null;

            state.user = action.payload.user;
            state.token = action.payload.token;
            state.subscribedChannels = channels;
            state.userChannel = action.payload.userChannel ?? userTopic;
            state.driverChannel = action.payload.driverChannel ?? driverTopic;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },

        // Update subscribed channels
        setSubscribedChannels: (
            state,
            action: PayloadAction<SubscribedChannel[]>,
        ) => {
            const channels = action.payload;
            state.subscribedChannels = channels;
            state.userChannel =
                channels.find(c => c.topic_name?.startsWith('USER_'))?.topic_name || null;
            state.driverChannel =
                channels.find(c => c.topic_name?.includes('DRIVER'))?.topic_name || null;
        },

        // Clear error
        clearAuthError: state => {
            state.error = null;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    restoreSession,
    setSubscribedChannels,
    clearAuthError,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectSubscribedChannels = (state: { auth: AuthState }) => state.auth.subscribedChannels;
export const selectUserChannel = (state: { auth: AuthState }) => state.auth.userChannel;
export const selectDriverChannel = (state: { auth: AuthState }) => state.auth.driverChannel;

export default authSlice.reducer;