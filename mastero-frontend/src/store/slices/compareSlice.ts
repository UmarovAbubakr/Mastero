import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompareState {
  workerIds: string[];
}

const initialState: CompareState = {
  workerIds: [],
};

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    toggleCompare: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.workerIds.includes(id)) {
        state.workerIds = state.workerIds.filter(workerId => workerId !== id);
      } else {
        if (state.workerIds.length < 4) { // Limit to 4 masters for better UI
          state.workerIds.push(id);
        }
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.workerIds = state.workerIds.filter(id => id !== action.payload);
    },
    clearCompare: (state) => {
      state.workerIds = [];
    },
  },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
