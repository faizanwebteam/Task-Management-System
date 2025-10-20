import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token and user info in AuthContext
      const userData = { 
        _id: data._id, 
        name: data.name, 
        email: data.email, 
        role: data.role 
      };
      login(userData, data.token);

      navigate("/dashboard");
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
          Welcome 👋
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Sign in to continue to your dashboard
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 sm:px-4 py-2 rounded-md mb-4 border border-red-200 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4 sm:mt-6 text-sm sm:text-base">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
