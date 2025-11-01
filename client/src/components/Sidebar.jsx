// components/Sidebar.jsx
import React, { useState } from "react";
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
  { section: "Tickets", items: [{ name: "Tickets", path: "/tickets" }] },
  { section: "Messages", items: [{ name: "Messages", path: "/message" }] },
  { section: "Settings", items: [{ name: "Settings", path: "/settings" }] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({ HR: true, Work: true });

  const toggleSection = (section) => {
    if (section === "HR" || section === "Work") {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-md">
      <div className="p-6">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-4">
            {section.section === "HR" || section.section === "Work" ? (
              <>
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full flex justify-between items-center text-gray-500 uppercase text-xs font-semibold mb-2 hover:text-gray-700"
                >
                  {section.section}
                  <span className="ml-2">
                    {expandedSections[section.section] ? "▲" : "▼"}
                  </span>
                </button>
                {expandedSections[section.section] && (
                  <ul className="ml-2">
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
                )}
              </>
            ) : (
              // Static sections: Dashboard, Settings
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
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
