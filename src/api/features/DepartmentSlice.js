// app/features/departmentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPut, apiDelete } from "../api.js";

// 🔹 Helper to normalize response into an array
function normalizeDepartmentList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.departments)) return payload.departments;
  if (Array.isArray(payload?.data)) return payload.data;
  return []; // fallback
}

// 🔹 GET /api/departments
export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/departments");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load departments");
    }
  }
);

// 🔹 POST /api/departments
export const createDepartment = createAsyncThunk(
  "departments/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiPost("/departments", payload);
      return data; // new department object or { department: {...} }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create department");
    }
  }
);

// 🔹 PUT /api/departments/:id
export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await apiPut(`/departments/${id}`, payload);
      return data; // updated department
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update department");
    }
  }
);

// 🔹 DELETE /api/departments/:id
export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiDelete(`/departments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete department");
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = normalizeDepartmentList(action.payload);
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 🔹 Create
      .addCase(createDepartment.fulfilled, (state, action) => {
        if (!action.payload) return;

        const newDept =
          action.payload.department ||
          action.payload.data ||
          action.payload;

        state.list.push(newDept);
      })

      // 🔹 Update
      .addCase(updateDepartment.fulfilled, (state, action) => {
        if (!action.payload) return;

        const updated =
          action.payload.department ||
          action.payload.data ||
          action.payload;

        const id = updated._id || updated.id;
        const idx = state.list.findIndex((d) => (d._id || d.id) === id);
        if (idx !== -1) {
          state.list[idx] = updated;
        }
      })

      // 🔹 Delete
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((d) => (d._id || d.id) !== id);
      });
  },
});

export default departmentSlice.reducer;
