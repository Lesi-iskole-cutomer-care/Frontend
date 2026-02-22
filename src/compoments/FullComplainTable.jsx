// src/compoments/FullComplainTable.jsx
import React from "react";

const FullComplainTable = ({ complaints = [] }) => {
  return (
    <div className="w-full">
      {/* Card with padding around table */}
      <div className="bg-white rounded-2xl p-6 shadow mt-6">
        <div className="overflow-x-auto">
          {/* Table with full border frame */}
          <table className="w-full text-xs border border-gray-400 border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  #
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Invoice
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Customer
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Problem
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Sub Problem
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Time
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Agent
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Responsible Dept.
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Responsible By
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-400">
                  Description
                </th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.InvoiceNumber}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.CustomerName || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.mainProblem?.name || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.subProblem?.name || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.createdDate || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.createdTime || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.createdBy?.name || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.ResponsibleDepartment?.name || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.responsiblePerson?.name || "-"}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300">
                    {item.status}
                  </td>

                  <td className="px-3 py-2 text-gray-800 border border-gray-300 max-w-xs">
                    <span className="line-clamp-2">{item.description}</span>
                  </td>
                </tr>
              ))}

              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-4 text-center text-sm text-gray-500 border border-gray-300"
                  >
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FullComplainTable;
