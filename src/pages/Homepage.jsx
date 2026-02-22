import React from "react";
import { Link } from "react-router-dom";
import lesiiskole_logo from "../assets/lesiiskole_logo.png";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">

          {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={lesiiskole_logo}
            alt="Lesi Iskole"
            className="h-28 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{ color: "#1F31F9" }}>
          Welcome to Lesi Iskole Customercare
        </h1>

      

        {/* Subheading */}
        <p className="text-lg md:text-xl font-semibold mb-8"
           style={{ color: "#1F31F9" }}>
          Admin Panel
        </p>

        {/* Action buttons (one row) */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/data/department"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-sm transition
                       focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: "#1F31F9", color: "#ffffff" }}
          >
            Add Data
          </Link>

          <Link
            to="/complains"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-sm transition
                       focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: "#1F31F9", color: "#ffffff" }}
          >
            Complains
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
