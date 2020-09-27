import {applyMiddleware, createStore} from 'redux';
import ReduxThunk from 'redux-thunk';
import AsyncStorage from '@react-native-community/async-storage';
import {persistStore, persistReducer} from 'redux-persist';

// import reducers
import Reducers from '../Reducers/Reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, Reducers);

const store = createStore(persistedReducer, applyMiddleware(ReduxThunk));

const persistor = persistStore(store);

export {persistor, store};
