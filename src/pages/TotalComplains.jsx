// src/pages/TotalComplaintsPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiGet } from "../api/api.js";
import FilterBox from "../compoments/FilterBox.jsx";
import FullComplainTable from "../compoments/FullComplainTable.jsx";

const COLORS = ["#EF4444", "#FACC15", "#22C55E", "#3B82F6", "#A855F7"];

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const TotalComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  const [chartData, setChartData] = useState([]);
  const [chartTotal, setChartTotal] = useState(0);
  const [chartLabel, setChartLabel] = useState("");
  const [groupBy, setGroupBy] = useState("status"); // status | problem | subProblem

  // 🔧 Build chart data from complaints (frontend only)
  const buildChartFromComplaints = (list, groupByKey) => {
    const counts = {};

    list.forEach((c) => {
      let key = "Unknown";

      if (groupByKey === "status") {
        key = c.status || "Unknown";
      } else if (groupByKey === "problem") {
        key = c.mainProblem?.name || "Unknown Problem";
      } else if (groupByKey === "subProblem") {
        key = c.subProblem?.name || "Unknown Subproblem";
      }

      if (!counts[key]) counts[key] = 0;
      counts[key] += 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      data,
      total: list.length,
    };
  };

  // 🔄 Helper to recalc chart state
  const recalcChart = (list, groupByKey, labelText) => {
    const { data, total } = buildChartFromComplaints(list, groupByKey);
    setChartData(data);
    setChartTotal(total);
    if (labelText !== undefined) {
      setChartLabel(labelText);
    }
  };

  // 🔹 Load TODAY data on page load
  useEffect(() => {
    loadTodayDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔁 Rebuild chart whenever complaints OR groupBy changes
  useEffect(() => {
    recalcChart(complaints, groupBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaints, groupBy]);

  // 🔹 Common helper: build URLSearchParams from filter object
  const buildParamsFromFilters = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.problem) params.append("mainProblem", filters.problem);
    if (filters.subProblem) params.append("subProblem", filters.subProblem);
    if (filters.agent) params.append("agent", filters.agent);
    if (filters.department) params.append("department", filters.department);
    if (filters.responsibleBy)
      params.append("responsiblePerson", filters.responsibleBy);

    let from = filters.fromDate || "";
    let to = filters.toDate || "";

    // ⚠️ If no date range is given, default to TODAY
    if (!from && !to) {
      const today = getTodayString();
      from = today;
      to = today;
    }

    if (from) params.append("fromDate", from);
    if (to) params.append("toDate", to);

    return { params, from, to };
  };

  // 🔹 Load TODAY (used on mount + reset)
  const loadTodayDefault = async () => {
    try {
      const today = getTodayString();
      const params = new URLSearchParams();
      params.append("fromDate", today);
      params.append("toDate", today);

      // Table data ONLY – chart is built from this list
      const listRes = await apiGet(`/complaints/filter?${params.toString()}`);
      const list = listRes.complaints || [];

      setComplaints(list);
      setResultCount(listRes.count || list.length || 0);

      const label = `Today (${today})`;
      recalcChart(list, groupBy, label);
    } catch (err) {
      console.error("loadTodayDefault error:", err);
      setComplaints([]);
      setResultCount(0);
      setChartData([]);
      setChartTotal(0);
      setChartLabel("Today");
    }
  };

  // 🔎 When filters applied from FilterBox
  const handleFilterSearch = async (filters) => {
    try {
      const { params, from, to } = buildParamsFromFilters(filters);
      const qs = params.toString();

      // Table data
      const listRes = await apiGet(`/complaints/filter?${qs}`);
      const list = listRes.complaints || [];

      setComplaints(list);
      setResultCount(listRes.count || list.length || 0);

      // Build label based on date range
      let label = "Filtered";
      if (from && to && from === to) {
        label = `Date: ${from}`;
      } else if (from && to) {
        label = `From ${from} to ${to}`;
      }

      recalcChart(list, groupBy, label);
    } catch (err) {
      console.error("handleFilterSearch error:", err);
    }
  };

  // 🔄 Reset → show TODAY again
  const handleFilterReset = async () => {
    await loadTodayDefault();
  };

  return (
    <div className="relative w-full bg-white">
      {/* 🔴 Red Home Icon - top-left corner */}
      <Link
        to="/home"
        aria-label="Go to Home"
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100"
        title="Home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-red-600"
        >
          <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-.91-.91V19a2.25 2.25 0 0 1-2.25 2.25H7a2.25 2.25 0 0 1-2.25-2.25v-6.32l-.91.91a.75.75 0 1 1-1.06-1.06l8.69-8.69zM9.25 19h5.5v-5.25a.75.75 0 0 0-.75-.75h-4a.75.75 0 0 0-.75.75V19z" />
        </svg>
      </Link>

      {/* Main content (title + pie) */}
      <div className="max-w-5xl mx-auto pt-5 px-4 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-2xl font-bold text-[#1F31F9]">
            Complaints Page
          </h1>

          {/* 🔴 Group By selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-700 font-medium">Group Pie By:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="status">Status</option>
              <option value="problem">Problem</option>
              <option value="subProblem">Subproblem</option>
            </select>
          </div>
        </div>

        {/* Card: Pie chart + Status / or NO DATA message */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 min-h-[220px]">
          {chartTotal === 0 ? (
            // 🔴 BIG TEXT when no complaints
            <div className="w-full h-full flex items-center justify-center py-10">
              <p className="text-xl md:text-2xl font-bold text-gray-400 text-center uppercase tracking-wide">
                NO COMPLAINTS FOUND FOR THIS SELECTION
              </p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pie Chart */}
              <div className="w-full md:w-1/2 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="w-full md:w-1/2 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Complaints Summary</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartTotal}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {chartLabel}
                  </p>
                </div>

                <div className="space-y-2">
                  {chartData.map((item, index) => {
                    const percentage =
                      chartTotal > 0
                        ? ((item.value / chartTotal) * 100).toFixed(1)
                        : 0;
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between border rounded-lg px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-xs font-medium text-gray-800">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-700 font-semibold">
                            {item.value}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Filter box (centered) */}
      <FilterBox
        onSearch={handleFilterSearch}
        onReset={handleFilterReset}
        resultCount={resultCount}
      />

      {/* 🔹 FULL-WIDTH TABLE */}
      <div className="w-full pb-8 px-4">
        <FullComplainTable complaints={complaints} />
      </div>
    </div>
  );
};

export default TotalComplaintsPage;
