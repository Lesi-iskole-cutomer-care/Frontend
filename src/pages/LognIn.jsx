// pages/LognIn.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signIn } from "../api/features/authSlice.js";
import Login from "../assets/Login.png";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);

  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send credentials to backend via Redux thunk
    const resultAction = await dispatch(signIn({ phonenumber, password }));

    // If login success -> go to /home
    if (signIn.fulfilled.match(resultAction)) {
      navigate("/home");
    }
    // If failed, error is already stored in Redux and shown below
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Right side image (hidden on mobile) */}
      <div className="hidden md:flex w-full md:w-1/2">
        <img
          src={Login}
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Left side - White area with login form */}
      <div className="flex flex-col justify-center items-center bg-white w-full md:w-1/2 p-10">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Cutomer Care</h2>
        <p className="text-gray-500 mb-8">Login to continue your account</p>

        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error from Redux */}
          {error && (
            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
