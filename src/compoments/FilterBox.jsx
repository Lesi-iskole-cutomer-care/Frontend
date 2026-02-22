// src/compoments/FilterBox.jsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../api/api.js";

const FilterBox = ({ onSearch, onReset, resultCount = 0 }) => {
  const [filters, setFilters] = useState({
    status: "",
    problem: "",
    subProblem: "",
    agent: "",          // ✅ will store AGENT _id
    department: "",
    responsibleBy: "",  // ✅ will store ResponsiblePerson _id
    fromDate: "",
    toDate: "",
  });

  const [statusList, setStatusList] = useState([]);
  const [mainProblems, setMainProblems] = useState([]);
  const [subProblems, setSubProblems] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [responsiblePeople, setResponsiblePeople] = useState([]);

  // 🔹 Initial dropdown data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [mpRes, deptRes, agentRes, statusRes] = await Promise.all([
          apiGet("/mainproblems"),
          apiGet("/departments"),
          apiGet("/user/agents"),
          apiGet("/complaints/available-status"),
        ]);

        setMainProblems(mpRes.mainProblems || []);
        setDepartments(deptRes.departments || []);
        setAgents(agentRes.agents || agentRes || []);
        setStatusList(statusRes.statuses || []);
      } catch (err) {
        console.error("Initial data load error:", err);
      }
    };

    loadInitialData();
  }, []);

  // 🔁 When Problem changes → load only related subproblems
  const loadSubProblems = async (mainProblemId) => {
    try {
      if (!mainProblemId) {
        setSubProblems([]);
        return;
      }
      const res = await apiGet(`/subproblems/by-main/${mainProblemId}`);
      setSubProblems(res.subProblems || []);
    } catch (err) {
      console.error("loadSubProblems error:", err);
      setSubProblems([]);
    }
  };

  // 🔁 When Department changes → load only related responsible people
  const loadResponsiblePeople = async (departmentId) => {
    try {
      if (!departmentId) {
        setResponsiblePeople([]);
        return;
      }
      const res = await apiGet(
        `/responsiblepeople/by-department/${departmentId}`
      );
      setResponsiblePeople(res || []);
    } catch (err) {
      console.error("loadResponsiblePeople error:", err);
      setResponsiblePeople([]);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value };

    if (field === "problem") {
      loadSubProblems(value);
      updated.subProblem = "";
    }

    if (field === "department") {
      loadResponsiblePeople(value);
      updated.responsibleBy = "";
    }

    setFilters(updated);
  };

  // 🔎 SEARCH – send filters to parent
  const handleSearchClick = () => {
    if (onSearch) onSearch(filters);
  };

  // 🔄 RESET – clear UI + tell parent to reload today
  const handleResetClick = () => {
    const cleared = {
      status: "",
      problem: "",
      subProblem: "",
      agent: "",
      department: "",
      responsibleBy: "",
      fromDate: "",
      toDate: "",
    };
    setFilters(cleared);
    setSubProblems([]);
    setResponsiblePeople([]);

    if (onReset) onReset();
  };

  // 🔹 Build <option> arrays WITHOUT .map() in JSX
  const statusOptionsEls = [];
  statusList.forEach((s) => {
    statusOptionsEls.push(
      <option key={s} value={s}>
        {s}
      </option>
    );
  });

  const mainProblemOptionsEls = [];
  mainProblems.forEach((mp) => {
    mainProblemOptionsEls.push(
      <option key={mp._id} value={mp._id}>
        {mp.name}
      </option>
    );
  });

  const subProblemOptionsEls = [];
  subProblems.forEach((sp) => {
    subProblemOptionsEls.push(
      <option key={sp._id} value={sp._id}>
        {sp.name}
      </option>
    );
  });

  const agentOptionsEls = [];
  agents.forEach((ag) => {
    // ✅ IMPORTANT: value is _id, NOT name
    agentOptionsEls.push(
      <option key={ag._id} value={ag._id}>
        {ag.name}
      </option>
    );
  });

  const departmentOptionsEls = [];
  departments.forEach((d) => {
    departmentOptionsEls.push(
      <option key={d._id} value={d._id}>
        {d.name}
      </option>
    );
  });

  const responsibleByOptionsEls = [];
  responsiblePeople.forEach((rp) => {
    responsibleByOptionsEls.push(
      <option key={rp._id} value={rp._id}>
        {rp.name}
      </option>
    );
  });

  const labelClass = "text-sm text-gray-700 mb-1 font-bold";
  const labelStyle = { fontFamily: '"Inria Serif", serif' };

  return (
    <div className="flex flex-col items-center w-full">
      {/* 🔷 FILTER BOX */}
      <div className="w-full md:w-[90%] lg:w-[80%] bg-[#E5F4FF] rounded-3xl px-6 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* LEFT SIDE */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Status
              </span>
              <select
                value={filters.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {statusOptionsEls}
              </select>
            </div>

            {/* Problem */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Problem
              </span>
              <select
                value={filters.problem}
                onChange={(e) => handleChange("problem", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {mainProblemOptionsEls}
              </select>
            </div>

            {/* Subproblem */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Subproblem
              </span>
              <select
                value={filters.subProblem}
                onChange={(e) => handleChange("subProblem", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {subProblemOptionsEls}
              </select>
            </div>

            {/* Agent */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Agent
              </span>
              <select
                value={filters.agent}
                onChange={(e) => handleChange("agent", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {agentOptionsEls}
              </select>
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Department
              </span>
              <select
                value={filters.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {departmentOptionsEls}
              </select>
            </div>

            {/* Responsible By */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                Responsible By
              </span>
              <select
                value={filters.responsibleBy}
                onChange={(e) =>
                  handleChange("responsibleBy", e.target.value)
                }
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {responsibleByOptionsEls}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                From Date
              </span>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleChange("fromDate", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <span className={labelClass} style={labelStyle}>
                To Date
              </span>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleChange("toDate", e.target.value)}
                className="w-full rounded-md bg-[#E4E1E1] px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex flex-col justify-center gap-3 md:w-32">
            <button
              onClick={handleSearchClick}
              className="w-full rounded-full bg-[#1F31F9] text-white font-semibold italic text-lg py-2"
            >
              Search
            </button>
            <button
              onClick={handleResetClick}
              className="w-full rounded-full bg-[#E3342F] text-white font-semibold italic text-lg py-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}
      <div className="w-full md:w-[90%] lg:w-[80%] mt-2 mb-4">
        <p className="text-sm text-gray-700" style={labelStyle}>
          Complaints Count : <span className="font-bold">{resultCount}</span>
        </p>
      </div>
    </div>
  );
};

export default FilterBox;
