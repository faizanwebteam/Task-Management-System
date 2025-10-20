import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Appreciation() {
  const { user, token } = useContext(AuthContext);
  const isHR = user?.role === "hr";

  const [appreciations, setAppreciations] = useState([]);
  const [employee, setEmployee] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [givenBy, setGivenBy] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAppreciations();
  }, []);

  // Fetch all appreciations
  const fetchAppreciations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appreciations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAppreciations(data);
      else console.error("Failed to fetch appreciations:", data.message);
    } catch (error) {
      console.error("Error fetching appreciations:", error);
    }
  };

  // Add new appreciation
  const handleAdd = async (e) => {
    if (!isHR) return; // Only HR can add
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/appreciations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee, message, date, givenBy }),
      });
      if (res.ok) {
        setEmployee("");
        setMessage("");
        setDate("");
        setGivenBy("");
        fetchAppreciations();
      }
    } catch (error) {
      console.error("Error adding appreciation:", error);
    }
  };

  // Update appreciation
  const handleUpdate = async (id) => {
    if (!isHR) return; // Only HR can update
    try {
      const res = await fetch(`${API_BASE_URL}/api/appreciations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee, message, date, givenBy }),
      });
      if (res.ok) {
        setEditingId(null);
        setEmployee("");
        setMessage("");
        setDate("");
        setGivenBy("");
        fetchAppreciations();
      }
    } catch (error) {
      console.error("Error updating appreciation:", error);
    }
  };

  // Delete appreciation
  const handleDelete = async (id) => {
    if (!isHR) return; // Only HR can delete
    if (!window.confirm("Are you sure you want to delete this appreciation?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/appreciations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAppreciations();
    } catch (error) {
      console.error("Error deleting appreciation:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Appreciations</h2>

      {/* Add/Edit Form (only HR) */}
      {isHR && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? "✏️ Edit Appreciation" : "➕ Add New Appreciation"}
          </h3>
          <form
            onSubmit={(e) => (editingId ? handleUpdate(editingId) : handleAdd(e))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Given By
                </label>
                <input
                  type="text"
                  placeholder="Who gave the appreciation"
                  value={givenBy}
                  onChange={(e) => setGivenBy(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                type="text"
                placeholder="Enter appreciation message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all ${
                  editingId ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {editingId ? "✓ Update Appreciation" : "➕ Add Appreciation"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEmployee("");
                    setMessage("");
                    setDate("");
                    setGivenBy("");
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

      {/* Appreciations Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Employee</th>
                <th className="px-6 py-4 text-left">Message</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Given By</th>
                {isHR && <th className="px-6 py-4 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {appreciations.length > 0 ? (
                appreciations.map((app, index) => (
                  <tr key={app._id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{app.employee}</td>
                    <td className="px-6 py-4">{app.message}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {new Date(app.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{app.givenBy}</td>
                    {isHR && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(app._id);
                              setEmployee(app.employee);
                              setMessage(app.message);
                              setDate(app.date.split("T")[0]);
                              setGivenBy(app.givenBy);
                            }}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(app._id)}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No appreciations found</p>
                      <p className="text-sm">Start by adding your first appreciation!</p>
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

export default Appreciation;
