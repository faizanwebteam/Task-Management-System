// pages/Projects.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Project() {
  const { user, token, authLoading } = useContext(AuthContext);
  const isHR = user?.role === "hr";

  const [showAddForm, setShowAddForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newProject, setNewProject] = useState({
    code: "",
    name: "",
    members: "",
    startDate: "",
    deadline: "",
    client: "",
    status: "pending",
  });

  useEffect(() => {
    if (!authLoading && token) {
      fetchProjects();
    }
  }, [authLoading, token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProjects(data);
      else console.error("Failed to fetch projects:", data.message);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Add project (HR only)
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!isHR) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProject,
          // split by comma and trim spaces
          members: newProject.members.split(",").map((m) => m.trim()),
        }),
      });

      if (res.ok) {
        setNewProject({
          code: "",
          name: "",
          members: "",
          startDate: "",
          deadline: "",
          client: "",
          status: "pending",
        });
        fetchProjects();
      } else {
        const errorData = await res.json();
        console.error("Failed to add project:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentProjects = projects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(projects.length / entriesPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Edit + Save + Delete
  const handleEditClick = (project) => {
    if (!isHR) return;
    setEditingProjectId(project._id);
    setEditForm({
      code: project.code,
      name: project.name,
      members: project.members?.map((m) => m.name).join(", ") || "",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      client: project.client,
      status: project.status,
    });
  };

  const handleSave = async (id) => {
    if (!isHR) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          members: editForm.members.split(",").map((m) => m.trim()),
        }),
      });
      if (res.ok) {
        setEditingProjectId(null);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!isHR) return;
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          {isHR && (
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              + Add Project
            </button>
          )}
        </div>

        {/* Add Project Form */}
        {isHR && showAddForm && (
          <form
            onSubmit={handleAddProject}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <input
              type="text"
              placeholder="Project Code"
              value={newProject.code}
              onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Members (comma-separated names)"
              value={newProject.members}
              onChange={(e) => setNewProject({ ...newProject, members: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={newProject.startDate}
              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Client Name"
              value={newProject.client}
              onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
              className="border rounded-lg px-3 py-2 col-span-1 md:col-span-3"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition col-span-1 md:col-span-3"
            >
              Add Project
            </button>
          </form>
        )}

        {/* Project Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Code</th>
                <th className="py-3 px-4 text-left">Project Name</th>
                <th className="py-3 px-4 text-left">Members</th>
                <th className="py-3 px-4 text-left">Start</th>
                <th className="py-3 px-4 text-left">Deadline</th>
                <th className="py-3 px-4 text-left">Client</th>
                <th className="py-3 px-4 text-left">Status</th>
                {isHR && <th className="py-3 px-4 text-left">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-indigo-50 transition">
                    {editingProjectId === project._id ? (
                      <>
                        {/* Edit Mode */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.code}
                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.members}
                            onChange={(e) => setEditForm({ ...editForm, members: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={editForm.startDate}
                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={editForm.deadline}
                            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.client}
                            onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="border px-2 py-1 w-full rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                            onClick={() => handleSave(project._id)}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
                            onClick={() => setEditingProjectId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                            onClick={() => handleDelete(project._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* View Mode */}
                        <td className="px-4 py-2">{project.code}</td>
                        <td className="px-4 py-2">{project.name}</td>
                        <td className="px-4 py-2">
                          {project.members?.map((m) => m.name).join(", ")}
                        </td>
                        <td className="px-4 py-2">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-2">{project.client}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-white text-xs ${
                              project.status === "completed"
                                ? "bg-green-600"
                                : project.status === "in-progress"
                                ? "bg-blue-600"
                                : "bg-orange-500"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        {isHR && (
                          <td className="px-4 py-2">
                            <button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md"
                              onClick={() => handleEditClick(project)}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isHR ? 8 : 7} className="py-6 text-center italic text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-gray-700">
          <div>
            Show{" "}
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {[10, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>{" "}
            entries
          </div>
          <div className="flex gap-2 items-center">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, projects.length)} of {projects.length} entries
            </span>
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;
