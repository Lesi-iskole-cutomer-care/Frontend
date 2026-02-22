// app/features/mainProblemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPut, apiDelete } from "../api.js";

// 🔹 Helper: normalize list from backend
function normalizeMainProblemList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.mainProblems)) return payload.mainProblems;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// GET /api/mainproblems
export const fetchMainProblems = createAsyncThunk(
  "mainProblems/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/mainproblems");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load main problems");
    }
  }
);

// POST /api/mainproblems
export const createMainProblem = createAsyncThunk(
  "mainProblems/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiPost("/mainproblems", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create main problem");
    }
  }
);

// PUT /api/mainproblems/:id
export const updateMainProblem = createAsyncThunk(
  "mainProblems/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/mainproblems/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update main problem");
    }
  }
);

// DELETE /api/mainproblems/:id
export const deleteMainProblem = createAsyncThunk(
  "mainProblems/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/mainproblems/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete main problem");
    }
  }
);

const mainProblemSlice = createSlice({
  name: "mainProblems",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMainProblems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMainProblems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = normalizeMainProblemList(action.payload);
      })
      .addCase(fetchMainProblems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create
      .addCase(createMainProblem.fulfilled, (state, action) => {
        if (!action.payload) return;
        const newProblem =
          action.payload.mainProblem ||
          action.payload.data ||
          action.payload;
        state.list.push(newProblem);
      })

      // Update
      .addCase(updateMainProblem.fulfilled, (state, action) => {
        if (!action.payload) return;
        const updated =
          action.payload.mainProblem ||
          action.payload.data ||
          action.payload;
        const id = updated._id || updated.id;
        const idx = state.list.findIndex((p) => (p._id || p.id) === id);
        if (idx !== -1) state.list[idx] = updated;
      })

      // Delete
      .addCase(deleteMainProblem.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((p) => (p._id || p.id) !== id);
      });
  },
});

export default mainProblemSlice.reducer;
