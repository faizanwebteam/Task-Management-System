import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null); // <-- for edit mode
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [statusFilter]);

  const fetchTasks = async () => {
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
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchTasks();
      } else {
        alert(data.message || "Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Handle edit save
  const handleEditTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      if (res.ok) {
        setEditingTask(null);
        fetchTasks();
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
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
        fetchTasks();
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // ✅ Toggle task status
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

      if (res.ok) {
        fetchTasks();
      } else {
        console.error("Failed to toggle task status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };


  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="clipboard">📋</span> Dashboard
      </h2>

      {/* Add Task Form */}
      <form
        onSubmit={handleAddTask}
        className="flex flex-col md:flex-row md:items-center gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Add Task
        </button>
      </form>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="statusFilter" className="font-semibold text-gray-700">
          Filter:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
              <th className="py-3 px-4 border-b text-left">No</th>
              <th className="py-3 px-4 border-b text-left">Title</th>
              <th className="py-3 px-4 border-b text-left">Description</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
              <th className="py-3 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr key={task._id} className="even:bg-gray-50 hover:bg-indigo-50 transition">
                  <td className="py-3 px-4 border-b">{index + 1}</td>

                  {/* Inline edit fields */}
                  {editingTask === task._id ? (
                    <>
                      <td className="py-3 px-4 border-b">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-3 px-4 border-b">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 border-b">{task.title}</td>
                      <td className="py-3 px-4 border-b">{task.description || "-"}</td>
                    </>
                  )}

                  <td className="py-3 px-4 border-b">
                    <span
                      className={`font-semibold ${task.status === "completed" ? "text-green-600" : "text-orange-500"
                        }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 border-b flex gap-2">
                    {editingTask === task._id ? (
                      <>
                        <button
                          onClick={() => handleEditTask(task._id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingTask(task._id);
                            setEditTitle(task.title);
                            setEditDescription(task.description);
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => toggleTaskStatus(task._id, task.status)}
                          className={`px-3 py-1 rounded-md text-white transition ${task.status === "completed"
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                          {task.status === "completed" ? "Mark Pending" : "Mark Done"}
                        </button>
                      </>

                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500 italic">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
