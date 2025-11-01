import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Task() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    project: "",
    startDate: "",
    dueDate: "",
    assignedTo: "",
    description: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const { token, authLoading } = useContext(AuthContext);
  const { timers, startTimer, pauseTimer, stopTimer, resumeTimer, formatTime, refreshTimers } = useTimer();

  // Helper: default categories when API empty (ensures UI shows options)
  const defaultCategories = [
    "Frontend design",
    "Backend development",
    "Software Development",
    "IT Support / Helpdesk",
    "Project Management",
    "Testing",
    "HR Management",
    "Meetings",
    "Social Media Managemnts",
  ];

  const getTodayDateStr = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTasks(data);
        await refreshTimers();
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  }, [token, refreshTimers]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setProjects(data);
      else setProjects([]);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  }, [token]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setEmployees(data);
      else setEmployees([]);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  }, [token]);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    if (!token) {
      // Convert default categories to objects for consistency
      setCategories(defaultCategories.map((name, idx) => ({ _id: `default-${idx}`, name })));
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/task-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        // Keep the full objects with _id and name
        setCategories(data);
      } else {
        // fallback to default list as objects
        setCategories(defaultCategories.map((name, idx) => ({ _id: `default-${idx}`, name })));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories(defaultCategories.map((name, idx) => ({ _id: `default-${idx}`, name })));
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchTasks();
      fetchProjects();
      fetchEmployees();
      fetchCategories();

      setFormData((prev) => ({
        ...prev,
        startDate: prev.startDate || getTodayDateStr(),
        dueDate: prev.dueDate || getTodayDateStr(),
      }));
    } else if (!authLoading && !token) {
      // still try to show defaults for unauthenticated dev mode
      setCategories(defaultCategories.map((name, idx) => ({ _id: `default-${idx}`, name })));
    }
  }, [authLoading, token, fetchTasks, fetchProjects, fetchEmployees, fetchCategories]);

  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/login");
    }
  }, [authLoading, token, navigate]);

  // timer handlers
  const handleStartResume = async (id) => {
    if (timers[id]?.paused) {
      resumeTimer(id);
    } else {
      await startTimer(id);
    }
  };
  const handlePause = async (id) => await pauseTimer(id);
  const handleStop = async (id) => await stopTimer(id);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Updated preparePayloadFromForm - validate category ID
  const preparePayloadFromForm = () => {
    // Only send category if it's a valid MongoDB ObjectId (not default-*)
    const categoryValue = formData.category ? String(formData.category).trim() : '';
    const isValidCategory = categoryValue && !categoryValue.startsWith('default-');

    return {
      title: formData.title || "",
      description: formData.description || "",
      category: isValidCategory ? categoryValue : null,
      project: formData.project || null,
      assignedTo: formData.assignedTo || null,
      startDate: formData.startDate || new Date().toISOString(),
      dueDate: formData.dueDate || new Date().toISOString(),
      status: "pending",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }
    const payload = preparePayloadFromForm();
    try {
      if (editingTask) {
        const res = await fetch(`${API_BASE_URL}/api/tasks/${editingTask}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
          setEditingTask(null);
          setFormData({
            title: "",
            category: "",
            project: "",
            startDate: getTodayDateStr(),
            dueDate: getTodayDateStr(),
            assignedTo: "",
            description: "",
          });
          await refreshTimers();
        } else {
          console.error("Failed to update task:", data);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data && data._id) {
          const created = {
            ...data,
            startDate: data.startDate || formData.startDate,
            dueDate: data.dueDate || formData.dueDate,
          };
          setTasks((prev) => [created, ...prev]);
          // Reset form after creating new task
          setFormData({
            title: "",
            category: "",
            project: "",
            startDate: getTodayDateStr(),
            dueDate: getTodayDateStr(),
            assignedTo: "",
            description: "",
          });
          await refreshTimers();
        } else {
          await fetchTasks();
        }
      }
    } catch (err) {
      console.error("Error submitting task:", err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
        await refreshTimers();
      } else {
        const data = await res.json();
        console.error("Delete failed:", data);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="clipboard">📋</span> Tasks
      </h2>

      {/* Add/Edit Task Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {editingTask ? "✏️ Edit Task" : "➕ Add Task"}
            </h3>
            <p className="text-sm text-gray-500">Task Info</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter a task title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            {/* Category (populated from backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">Select Assignee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} {emp.role ? `(${emp.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Example: {formatDateTime(formData.startDate)}</p>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Example: {formatDateTime(formData.dueDate)}</p>
            </div>

            {/* Description full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all ${
                editingTask ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {editingTask ? "✓ Update Task" : "➕ Add Task"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: "",
                    category: "",
                    project: "",
                    startDate: getTodayDateStr(),
                    dueDate: getTodayDateStr(),
                    assignedTo: "",
                    description: "",
                  });
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-left">Assigned To</th>
                <th className="px-6 py-4 text-left">Start Date</th>
                <th className="px-6 py-4 text-left">Due Date</th>
                <th className="px-6 py-4 text-left">Timer</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <tr key={task._id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{task.title}</td>
                    <td className="px-6 py-4">
                      {task.project?.name || projects.find((p) => p._id === task.project)?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {task.assignedTo?.name ||
                        employees.find((e) => e._id === task.assignedTo)?.name ||
                        "-"}
                    </td>
                    <td className="px-6 py-4">{task.startDate ? formatDateTime(task.startDate) : "-"}</td>
                    <td className="px-6 py-4">{task.dueDate ? formatDateTime(task.dueDate) : "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {timers[task._id] ? formatTime(timers[task._id].seconds) : "00:00:00"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setEditingTask(task._id);
                            setFormData({
                              title: task.title || "",
                              category: task.category?._id || task.category || "",
                              project: task.project?._id || task.project || "",
                              startDate: task.startDate ? task.startDate.split("T")[0] : getTodayDateStr(),
                              dueDate: task.dueDate ? task.dueDate.split("T")[0] : getTodayDateStr(),
                              assignedTo: task.assignedTo?._id || task.assignedTo || "",
                              description: task.description || "",
                            });
                          }}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => deleteTask(task._id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          🗑️ Delete
                        </button>

                        <button
                          onClick={() => toggleTaskStatus(task._id, task.status)}
                          className={`px-3 py-1.5 rounded-md text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all ${
                            task.status === "completed" ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {task.status === "completed" ? "⏳ Pending" : "✓ Done"}
                        </button>

                        {!timers[task._id]?.running && (
                          <button
                            onClick={() => handleStartResume(task._id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ▶️ Start
                          </button>
                        )}
                        {timers[task._id]?.running && !timers[task._id]?.paused && (
                          <button
                            onClick={() => handlePause(task._id)}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ⏸️ Pause
                          </button>
                        )}
                        {timers[task._id]?.paused && (
                          <button
                            onClick={() => handleStartResume(task._id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ▶️ Resume
                          </button>
                        )}
                        {timers[task._id]?.running && (
                          <button
                            onClick={() => handleStop(task._id)}
                            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            ⏹️ Stop
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <p className="text-lg font-medium">No tasks found</p>
                      <p className="text-sm">Start by adding your first task!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Task;