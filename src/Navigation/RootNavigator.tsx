import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { navigationRef } from '../utils/navigationRef';

const RootNavigator = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? (
                <AppNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );

};

export default RootNavigator;