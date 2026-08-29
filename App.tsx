import React from 'react';
import { Provider } from 'react-redux';
import { View, Text } from 'react-native';
import { store } from './src/redux/store';
import RootNavigator from './src/Navigation/RootNavigator';

const App = () => {

  return (

    <Provider store={store}>

      <RootNavigator />

    </Provider>

  );

};

export default App;
