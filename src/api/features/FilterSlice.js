// app/features/filterSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resultCount: 0, // 🔹 how many complaints returned by filter API
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setResultCount(state, action) {
      state.resultCount = action.payload ?? 0;
    },
  },
});

export const { setResultCount } = filterSlice.actions;
export default filterSlice.reducer;
