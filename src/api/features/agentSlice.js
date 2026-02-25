// src/api/features/agentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiDelete, apiPut } from "../api.js";

// ✅ GET agents list
export const fetchAgents = createAsyncThunk(
  "agents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/user/agents");
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
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete agent");
    }
  }
);

// ✅ Agents points summary
export const fetchAgentsPointsSummary = createAsyncThunk(
  "agents/fetchPointsSummary",
  async ({ monthKey } = {}, { rejectWithValue }) => {
    try {
      const path = monthKey
        ? `/complaints/points/agents-summary?monthKey=${encodeURIComponent(monthKey)}`
        : `/complaints/points/agents-summary`;

      const data = await apiGet(path);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load agents points summary");
    }
  }
);

// ✅ NEW: fetch pending agents (admin only)
export const fetchPendingAgents = createAsyncThunk(
  "agents/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/user/agents/pending"); // { agents: [...] }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load pending agents");
    }
  }
);

// ✅ NEW: approve agent (admin only)
export const approvePendingAgent = createAsyncThunk(
  "agents/approvePending",
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/user/agents/${id}/approve`, {});
      return data?.agent || { _id: id, approvalStatus: "approved" };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to approve agent");
    }
  }
);

// ✅ NEW: reject agent (admin only)
export const rejectPendingAgent = createAsyncThunk(
  "agents/rejectPending",
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/user/agents/${id}/reject`, {});
      return data?.agent || { _id: id, approvalStatus: "rejected" };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to reject agent");
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

    pendingList: [],
    pendingStatus: "idle",
    pendingError: null,
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
        state.list = Array.isArray(payload)
          ? payload
          : payload?.agents || payload?.list || [];
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load agents";
      })

      // deleteAgent
      .addCase(deleteAgent.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((a) => (a._id || a.id) !== id);
        state.pointsList = state.pointsList.filter((p) => p.agentId !== id);
        state.pendingList = state.pendingList.filter((p) => (p._id || p.id) !== id);
      })

      // points
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
      })

      // pending list
      .addCase(fetchPendingAgents.pending, (state) => {
        state.pendingStatus = "loading";
        state.pendingError = null;
      })
      .addCase(fetchPendingAgents.fulfilled, (state, action) => {
        state.pendingStatus = "succeeded";
        state.pendingList = action.payload?.agents || [];
      })
      .addCase(fetchPendingAgents.rejected, (state, action) => {
        state.pendingStatus = "failed";
        state.pendingError = action.payload || "Failed to load pending agents";
      })

      // approve
      .addCase(approvePendingAgent.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = String(updated?._id || updated?.id || "");
        state.pendingList = state.pendingList.filter((a) => String(a._id || a.id) !== id);

        state.list = state.list.map((a) =>
          String(a._id || a.id) === id ? { ...a, approvalStatus: "approved" } : a
        );
      })

      // reject
      .addCase(rejectPendingAgent.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = String(updated?._id || updated?.id || "");
        state.pendingList = state.pendingList.filter((a) => String(a._id || a.id) !== id);

        state.list = state.list.map((a) =>
          String(a._id || a.id) === id ? { ...a, approvalStatus: "rejected" } : a
        );
      });
  },
});

export default agentsSlice.reducer;