// src/pages/Setting.jsx
import React, { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Setting() {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch profile info
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      } else {
        console.error("Failed to fetch profile:", data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditing(false);
      } else {
        console.error("Failed to update profile:", data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>

      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                !editing ? "bg-gray-100" : ""
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                !editing ? "bg-gray-100" : ""
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                !editing ? "bg-gray-100" : ""
              }`}
            />
          </div>

          <div className="flex gap-2 mt-4">
            {editing ? (
              <>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Setting;
