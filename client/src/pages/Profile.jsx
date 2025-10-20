import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    oldPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // You can return early AFTER hooks
  if (!user) {
    return null; // or a loading spinner if user data is loading
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in");
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name };

      if (form.oldPassword && form.newPassword) {
        payload.oldPassword = form.oldPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const updatedUser = await res.json();
      if (!res.ok) throw new Error(updatedUser.message || "Failed to update profile");

      login(updatedUser, token); // keep existing token
      setMessage("Profile updated successfully!");
      setForm({ ...form, oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 sm:px-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-600 mb-4 sm:mb-6">
          User Profile
        </h2>
        <p className="text-gray-700 text-center mb-3 sm:mb-4 text-sm sm:text-base">
          <strong>Email:</strong> {user.email}
        </p>

        {message && (
          <div className="bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-md mb-3 sm:mb-4 border border-green-200 text-center font-semibold text-sm sm:text-base">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-3 sm:px-4 py-2 rounded-md mb-3 sm:mb-4 border border-red-200 text-center font-semibold text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
              Name
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
              Old Password
            </label>
            <input
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 text-sm sm:text-base ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
