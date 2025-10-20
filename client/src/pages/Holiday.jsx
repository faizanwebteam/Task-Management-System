import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Holiday() {
  const { user, token } = useContext(AuthContext);
  const isHR = user?.role === "hr";

  const [holidays, setHolidays] = useState([]);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "Public",
    description: "",
    status: "Active",
  });

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok || res.status === 200) setHolidays(data);
      else console.error(data.message);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isHR) return;
    
    if (editingHoliday) {
      // Update existing holiday
      try {
        const res = await fetch(`${API_BASE_URL}/api/holidays/${editingHoliday}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setEditingHoliday(null);
          setFormData({ name: "", date: "", type: "Public", description: "", status: "Active" });
          fetchHolidays();
        }
      } catch (error) {
        console.error("Error updating holiday:", error);
      }
    } else {
      // Create new holiday
      try {
        const res = await fetch(`${API_BASE_URL}/api/holidays`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setFormData({ name: "", date: "", type: "Public", description: "", status: "Active" });
          fetchHolidays();
        }
      } catch (error) {
        console.error("Error creating holiday:", error);
      }
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!isHR) return;
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Holidays</h2>

      {/* Add/Edit Form (only HR) */}
      {isHR && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingHoliday ? "✏️ Edit Holiday" : "➕ Add New Holiday"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter holiday name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="Public">Public</option>
                  <option value="Optional">Optional</option>
                </select>
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                placeholder="Enter holiday description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all ${
                  editingHoliday ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {editingHoliday ? "✓ Update Holiday" : "➕ Add Holiday"}
              </button>
              {editingHoliday && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingHoliday(null);
                    setFormData({ name: "", date: "", type: "Public", description: "", status: "Active" });
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

      {/* Holidays Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Status</th>
                {isHR && <th className="px-6 py-4 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {holidays.length > 0 ? (
                holidays.map((holiday) => (
                  <tr key={holiday._id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{holiday.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {new Date(holiday.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        holiday.type === "Public" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {holiday.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{holiday.description || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        holiday.status === "Active" 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-400 text-white"
                      }`}>
                        {holiday.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingHoliday(holiday._id);
                              setFormData({
                                name: holiday.name,
                                date: new Date(holiday.date).toISOString().split("T")[0],
                                type: holiday.type,
                                description: holiday.description || "",
                                status: holiday.status,
                              });
                            }}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday._id)}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
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
                  <td colSpan={isHR ? 6 : 5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No holidays found</p>
                      <p className="text-sm">Start by adding your first holiday!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Holiday;
