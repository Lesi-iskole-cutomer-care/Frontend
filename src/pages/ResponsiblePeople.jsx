// pages/ResponsiblePeople.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import deleteIcon from "../assets/delete.png";
import updateIcon from "../assets/edit.png";

import {
  fetchResponsiblePeople,
  createResponsiblePerson,
  updateResponsiblePerson,
  deleteResponsiblePerson,
} from "../api/features/responsiblePersonSlice.js";

import { fetchDepartments } from "../api/features/DepartmentSlice.js";

const Responsiblepeople = () => {
  const dispatch = useDispatch();

  // 🔹 Responsible people slice
  const { list, status, error } = useSelector(
    (state) => state.responsiblePeople
  );

  const responsiblePeople = Array.isArray(list) ? list : [];

  // 🔹 Departments slice
  const deptListRaw = useSelector((state) => state.departments.list);
  const deptStatus = useSelector((state) => state.departments.status);

  const departments = Array.isArray(deptListRaw)
    ? deptListRaw
    : Array.isArray(deptListRaw?.departments)
    ? deptListRaw.departments
    : [];

  // Fetch on first load
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchResponsiblePeople());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (deptStatus === "idle") {
      dispatch(fetchDepartments());
    }
  }, [deptStatus, dispatch]);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [activeId, setActiveId] = useState(null);
  const [personNameInput, setPersonNameInput] = useState("");
  const [deptSelectInput, setDeptSelectInput] = useState(""); // will hold department _id

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleOpenAdd = () => {
    setModalMode("add");
    setActiveId(null);
    setPersonNameInput("");
    setDeptSelectInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person) => {
    setModalMode("edit");
    setActiveId(person._id || person.id);
    setPersonNameInput(person.name || "");

    // person.department may be:
    // - populated object { _id, name }
    // - just ObjectId string
    const depId =
      person.department && typeof person.department === "object"
        ? person.department._id
        : person.department || "";

    setDeptSelectInput(depId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveId(null);
    setPersonNameInput("");
    setDeptSelectInput("");
  };

  // 🔹 Save (Add / Edit) using API
  const handleSave = async () => {
    if (!personNameInput.trim()) {
      alert("Please enter a responsible person's name");
      return;
    }
    if (!deptSelectInput) {
      alert("Please select a department");
      return;
    }

    const payload = {
      name: personNameInput.trim(),
      department: deptSelectInput, // ✅ send ObjectId
    };

    try {
      if (modalMode === "add") {
        const result = await dispatch(createResponsiblePerson(payload));
        if (!createResponsiblePerson.fulfilled.match(result)) {
          alert(result.payload || "Failed to create responsible person");
          return;
        }
      } else if (modalMode === "edit" && activeId) {
        const result = await dispatch(
          updateResponsiblePerson({ id: activeId, payload })
        );
        if (!updateResponsiblePerson.fulfilled.match(result)) {
          alert(result.payload || "Failed to update responsible person");
          return;
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // 🔹 Delete handlers (modal-based)
  const handleOpenDelete = (person) => {
    setSelectedPerson(person);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedPerson(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPerson) return;
    const id = selectedPerson._id || selectedPerson.id;

    try {
      const result = await dispatch(deleteResponsiblePerson(id));
      if (!deleteResponsiblePerson.fulfilled.match(result)) {
        alert(result.payload || "Failed to delete responsible person");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    handleCloseDelete();
  };

  // Helper to show department name in table
  const getDepartmentName = (person) => {
    if (!person.department) return "-";

    if (typeof person.department === "object") {
      return person.department.name || "-";
    }

    // If department is just an id string, try to find in departments list
    const dep = departments.find((d) => d._id === person.department);
    return dep ? dep.name : "-";
  };

  return (
    <div className="relative w-full">
      {/* Home icon */}
      <Link
        to="/home"
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
        <h1 className="text-2xl font-bold text-[#1F31F9] mb-4">
          Responsible People
        </h1>

        {/* Add button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-[#1F31F9] text-white text-sm font-semibold hover:bg-[#141fb0] transition"
          >
            + Add
          </button>
        </div>

        {/* Status / Error */}
        {status === "loading" && (
          <p className="text-sm text-gray-500 mb-2">
            Loading responsible people...
          </p>
        )}
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-400 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b border-gray-400">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Responsible Person
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-400">
                  Department
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                  Operation
                </th>
              </tr>
            </thead>

            <tbody>
              {responsiblePeople.length > 0 ? (
                responsiblePeople.map((person, index) => (
                  <tr
                    key={person._id || person.id || index}
                    className="hover:bg-gray-50 border-t border-gray-300"
                  >
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {index + 1}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {person.name}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-300">
                      {getDepartmentName(person)}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div className="flex items-center justify-center gap-4">
                        {/* Update Icon */}
                        <button
                          type="button"
                          title="Update"
                          className="hover:opacity-80"
                          onClick={() => handleOpenEdit(person)}
                        >
                          <img
                            src={updateIcon}
                            alt="Update"
                            className="w-6 h-6 object-contain"
                          />
                        </button>

                        {/* Delete Icon */}
                        <button
                          type="button"
                          title="Delete"
                          className="hover:opacity-80"
                          onClick={() => handleOpenDelete(person)}
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
                      colSpan={4}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      No responsible people found.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {modalMode === "add"
                ? "Add Responsible Person"
                : "Update Responsible Person"}
            </h2>

            {/* Responsible Person Name */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="respName"
              >
                Responsible Person
              </label>
              <input
                id="respName"
                type="text"
                value={personNameInput}
                onChange={(e) => setPersonNameInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9]"
                placeholder="e.g. Charith Sir"
              />
            </div>

            {/* Department Select */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="deptSelect"
              >
                Department
              </label>
              <select
                id="deptSelect"
                value={deptSelectInput}
                onChange={(e) => setDeptSelectInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9]"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id || dept.id} value={dept._id || dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-lg bg-[#1F31F9] text-white font-semibold hover:bg-[#141fb0] transition"
              >
                {modalMode === "add" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Delete Confirmation Modal */}
      {isDeleteOpen && selectedPerson && (
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
                  Delete Responsible Person
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedPerson.name}</span>{" "}
                  from the responsible people list?
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

export default Responsiblepeople;
