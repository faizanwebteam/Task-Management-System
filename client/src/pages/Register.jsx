import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-wide">
          Create Your Account
        </h2>

        {error && (
          <p className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-center font-semibold text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium text-gray-700 text-sm">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700 text-sm">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@mail.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700 text-sm">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition"
            />
          </div>

          <div>
            <label htmlFor="role" className="block mb-1 font-medium text-gray-700 text-sm">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition"
            >
              <option value="user">User</option>
              <option value="hr">HR</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 font-medium text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
