// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import departmentReducer from "./features/DepartmentSlice";
import mainProblemReducer from "./features/mainProblemSlice";
import subProblemReducer from "./features/subProblemSlice";
import responsiblePersonReducer from "./features/responsiblePersonSlice";
import complaintReducer from "./features/complaintSlice";
import agentReducer from "./features/agentSlice";
import filterReducer from "./features/FilterSlice"; // ✅ NEW

const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    mainProblems: mainProblemReducer,
    subProblems: subProblemReducer,
    responsiblePeople: responsiblePersonReducer,
    complaints: complaintReducer,
    agents: agentReducer,
    filters: filterReducer, // ✅ NEW
  },
});

export default store;
