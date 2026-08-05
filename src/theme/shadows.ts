import { Platform } from 'react-native';

export const shadows = {
    card: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.08,
            shadowRadius: 8,
        },

        android: {
            elevation: 3,
        },
    }),

    button: Platform.select({
        ios: {
            shadowColor: '#2F5BFF',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },

        android: {
            elevation: 5,
        },
    }),
};