import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPut, apiDelete } from "../api.js";

// GET ALL
export const fetchResponsiblePeople = createAsyncThunk(
  "responsiblePeople/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await apiGet("/responsiblepeople");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// CREATE
export const createResponsiblePerson = createAsyncThunk(
  "responsiblePeople/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiPost("/responsiblepeople", payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// UPDATE
export const updateResponsiblePerson = createAsyncThunk(
  "responsiblePeople/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await apiPut(`/responsiblepeople/${id}`, payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// DELETE
export const deleteResponsiblePerson = createAsyncThunk(
  "responsiblePeople/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/responsiblepeople/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const responsiblePersonSlice = createSlice({
  name: "responsiblePeople",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResponsiblePeople.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchResponsiblePeople.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchResponsiblePeople.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // CREATE
      .addCase(createResponsiblePerson.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateResponsiblePerson.fulfilled, (state, action) => {
        const idx = state.list.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx !== -1) state.list[idx] = action.payload;
      })

      // DELETE
      .addCase(deleteResponsiblePerson.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      });
  },
});

export default responsiblePersonSlice.reducer;
