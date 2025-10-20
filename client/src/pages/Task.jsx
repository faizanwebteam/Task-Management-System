import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../context/TimerContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Task() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");
  const { timers, startTimer, pauseTimer, stopTimer, resumeTimer, formatTime, refreshTimers } = useTimer();

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        let filtered = data;
        if (statusFilter !== "all") {
          filtered = data.filter((task) => task.status === statusFilter);
        }
        setTasks(filtered);
        await refreshTimers();
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [token, statusFilter, refreshTimers]);

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchTasks();
  }, [token, navigate, fetchTasks]);

  // Start / Resume Timer
  const handleStartResume = async (id) => {
    if (timers[id]?.paused) {
      resumeTimer(id);
    } else {
      await startTimer(id);
    }
  };

  // Pause Timer
  const handlePause = async (id) => {
    await pauseTimer(id);
  };

  // Stop Timer
  const handleStop = async (id) => {
    await stopTimer(id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/${editingTask}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setEditingTask(null);
          setFormData({ title: "", description: "" });
          fetchTasks();
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      // Create new task
      try {
        const res = await fetch(`${API_BASE_URL}/api/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setFormData({ title: "", description: "" });
          fetchTasks();
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
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
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="clipboard">📋</span> Tasks
      </h2>

      {/* Add/Edit Task Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {editingTask ? "✏️ Edit Task" : "➕ Add New Task"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={handleChange}
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
                  setFormData({ title: "", description: "" });
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="statusFilter" className="font-semibold text-gray-700">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Start Time</th>
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
                    <td className="px-6 py-4">{task.description || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === "completed" 
                          ? "bg-green-600 text-white" 
                          : "bg-orange-500 text-white"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {timers[task._id]?.running && timers[task._id]?.activeTimer
                        ? formatDateTime(timers[task._id].activeTimer)
                        : task.activeTimer
                        ? formatDateTime(task.activeTimer)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {timers[task._id] ? formatTime(timers[task._id].seconds) : "00:00:00"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setEditingTask(task._id);
                            setFormData({
                              title: task.title,
                              description: task.description || "",
                            });
                          }}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          ✏️ Edit
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          🗑️ Delete
                        </button>

                        {/* Toggle Status button */}
                        <button
                          onClick={() => toggleTaskStatus(task._id, task.status)}
                          className={`px-3 py-1.5 rounded-md text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all ${
                            task.status === "completed"
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {task.status === "completed" ? "⏳ Pending" : "✓ Done"}
                        </button>

                        {/* Timer control buttons */}
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
                  <td colSpan="7" className="py-12 text-center">
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
