//components/Header.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // optional icons, install lucide-react

const menuItems = [
  { section: "Dashboard", items: [{ name: "Dashboard", path: "/dashboard" }] },
  {
    section: "HR",
    items: [
      { name: "Leaves", path: "/hr/leaves" },
      { name: "Attendance", path: "/hr/attendance" },
      { name: "Holiday", path: "/hr/holiday" },
      { name: "Appreciation", path: "/hr/appreciation" },
    ],
  },
  {
    section: "Work",
    items: [
      { name: "Projects", path: "/work/projects" },
      { name: "Tasks", path: "/work/tasks" },
      { name: "Timesheet", path: "/work/timesheet" },
    ],
  },
];

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button (left) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-slate-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        <h1
          onClick={() => navigate("/dashboard")}
          className="text-xl font-semibold tracking-wide cursor-pointer hover:text-indigo-400 transition-colors"
        >
          Task Manager
        </h1>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
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
      </div>

      {/* Mobile Overlay */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile Slide-in Menu (Left Drawer) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 md:hidden shadow-xl transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-base font-semibold">Menu</span>
          <button
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100%-56px)]">
          {/* Navigation Items */}
          {menuItems.map((section) => (
            <div key={section.section} className="mb-4">
              <h3 className="text-gray-400 uppercase text-xs font-semibold mb-2">
                {section.section}
              </h3>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-sm font-medium transition-colors text-left px-2 py-1 rounded
                      ${location.pathname === item.path
                        ? 'text-indigo-400 bg-indigo-900/20'
                        : 'text-gray-300 hover:text-indigo-400'
                      }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Profile and Auth */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <button
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
              className="text-sm font-medium hover:text-indigo-400 transition-colors text-left px-2 py-1 rounded w-full"
            >
              Profile
            </button>

            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors w-full mt-2"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors w-full mt-2"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </aside>
    </header>
  );
};

export default Header;
