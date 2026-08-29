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
    phone?: string;
    email?: string;
    [key: string]: any;
}

export interface AuthState {
    user: UserData | null;
    token: string | null;
    subscribedChannels: SubscribedChannel[];
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    subscribedChannels: [],
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
            }>,
        ) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.subscribedChannels = action.payload.subscribedChannels || [];
            state.isAuthenticated = true;
            state.error = null;
        },

        // Login failed
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.subscribedChannels = [];
            state.isAuthenticated = false;
            state.error = action.payload;
        },

        // Logout
        logout: state => {
            state.user = null;
            state.token = null;
            state.subscribedChannels = [];
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
            }>,
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.subscribedChannels = action.payload.subscribedChannels || [];
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },

        // Update subscribed channels
        setSubscribedChannels: (
            state,
            action: PayloadAction<SubscribedChannel[]>,
        ) => {
            state.subscribedChannels = action.payload;
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

export default authSlice.reducer;