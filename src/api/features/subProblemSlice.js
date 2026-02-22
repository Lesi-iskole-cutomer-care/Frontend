// app/features/subProblemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPut, apiDelete } from "../api.js";

// 🔹 Helper to normalize list
function normalizeSubProblemList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.subProblems)) return payload.subProblems;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// GET /api/subproblems
export const fetchSubProblems = createAsyncThunk(
  "subProblems/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/subproblems");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load sub problems");
    }
  }
);

// GET /api/subproblems/by-main/:mainProblemId
export const fetchSubProblemsByMain = createAsyncThunk(
  "subProblems/fetchByMain",
  async (mainProblemId, { rejectWithValue }) => {
    try {
      const data = await apiGet(`/subproblems/by-main/${mainProblemId}`);
      // backend returns { mainProblem, subProblems }
      return { mainProblemId, ...data };
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to load sub problems by main"
      );
    }
  }
);

// POST /api/subproblems
// Body: { mainProblemId, name }
export const createSubProblem = createAsyncThunk(
  "subProblems/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiPost("/subproblems", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create sub problem");
    }
  }
);

// PUT /api/subproblems/:id
export const updateSubProblem = createAsyncThunk(
  "subProblems/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/subproblems/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update sub problem");
    }
  }
);

// ✅ DELETE /api/subproblems/:id
export const deleteSubProblem = createAsyncThunk(
  "subProblems/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/subproblems/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete sub problem");
    }
  }
);

const subProblemSlice = createSlice({
  name: "subProblems",
  initialState: {
    list: [],
    byMain: {}, // { mainProblemId: [] }
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSubProblems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubProblems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = normalizeSubProblemList(action.payload);
      })
      .addCase(fetchSubProblems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch by main
      .addCase(fetchSubProblemsByMain.fulfilled, (state, action) => {
        const { mainProblemId, subProblems } = action.payload;
        state.byMain[mainProblemId] = normalizeSubProblemList({
          subProblems,
        });
      })

      // Create
      .addCase(createSubProblem.fulfilled, (state, action) => {
        if (!action.payload) return;
        const newSub =
          action.payload.subProblem ||
          action.payload.data ||
          action.payload;
        state.list.push(newSub);

        const mpId =
          newSub.mainProblem?._id || newSub.mainProblem || null;
        if (mpId) {
          if (!state.byMain[mpId]) state.byMain[mpId] = [];
          state.byMain[mpId].push(newSub);
        }
      })

      // Update
      .addCase(updateSubProblem.fulfilled, (state, action) => {
        if (!action.payload) return;
        const updated =
          action.payload.subProblem ||
          action.payload.data ||
          action.payload;

        const id = updated._id || updated.id;

        // Update in flat list
        const idx = state.list.findIndex((p) => (p._id || p.id) === id);
        if (idx !== -1) state.list[idx] = updated;

        // Update inside byMain
        const mpId =
          updated.mainProblem?._id || updated.mainProblem || null;
        if (mpId && state.byMain[mpId]) {
          const idx2 = state.byMain[mpId].findIndex(
            (p) => (p._id || p.id) === id
          );
          if (idx2 !== -1) state.byMain[mpId][idx2] = updated;
        }
      })

      // ✅ Delete
      .addCase(deleteSubProblem.fulfilled, (state, action) => {
        const id = action.payload;

        // remove from flat list
        const removed = state.list.find((p) => (p._id || p.id) === id);
        state.list = state.list.filter((p) => (p._id || p.id) !== id);

        // remove from byMain
        if (removed) {
          const mpId =
            removed.mainProblem?._id || removed.mainProblem || null;
          if (mpId && state.byMain[mpId]) {
            state.byMain[mpId] = state.byMain[mpId].filter(
              (p) => (p._id || p.id) !== id
            );
          }
        }
      });
  },
});

export default subProblemSlice.reducer;
