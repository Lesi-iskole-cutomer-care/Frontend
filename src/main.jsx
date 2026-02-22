// main.jsx (or index.jsx – your root React file)
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import "./index.css";

import store from "./api/Store.js"; // 🔹 keeping your import path

// Pages
import LoginPage from "./pages/LognIn.jsx";
import HomePage from "./pages/Homepage.jsx";
import TotalComplaintsPage from "./pages/TotalComplains.jsx";

// Layouts
import RootLayout from "./layout/RootLayout.jsx";
import NavBarLayout from "./layout/NavBarLayout.jsx";

// Data pages
import Department from "./pages/Department.jsx";
import Responsiblepeople from "./pages/ResponsiblePeople.jsx";
import Agents from "./pages/Agents.jsx";
import Problem from "./pages/problem.jsx";

// 🔐 Wrapper: only allow if logged in
const RequireAuth = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 🔐 Wrapper: if already logged in, send to /home instead of login
const RedirectIfAuth = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Default entry: / → behaves like login */}
          <Route
            path="/"
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />

          {/* All routes that use RootLayout */}
          <Route element={<RootLayout />}>
            {/* Login route (protected when already logged in) */}
            <Route
              path="/login"
              element={
                <RedirectIfAuth>
                  <LoginPage />
                </RedirectIfAuth>
              }
            />

            {/* Home – only if logged in */}
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />

            {/* Complains – only if logged in */}
            <Route
              path="/complains"
              element={
                <RequireAuth>
                  <TotalComplaintsPage />
                </RequireAuth>
              }
            />

            {/* Left vertical navbar wrapper for /data/* – also protected */}
            <Route
              element={
                <RequireAuth>
                  <NavBarLayout />
                </RequireAuth>
              }
            >
              <Route path="/data/department" element={<Department />} />
              <Route path="/data/responsible" element={<Responsiblepeople />} />
              <Route path="/data/agents" element={<Agents />} />
              <Route path="/data/problem" element={<Problem />} />
            </Route>
          </Route>

          {/* Fallback: anything unknown → / (login behaviour) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
