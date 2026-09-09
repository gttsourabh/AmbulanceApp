import {
    createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef =
    createNavigationContainerRef();

export const navigate = (
    name: string,
    params?: any,
) => {
    if (navigationRef.isReady()) {
        (navigationRef.navigate as any)(name, params);
    }
};

export const resetToLogin = () => {
    if (navigationRef.isReady()) {
        navigationRef.resetRoot({
            index: 0,
            routes: [{ name: 'Login' as never }],
        });
    }
};

export const resetToHome = () => {
    if (navigationRef.isReady()) {
        navigationRef.resetRoot({
            index: 0,
            routes: [{ name: 'MainTabs' as never }],
        });
    }
};