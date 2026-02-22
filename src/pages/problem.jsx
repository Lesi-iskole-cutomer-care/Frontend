// pages/Problem.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import addIcon from "../assets/add.png";
import deleteIcon from "../assets/delete.png";
import updateIcon from "../assets/edit.png";

import {
  fetchMainProblems,
  createMainProblem,
  deleteMainProblem,
} from "../api/features/mainProblemSlice.js";

import {
  fetchSubProblems,
  createSubProblem,
  updateSubProblem,
  deleteSubProblem,
} from "../api/features/subProblemSlice.js";

const Problem = () => {
  const dispatch = useDispatch();

  const {
    list: mainProblems,
    status: mainStatus,
    error: mainError,
  } = useSelector((state) => state.mainProblems);

  const {
    list: subProblems,
    status: subStatus,
    error: subError,
  } = useSelector((state) => state.subProblems);

  // 🔹 Build { mainProblem, subProblems[] } for UI
  const problems = (mainProblems || []).map((mp) => {
    const mpId = mp._id || mp.id;
    const relatedSubs = (subProblems || []).filter((sp) => {
      const spMpId =
        sp.mainProblem?._id || sp.mainProblem || sp.mainProblemId;
      return spMpId === mpId;
    });

    return {
      mainProblem: mp,
      subProblems: relatedSubs,
    };
  });

  // ---------- Load data on mount ----------
  useEffect(() => {
    if (mainStatus === "idle") {
      dispatch(fetchMainProblems());
    }
    if (subStatus === "idle") {
      dispatch(fetchSubProblems());
    }
  }, [dispatch, mainStatus, subStatus]);

  // ---------- Helpers ----------
  const parseSubProblems = (text) => {
    return text
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };

  // ---------- Add Problem modal ----------
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [problemNameInput, setProblemNameInput] = useState("");
  const [subProblemsInput, setSubProblemsInput] = useState("");

  const openAddProblem = () => {
    setProblemNameInput("");
    setSubProblemsInput("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setProblemNameInput("");
    setSubProblemsInput("");
  };

  const saveNewProblem = async () => {
    if (!problemNameInput.trim()) {
      alert("Please enter a problem name");
      return;
    }

    const parsedSubs = parseSubProblems(subProblemsInput);

    try {
      // 1) Create main problem
      const result = await dispatch(
        createMainProblem({ name: problemNameInput.trim() })
      );

      if (!createMainProblem.fulfilled.match(result)) {
        alert(result.payload || "Failed to create main problem");
        return;
      }

      const newMain =
        result.payload.mainProblem ||
        result.payload.data ||
        result.payload;

      // 2) Create sub problems (if any)
      if (parsedSubs.length > 0) {
        await Promise.all(
          parsedSubs.map((subName) =>
            dispatch(
              createSubProblem({
                mainProblemId: newMain._id || newMain.id,
                name: subName,
              })
            )
          )
        );
      }

      // Refresh subProblems list to keep UI in sync
      await dispatch(fetchSubProblems());

      closeAddModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating problem");
    }
  };

  // ---------- Add Sub Problem modal ----------
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subModalMainProblem, setSubModalMainProblem] = useState(null);
  const [subProblemInput, setSubProblemInput] = useState("");

  const openSubModal = (problemItem) => {
    setSubModalMainProblem(problemItem.mainProblem);
    setSubProblemInput("");
    setIsSubModalOpen(true);
  };

  const closeSubModal = () => {
    setIsSubModalOpen(false);
    setSubModalMainProblem(null);
    setSubProblemInput("");
  };

  const saveSubProblem = async () => {
    if (!subProblemInput.trim()) {
      alert("Please enter a sub problem");
      return;
    }

    const mp = subModalMainProblem;
    if (!mp) return;

    const mpId = mp._id || mp.id;

    try {
      const result = await dispatch(
        createSubProblem({
          mainProblemId: mpId,
          name: subProblemInput.trim(),
        })
      );

      if (!createSubProblem.fulfilled.match(result)) {
        alert(result.payload || "Failed to create sub problem");
        return;
      }

      await dispatch(fetchSubProblems());
      closeSubModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating sub problem");
    }
  };

  // ---------- Edit Problem (sub problems only) ----------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMainProblem, setEditMainProblem] = useState(null);
  const [editSubList, setEditSubList] = useState([]); // [{ _id|null, name }]

  const openEditModal = (problemItem) => {
    setEditMainProblem(problemItem.mainProblem);
    setEditSubList(
      (problemItem.subProblems || []).map((sp) => ({
        _id: sp._id || sp.id,
        name: sp.name,
      }))
    );
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditMainProblem(null);
    setEditSubList([]);
  };

  const handleEditSubChange = (index, value) => {
    setEditSubList((prev) =>
      prev.map((sp, i) => (i === index ? { ...sp, name: value } : sp))
    );
  };

  // ✅ Remove a subProblem row (and delete from DB if existing)
  const handleRemoveSubRow = async (index, sp) => {
    try {
      if (sp._id) {
        const result = await dispatch(deleteSubProblem(sp._id));
        if (!deleteSubProblem.fulfilled.match(result)) {
          alert(result.payload || "Failed to delete sub problem");
          return;
        }
      }
      setEditSubList((prev) => prev.filter((_, i) => i !== index));
      await dispatch(fetchSubProblems());
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting sub problem");
    }
  };

  // ✅ Add a blank new subProblem line in edit modal
  const addNewSubRow = () => {
    setEditSubList((prev) => [...prev, { _id: null, name: "" }]);
  };

  const saveEditedSubProblems = async () => {
    if (!editMainProblem) return;

    const mainProblemId = editMainProblem._id || editMainProblem.id;

    try {
      await Promise.all(
        editSubList.map((sp) => {
          const trimmed = (sp.name || "").trim();
          if (!trimmed) return null;

          // existing subProblem -> update
          if (sp._id) {
            return dispatch(
              updateSubProblem({
                id: sp._id,
                payload: { name: trimmed },
              })
            );
          }

          // new subProblem -> create
          return dispatch(
            createSubProblem({
              mainProblemId,
              name: trimmed,
            })
          );
        }).filter(Boolean)
      );

      await dispatch(fetchSubProblems());
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating sub problems");
    }
  };

  // ---------- Delete Problem (and all its sub problems) ----------
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const openDeleteModal = (problemItem) => {
    setSelectedProblem(problemItem);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedProblem(null);
  };

  const confirmDeleteProblem = async () => {
    if (!selectedProblem) return;

    const mp = selectedProblem.mainProblem;
    const id = mp._id || mp.id;

    try {
      const result = await dispatch(deleteMainProblem(id));
      if (!deleteMainProblem.fulfilled.match(result)) {
        alert(result.payload || "Failed to delete problem");
        return;
      }

      await Promise.all([
        dispatch(fetchMainProblems()),
        dispatch(fetchSubProblems()),
      ]);

      closeDeleteModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting problem");
    }
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#1F31F9]">Problem</h1>

          {/* Add Problem button */}
          <button
            type="button"
            onClick={openAddProblem}
            className="px-4 py-2 rounded-lg bg-[#1F31F9] text-white text-sm font-semibold hover:bg-[#141fb0] transition"
          >
            + Add Problem
          </button>
        </div>

        {/* Status / Error */}
        {(mainStatus === "loading" || subStatus === "loading") && (
          <p className="text-sm text-gray-500 mb-2">
            Loading problems and sub problems...
          </p>
        )}
        {(mainError || subError) && (
          <p className="text-sm text-red-500 mb-2">
            {mainError || subError}
          </p>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Problem
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Sub Problems
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                  Operation
                </th>
              </tr>
            </thead>

            <tbody>
              {problems.length > 0 ? (
                problems.map((item, index) => (
                  <tr
                    key={item.mainProblem._id || item.mainProblem.id || index}
                    className="hover:bg-gray-50 border-t border-gray-200"
                  >
                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {index + 1}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      {item.mainProblem.name}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {item.subProblems && item.subProblems.length > 0 ? (
                          item.subProblems.map((sub) => (
                            <span
                              key={sub._id || sub.id}
                              className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700"
                            >
                              {sub.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">
                            No sub problems
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div className="flex items-center justify-center gap-4">
                        {/* Add Sub Problem */}
                        <button
                          type="button"
                          title="Add Sub Problem"
                          className="hover:opacity-80"
                          onClick={() => openSubModal(item)}
                        >
                          <img
                            src={addIcon}
                            alt="Add"
                            className="w-5 h-5 object-contain"
                          />
                        </button>

                        {/* Update (edit sub problems only) */}
                        <button
                          type="button"
                          title="Update Sub Problems"
                          className="hover:opacity-80"
                          onClick={() => openEditModal(item)}
                        >
                          <img
                            src={updateIcon}
                            alt="Update"
                            className="w-5 h-5 object-contain"
                          />
                        </button>

                        {/* Delete main + all sub problems */}
                        <button
                          type="button"
                          title="Delete Problem"
                          className="hover:opacity-80"
                          onClick={() => openDeleteModal(item)}
                        >
                          <img
                            src={deleteIcon}
                            alt="Delete"
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                mainStatus === "succeeded" &&
                subStatus === "succeeded" && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      No problems found.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Add Problem Modal (main + initial sub problems) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Add Problem
            </h2>

            <div className="mb-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="problemName"
              >
                Problem Name
              </label>
              <input
                id="problemName"
                type="text"
                value={problemNameInput}
                onChange={(e) => setProblemNameInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9]"
                placeholder="e.g. Delivery Issue"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="subProblems"
              >
                Sub Problems
                <span className="text-xs text-gray-500 ml-1">
                  (comma or new line separated, optional)
                </span>
              </label>
              <textarea
                id="subProblems"
                rows={3}
                value={subProblemsInput}
                onChange={(e) => setSubProblemsInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9] resize-none"
                placeholder={"Courier Late, Address Not Clear, Weather Delay"}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNewProblem}
                className="px-4 py-2 text-sm rounded-lg bg-[#1F31F9] text-white font-semibold hover:bg-[#141fb0] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Add Sub Problem Modal */}
      {isSubModalOpen && subModalMainProblem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Add Sub Problem
            </h2>
            <p className="text-xs text-gray-600 mb-3">
              Main Problem:{" "}
              <span className="font-semibold">
                {subModalMainProblem.name}
              </span>
            </p>

            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="subProblemInput"
              >
                Sub Problem
              </label>
              <input
                id="subProblemInput"
                type="text"
                value={subProblemInput}
                onChange={(e) => setSubProblemInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9]"
                placeholder="e.g. Courier Delay"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeSubModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSubProblem}
                className="px-4 py-2 text-sm rounded-lg bg-[#1F31F9] text-white font-semibold hover:bg-[#141fb0] transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Edit Sub Problems Modal (main name read-only) */}
      {isEditModalOpen && editMainProblem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Update Sub Problems
            </h2>

            {/* Main Problem (read only) */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Problem
              </label>
              <input
                type="text"
                value={editMainProblem.name}
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
              />
            </div>

            {/* Editable sub problems */}
            <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
              {editSubList.length > 0 ? (
                editSubList.map((sp, index) => (
                  <div key={sp._id || index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Sub Problem {index + 1}
                      </label>
                      <input
                        type="text"
                        value={sp.name}
                        onChange={(e) =>
                          handleEditSubChange(index, e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1F31F9] focus:border-[#1F31F9]"
                      />
                    </div>

                    {/* Delete this subProblem */}
                    <button
                      type="button"
                      title="Delete this sub problem"
                      onClick={() => handleRemoveSubRow(index, sp)}
                      className="mt-5 p-2 rounded-full bg-red-50 hover:bg-red-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-red-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 13h6m-7 7h8a2 2 0 0 0 1.994-1.837L19 18V8a2 2 0 0 0-1.837-1.995L17 6h-1l-.447-1.342A2 2 0 0 0 13.668 3H10.33a2 2 0 0 0-1.885 1.316L8 6H7a2 2 0 0 0-1.995 1.85L5 8v10a2 2 0 0 0 1.85 1.995L7 20z"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">
                  No sub problems. Use the button below to add new ones.
                </p>
              )}
            </div>

            {/* Add new subProblem row */}
            <button
              type="button"
              onClick={addNewSubRow}
              className="mb-4 inline-flex items-center px-3 py-1.5 rounded-lg border border-dashed border-[#1F31F9] text-xs text-[#1F31F9] hover:bg-blue-50"
            >
              + Add New Sub Problem
            </button>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedSubProblems}
                className="px-4 py-2 text-sm rounded-lg bg-[#1F31F9] text-white font-semibold hover:bg-[#141fb0] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Delete Problem Confirmation Modal */}
      {isDeleteOpen && selectedProblem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
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
                  Delete Problem
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedProblem.mainProblem.name}
                  </span>{" "}
                  and all its sub problems?
                </p>
              </div>
            </div>

            {selectedProblem.subProblems &&
              selectedProblem.subProblems.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Sub Problems:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.subProblems.map((sub) => (
                      <span
                        key={sub._id || sub.id}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-[11px] text-gray-700"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <p className="text-xs text-red-500 mb-4">
              This action cannot be undone. Please confirm before deleting.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 text-xs md:text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProblem}
                className="px-4 py-2 text-xs md:text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Delete Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Problem;
