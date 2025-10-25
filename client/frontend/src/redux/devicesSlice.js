// src/features/interfaces/interfacesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk that fetches an array
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (router_mac) => {
    // const state = getState();
    const SERVER_URL = `http://localhost:8000`;
    const res = await fetch(`${SERVER_URL}/devices${router_mac}`);
    const data = await res.json();
    return data; // this is an array
  }
);

const devicesSlice = createSlice({
  name: 'devices',
  initialState: {
    devices: {},   // will hold the fetched array
    router_mac: '',
    selectedDevice: '',
    status: 'idle',   // idle | loading | succeeded | failed
    error: null
  },
  reducers: {
    setRouterMac: (state, action) => {
      state.router_mac = action.payload;
    },
    setSelectedDevice: (state, action) => {
      state.selectedDevice = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.devices = action.payload; // put the array into state
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default devicesSlice.reducer;
export const { setRouterMac, setSelectedDevice } = devicesSlice.actions;
export const selectAllDevices = (state) => state.devices.devices;
export const getDevicesStatus = (state) => state.devices.status;