// src/pages/Roles.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Roles() {
  const { token, user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRoles(data);
      else setError(data.message || "Failed to fetch roles");
    } catch (err) {
      setError(err.message);
    }
  };

  // Create a new role
  const handleCreateRole = async () => {
    if (!newRole.name) return alert("Role name is required");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRole),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create role");
      setRoles([...roles, data]);
      setNewRole({ name: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete role");
      }
      setRoles(roles.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Only admins can see create/delete UI
  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Roles</h2>
        <ul className="mt-4">
          {roles.map((r) => (
            <li key={r._id} className="py-1 border-b">{r.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Role Management</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Create new role */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Role name"
          value={newRole.name}
          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={newRole.description}
          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <button
          onClick={handleCreateRole}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {loading ? "Creating..." : "Create Role"}
        </button>
      </div>

      {/* List of roles */}
      <ul>
        {roles.map((r) => (
          <li key={r._id} className="flex justify-between items-center py-2 border-b">
            <span>
              <strong>{r.name}</strong> - {r.description}
            </span>
            <button
              onClick={() => handleDeleteRole(r._id)}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
