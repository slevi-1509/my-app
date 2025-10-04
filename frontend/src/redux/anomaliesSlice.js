// src/features/interfaces/interfacesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk that fetches an array
export const fetchAnomalies = createAsyncThunk(
  'anomalies/fetchAnomalies',
  async () => {
    const SERVER_URL = 'http://localhost:8000';
    const res = await fetch(`${SERVER_URL}/anomalies`);
    const data = await res.json();
    return data; // this is an array
  }
);

const anomaliesSlice = createSlice({
  name: 'anomalies',
  initialState: {
    anomalies: [],   // will hold the fetched array
    status: 'idle',   // idle | loading | succeeded | failed
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnomalies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnomalies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.anomalies = action.payload; // put the array into state
      })
      .addCase(fetchAnomalies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default anomaliesSlice.reducer;
export const selectAllAnomalies = (state) => state.anomalies.anomalies;
export const getAnomaliesStatus = (state) => state.anomalies.status;