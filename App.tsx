import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/Navigation/RootNavigator';
import {
  initNotificationService,
  setupForegroundListener,
  setupNotificationOpenedListener,
} from './src/services/notificationService';

const App = () => {
  useEffect(() => {
    // 1. Initialize FCM (request permissions, retrieve device token)
    initNotificationService();

    // 2. Setup foreground push notification listener
    const unsubscribeForeground = setupForegroundListener();

    // 3. Setup notification click/open listener
    setupNotificationOpenedListener();

    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
