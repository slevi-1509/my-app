import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchLog = createAsyncThunk(
  'log/fetchLog',
  async (selectedDevice) => {
    const SERVER_URL = 'http://localhost:8000';
    const res = await fetch(`${SERVER_URL}/log${selectedDevice}`);
    const data = await res.json();
    return data; // this is an array
  }
);

const initialState = {
  log: [],   // will hold the fetched array
  status: 'idle',   // idle | loading | succeeded | failed
  error: null
};

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    resetSlice: (state) => {
      return initialState; // Reset the entire slice state to its initial state
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.log = action.payload; // put the array into state
      })
      .addCase(fetchLog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

  export default logSlice.reducer;
  export const { resetSlice } = logSlice.actions;
  export const selectAllLog = (state) => state.log.log;
  export const getLogStatus = (state) => state.log.status;
