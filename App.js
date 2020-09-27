import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {persistor, store} from './src/Redux/Store/store';

// stack create
const Stack = createStackNavigator();

// import views
import Splash from './src/View/Splash';
import Home from './src/View/Home';
import AsyncStorage from '@react-native-community/async-storage';

export default function App() {
  const [show, setShow] = useState(true);

  const time = setTimeout(() => {
    setShow(false);
    clearTimeout(time);
  }, 2000);

  useEffect(() => {
    return () => {
      AsyncStorage.removeItem('vid');
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            {show ? (
              <Stack.Screen
                name="Splash"
                options={{headerShown: false}}
                component={Splash}
              />
            ) : (
              <Stack.Screen
                name="Home"
                options={{headerShown: false}}
                component={Home}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
