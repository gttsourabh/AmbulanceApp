import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    set: async (key: string, value: unknown) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    get: async <T>(key: string): Promise<T | null> => {
        try {
            const value = await AsyncStorage.getItem(key);

            if (!value) {
                return null;
            }

            return JSON.parse(value) as T;
            
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    remove: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    clear: async () => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    },
};