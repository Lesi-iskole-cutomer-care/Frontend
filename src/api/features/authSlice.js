// src/api/features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiPost, setStoredUser, clearStoredUser } from "../api.js";

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiPost("/auth/signin", credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Signin failed");
    }
  }
);

const initialState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOutLocal(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      // ✅ clear user id
      clearStoredUser();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;

        // ✅ store user for x-user-id header
        if (state.user) setStoredUser(state.user);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Signin failed";
      });
  },
});

export const { signOutLocal } = authSlice.actions;
export default authSlice.reducer;