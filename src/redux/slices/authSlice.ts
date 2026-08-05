// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'PATIENT' | 'DRIVER' | 'ADMIN';

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole;
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
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

        // Login successful
        loginSuccess: (
            state,
            action: PayloadAction<{
                user: User;
                token: string;
            }>,
        ) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        },

        // Login failed
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        },

        // Logout
        logout: state => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },

        // Restore login session
        restoreSession: (
            state,
            action: PayloadAction<{
                user: User;
                token: string;
            }>,
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
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
    clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;