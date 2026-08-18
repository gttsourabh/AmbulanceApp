import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <AppNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

export default RootNavigator;