import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-semibold tracking-wide cursor-pointer hover:text-indigo-400 transition-colors"
      >
        Task Manager
      </h1>

      <nav className="flex gap-6 items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium hover:text-indigo-400 transition-colors"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="text-sm font-medium hover:text-indigo-400 transition-colors"
        >
          Profile
        </button>

        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
