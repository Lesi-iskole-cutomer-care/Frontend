import React from "react";
import { NavLink } from "react-router-dom";
import lesiiskole_logo from "../assets/lesiiskole_logo.png";

const linkBase =
  "block text-center w-full px-4 py-3 rounded-xl font-semibold transition";
const active =
  "bg-[#1F31F9] text-white shadow";
const idle =
  "text-gray-800 hover:bg-gray-100";

const VerticalNavBar = () => {
  return (
    <div className="h-full w-full bg-white/90 border-r border-gray-200 flex flex-col">
      {/* Logo area */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-center">
        <img
          src={lesiiskole_logo}
          alt="Lesi Iskole"
          className="w-28 h-auto object-contain"
        />
      </div>

      {/* ✅ Nav items (centered vertically & horizontally) */}
      <nav className="flex-1 flex flex-col items-center justify-center px-4 space-y-3">
        <NavLink
          to="/data/department"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : idle}`
          }
        >
          Department
        </NavLink>

        <NavLink
          to="/data/responsible"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : idle}`
          }
        >
          Responsible People
        </NavLink>

        <NavLink
          to="/data/agents"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : idle}`
          }
        >
          Agents
        </NavLink>

        <NavLink
          to="/data/problem"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : idle}`
          }
        >
          Problem
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} Lesi Iskole
      </div>
    </div>
  );
};

export default VerticalNavBar;
