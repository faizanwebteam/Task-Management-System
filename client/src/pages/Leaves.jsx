import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Leaves() {
  const { user, token } = useContext(AuthContext);
  const isHR = user?.role === "hr";

  const [leaves, setLeaves] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: "",
    status: "Pending",
  });

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok || res.status === 200) setLeaves(data);
      else console.error("Failed to fetch leaves:", data.message);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({
          employeeName: "",
          leaveType: "Sick Leave",
          startDate: "",
          endDate: "",
          reason: "",
          status: "Pending",
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error adding leave:", error);
    }
  };

  const handleEditLeave = async (id) => {
    if (user.role !== "hr") return; // Only HR can update
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditingLeave(null);
        setFormData({
          employeeName: "",
          leaveType: "Sick Leave",
          startDate: "",
          endDate: "",
          reason: "",
          status: "Pending",
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  const handleDeleteLeave = async (id) => {
    if (user.role !== "hr") return; // Only HR can delete
    if (!window.confirm("Are you sure you want to delete this leave?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLeaves = leaves.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(leaves.length / entriesPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Leaves</h2>

      {/* Add/Edit Form (only HR) */}
      {user && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingLeave ? "✏️ Edit Leave" : "➕ Add New Leave"}
          </h3>
          <form
            onSubmit={(e) => (editingLeave ? handleEditLeave(editingLeave) : handleAddLeave(e))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Earned Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all ${
                  editingLeave ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {editingLeave ? "✓ Update Leave" : "➕ Add Leave"}
              </button>
              {editingLeave && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLeave(null);
                    setFormData({
                      employeeName: "",
                      leaveType: "Sick Leave",
                      startDate: "",
                      endDate: "",
                      reason: "",
                      status: "Pending",
                    });
                  }}
                  className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Employee Name</th>
                <th className="px-6 py-4 text-left">Leave Type</th>
                <th className="px-6 py-4 text-left">Start Date</th>
                <th className="px-6 py-4 text-left">End Date</th>
                <th className="px-6 py-4 text-left">Reason</th>
                <th className="px-6 py-4 text-left">Status</th>
                {isHR && <th className="px-6 py-4 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {currentLeaves.length > 0 ? (
                currentLeaves.map((leave, index) => (
                  <tr key={leave._id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{indexOfFirst + index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{leave.employeeName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{leave.reason || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${
                          leave.status === "Approved"
                            ? "bg-green-600"
                            : leave.status === "Rejected"
                            ? "bg-red-600"
                            : "bg-orange-500"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                            onClick={() => {
                              setEditingLeave(leave._id);
                              setFormData({
                                employeeName: leave.employeeName,
                                leaveType: leave.leaveType,
                                startDate: leave.startDate.slice(0, 10),
                                endDate: leave.endDate.slice(0, 10),
                                reason: leave.reason || "",
                                status: leave.status,
                              });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                            onClick={() => handleDeleteLeave(leave._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isHR ? 8 : 7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg font-medium">No leaves found</p>
                      <p className="text-sm">Start by adding your first leave request!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm"
            >
              {[10, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-gray-700">entries</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold">{indexOfFirst + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(indexOfLast, leaves.length)}</span> of{" "}
              <span className="font-semibold">{leaves.length}</span> entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaves;
