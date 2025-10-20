import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Project() {
  const { user, token } = useContext(AuthContext);
  const isHR = user?.role === "hr";

  const [projects, setProjects] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

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

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentProjects = projects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(projects.length / entriesPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Open edit form
  const handleEditClick = (project) => {
    if (!isHR) return;
    setEditingProjectId(project._id);
    setEditForm({
      code: project.code,
      name: project.name,
      members: project.members.join(", "),
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      client: project.client,
      status: project.status,
    });
  };

  // Save changes
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
      } else {
        console.error("Failed to update project");
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Projects</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Project Name</th>
              <th className="px-4 py-3 text-left">Members</th>
              <th className="px-4 py-3 text-left">Start Date</th>
              <th className="px-4 py-3 text-left">Deadline</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Status</th>
              {isHR && <th className="px-4 py-3 text-left">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <tr key={project._id} className="hover:bg-indigo-50">
                  {editingProjectId === project._id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.members}
                          onChange={(e) => setEditForm({ ...editForm, members: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={editForm.deadline}
                          onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.client}
                          onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                          className="border px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="border px-2 py-1 w-full"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                          onClick={() => handleSave(project._id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                          onClick={() => setEditingProjectId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          onClick={() => handleDelete(project._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{project.code}</td>
                      <td className="px-4 py-3">{project.name}</td>
                      <td className="px-4 py-3">{project.members?.join(", ")}</td>
                      <td className="px-4 py-3">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{project.client}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-xs ${
                            project.status === "completed" ? "bg-green-600" :
                            project.status === "in-progress" ? "bg-blue-600" :
                            "bg-orange-500"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      {isHR && (
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
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
                  No data available in table
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
              <option key={num} value={num}>{num}</option>
            ))}
          </select>{" "}
          entries
        </div>
        <div className="flex gap-2 items-center">
          <span>
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, projects.length)} of {projects.length} entries
          </span>
          <button onClick={handlePrev} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
            Previous
          </button>
          <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Project;
