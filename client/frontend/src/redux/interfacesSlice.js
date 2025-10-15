// src/features/interfaces/interfacesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk that fetches an array
export const fetchInterfaces = createAsyncThunk(
  'interfaces/fetchInterfaces',
  async () => {
    // debugger;
    const SERVER_URL = 'http://localhost:8000';
    const res = await fetch(`${SERVER_URL}/interfaces`);
    const data = await res.json();
    return data; // this is an array
  }
);

const interfacesSlice = createSlice({
  name: 'interfaces',
  initialState: {
    interfaces: [],   // will hold the fetched array
    status: 'idle',   // idle | loading | succeeded | failed
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterfaces.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInterfaces.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.interfaces = action.payload; // put the array into state
      })
      .addCase(fetchInterfaces.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default interfacesSlice.reducer;
export const selectAllInterfaces = (state) => state.interfaces.interfaces;
export const getInterfacesStatus = (state) => state.interfaces.status;