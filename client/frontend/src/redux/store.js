import { configureStore } from '@reduxjs/toolkit';
import interfacesReducer from './interfacesSlice';
import devicesReducer from './devicesSlice';
import anomaliesReducer from './anomaliesSlice';
import logReducer from './logSlice';

export const store = configureStore({
  reducer: {
    interfaces: interfacesReducer,   // slice mounted here
    devices: devicesReducer,
    anomalies: anomaliesReducer,
    log: logReducer,
  },
});