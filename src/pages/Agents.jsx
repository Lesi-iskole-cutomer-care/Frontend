// pages/Agents.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import deleteIcon from "../assets/delete.png";

import {
  fetchAgents,
  deleteAgent,
  fetchAgentsPointsSummary,
} from "../api/features/agentSlice.js";

const Agents = () => {
  const dispatch = useDispatch();

  const { list, status, error, pointsList, pointsStatus, pointsError, pointsMonthKey } =
    useSelector((state) => state.agents);

  const agents = Array.isArray(list) ? list : [];
  const points = Array.isArray(pointsList) ? pointsList : [];

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Load agents + points on first render
  useEffect(() => {
    if (status === "idle") dispatch(fetchAgents());
    if (pointsStatus === "idle") dispatch(fetchAgentsPointsSummary());
  }, [status, pointsStatus, dispatch]);

  // Build map: agentId -> pointsRow
  const pointsMap = useMemo(() => {
    const m = new Map();
    points.forEach((row) => {
      if (row?.agentId) m.set(String(row.agentId), row);
    });
    return m;
  }, [points]);

  // merged agents with points
  const rows = useMemo(() => {
    return agents.map((a) => {
      const id = String(a._id || a.id || "");
      const p = pointsMap.get(id);

      return {
        ...a,
        _agentId: id,
        totalPointsAllTime: p?.totalPointsAllTime ?? 0,
        monthPoints: p?.monthPoints ?? 0,
        monthTransitions: p?.monthTransitions ?? 0,
        monthAvgMinutes: p?.monthAvgMinutes ?? 0,
      };
    });
  }, [agents, pointsMap]);

  const handleOpenDelete = (agent) => {
    setSelectedAgent(agent);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedAgent(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgent) return;
    const id = selectedAgent._id || selectedAgent.id;

    try {
      const result = await dispatch(deleteAgent(id));
      if (!deleteAgent.fulfilled.match(result)) {
        alert(result.payload || "Failed to delete agent");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    handleCloseDelete();
  };

  return (
    <div className="relative w-full">
      {/* Home icon */}
      <Link
        to="/"
        aria-label="Go to Home"
        className="absolute -top-10 right-3 p-2 rounded-full hover:bg-gray-100"
        title="Home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-red-600"
        >
          <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-.91-.91V19a2.25 2.25 0 0 1-2.25 2.25H7a2.25 2.25 0 0 1-2.25-2.25v-6.32l-.91.91a.75.75 0 1 1-1.06-1.06l8.69-8.69zM9.25 19h5.5v-5.25a.75.75 0 0 0-.75-.75h-4a.75.75 0 0 0-.75.75V19z" />
        </svg>
      </Link>

      {/* Card content */}
      <div className="bg-white rounded-2xl p-6 shadow mt-6">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F31F9]">Agents</h1>
            <p className="text-xs text-gray-500 mt-1">
              Points Month: <span className="font-semibold">{pointsMonthKey || "current"}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(fetchAgentsPointsSummary())}
            className="px-3 py-2 text-xs md:text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Refresh Points
          </button>
        </div>

        {/* Status / error */}
        {status === "loading" && (
          <p className="text-sm text-gray-500 mb-2">Loading agents...</p>
        )}
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        {pointsStatus === "loading" && (
          <p className="text-sm text-gray-500 mb-2">Loading points...</p>
        )}
        {pointsError && <p className="text-sm text-red-500 mb-2">{pointsError}</p>}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-400 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b border-gray-400">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Agent Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Role
                </th>

                {/* ✅ NEW columns */}
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 border-r border-gray-400">
                  This Month Points
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Total Points
                </th>

                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                  Operation
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((agent, index) => (
                  <tr
                    key={agent._id || agent.id || index}
                    className="hover:bg-gray-50 border-t border-gray-300"
                  >
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {index + 1}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {agent.name}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {agent.phonenumber}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {agent.role}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300 text-right">
                      {Number(agent.monthPoints || 0).toFixed(2)}
                      <div className="text-[10px] text-gray-500">
                        {agent.monthTransitions || 0} informed • avg {agent.monthAvgMinutes || 0}m
                      </div>
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300 text-right">
                      {Number(agent.totalPointsAllTime || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          title="Delete"
                          className="hover:opacity-80"
                          onClick={() => handleOpenDelete(agent)}
                        >
                          <img
                            src={deleteIcon}
                            alt="Delete"
                            className="w-6 h-6 object-contain"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                status === "succeeded" && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      No agents found.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Delete Confirmation Modal */}
      {isDeleteOpen && selectedAgent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13h6m-7 7h8a2 2 0 0 0 1.994-1.837L19 18V8a2 2 0 0 0-1.837-1.995L17 6h-1l-.447-1.342A2 2 0 0 0 13.668 3H10.33a2 2 0 0 0-1.885 1.316L8 6H7a2 2 0 0 0-1.995 1.85L5 8v10a2 2 0 0 0 1.85 1.995L7 20z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Delete Agent
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedAgent.name}</span> from the agents list?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={handleCloseDelete}
                className="px-4 py-2 text-xs md:text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs md:text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
