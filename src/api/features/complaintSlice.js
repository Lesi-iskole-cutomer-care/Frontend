// src/api/features/agentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiDelete } from "../api.js";

// ✅ GET agents list
export const fetchAgents = createAsyncThunk(
  "agents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/user/agents"); 
      // If your real endpoint is different, replace this line ONLY.
      // Expected: { agents: [...] } OR [...] (we handle both)
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load agents");
    }
  }
);

// ✅ DELETE agent
export const deleteAgent = createAsyncThunk(
  "agents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/user/agents/${id}`);
      // If your delete endpoint is different, replace this line ONLY.
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete agent");
    }
  }
);

// ✅ NEW: GET agents points summary (current month + total all time)
export const fetchAgentsPointsSummary = createAsyncThunk(
  "agents/fetchPointsSummary",
  async ({ monthKey } = {}, { rejectWithValue }) => {
    try {
      const path = monthKey
        ? `/complaints/points/agents-summary?monthKey=${encodeURIComponent(monthKey)}`
        : `/complaints/points/agents-summary`;

      const data = await apiGet(path);
      // Expected: { monthKey, count, agents: [...] }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load agents points summary");
    }
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState: {
    list: [],
    status: "idle",
    error: null,

    pointsMonthKey: null,
    pointsList: [],
    pointsStatus: "idle",
    pointsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAgents
      .addCase(fetchAgents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload;
        state.list = Array.isArray(payload) ? payload : payload?.agents || payload?.list || [];
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load agents";
      })

      // deleteAgent
      .addCase(deleteAgent.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((a) => (a._id || a.id) !== id);

        // also remove from pointsList if present
        state.pointsList = state.pointsList.filter((p) => p.agentId !== id);
      })

      // fetchAgentsPointsSummary
      .addCase(fetchAgentsPointsSummary.pending, (state) => {
        state.pointsStatus = "loading";
        state.pointsError = null;
      })
      .addCase(fetchAgentsPointsSummary.fulfilled, (state, action) => {
        state.pointsStatus = "succeeded";
        state.pointsMonthKey = action.payload?.monthKey || null;
        state.pointsList = action.payload?.agents || [];
      })
      .addCase(fetchAgentsPointsSummary.rejected, (state, action) => {
        state.pointsStatus = "failed";
        state.pointsError = action.payload || "Failed to load agents points summary";
      });
  },
});

export default agentsSlice.reducer;
