// src/pages/Setting.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Setting() {
  const { user, token, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mob: "",
    dob: "",
    gender: "",
    country: "",
    oldPassword: "",
    newPassword: "",
  });

  // Fill form with current user info
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mob: user.mob || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
        country: user.country || "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (e) => {
    e.preventDefault(); // ✅ prevent accidental submit
    setEditing(true);
  };

  const handleCancel = (e) => {
    e.preventDefault(); // ✅ prevent accidental submit
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mob: user.mob || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
        country: user.country || "",
        oldPassword: "",
        newPassword: "",
      });
    }
    setEditing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!token) return alert("Not authorized");

    const changedFields = {};
    if (formData.name !== (user.name || "")) changedFields.name = formData.name;
    if (formData.mob !== (user.mob || "")) changedFields.mob = formData.mob;
    if (formData.dob !== (user.dob ? user.dob.split("T")[0] : ""))
      changedFields.dob = formData.dob;
    if (formData.gender !== (user.gender || ""))
      changedFields.gender = formData.gender;
    if (formData.country !== (user.country || ""))
      changedFields.country = formData.country;

    if (formData.oldPassword && formData.newPassword) {
      changedFields.oldPassword = formData.oldPassword;
      changedFields.newPassword = formData.newPassword;
    }

    if (Object.keys(changedFields).length === 0) {
      return alert("No changes made to update.");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
        login({ ...user, ...data }, token);
        setEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>

      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden md:flex">
        {/* Left panel */}
        <div className="bg-gray-100 p-6 flex flex-col items-center md:w-1/3">
          <div className="w-32 h-32 rounded-full bg-indigo-400 flex items-center justify-center text-3xl font-bold text-white mb-4">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <h3 className="text-xl font-semibold">{user?.name}</h3>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Right panel */}
        <div className="p-6 md:w-2/3">
          {/* ✅ wrapping buttons outside form to stop auto submit on Edit click */}
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Mobile</label>
              <input
                type="text"
                name="mob"
                value={formData.mob}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter old password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter new password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  !editing ? "bg-gray-100" : ""
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="col-span-2 flex gap-4 mt-4">
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
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button" // ✅ crucial
                  onClick={handleEdit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Setting;
