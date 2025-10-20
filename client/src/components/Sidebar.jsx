// components/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    { section: "Settings", items: [{ name: "Settings", path: "/Settings" }] }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-md">
      <div className="p-6">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <h2 className="text-gray-500 uppercase text-xs font-semibold mb-2">
              {section.section}
            </h2>
            <ul>
              {section.items.map((item) => (
                <li key={item.name} className="mb-1">
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left px-4 py-2 rounded-md transition
                      ${location.pathname === item.path
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-indigo-100"
                      }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
