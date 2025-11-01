import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Tickets = () => {
  const { token, user } = useContext(AuthContext);

  // Tickets & filters
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [employee, setEmployees] = useState([]);

  // Ticket stats
  const [stats, setStats] = useState({
    total: 0,
    closed: 0,
    open: 0,
    pending: 0,
    resolved: 0,
  });

  // Modal form state
  const [showForm, setShowForm] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    requesterName: "",
    requesterType: "client",
    description: "",
    project: "",
    priority: "Medium",
    channel: "",
    type: "",
    tags: [],
    status: "Open",
    group: "",
    agent: "",
  });

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTickets(data);
        setFilteredTickets(data);
        updateStats(data);
      } else {
        setTickets([]);
        setFilteredTickets([]);
        updateStats([]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Fetch Projects - For all users
  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  // Fetch Users - For HR only; normal users will likely get 403
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setUsers(data);
        else setUsers([]); // ensure empty rather than undefined on 403/other
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch Employees (accessible to any authenticated user)
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setEmployees(data);
        else setEmployees([]);
      } catch (err) {
        console.error(err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, [token]);

  // Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setClients(data);
        else setClients([]);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setClients([]);
      }
    };
    fetchClients();
  }, [token]);

  const updateStats = (ticketsArr) => {
    const total = ticketsArr.length;
    const closed = ticketsArr.filter((t) => t.status === "Closed").length;
    const open = ticketsArr.filter((t) => t.status === "Open").length;
    const pending = ticketsArr.filter((t) => t.status === "Pending").length;
    const resolved = ticketsArr.filter((t) => t.status === "Resolved").length;
    setStats({ total, closed, open, pending, resolved });
  };

  const handleSearch = () => {
    let temp = [...tickets];
    if (search) {
      temp = temp.filter(
        (t) =>
          (t.subject || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.requesterName || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "All") temp = temp.filter((t) => t.status === statusFilter);
    if (groupFilter) temp = temp.filter((t) => t.group === groupFilter);
    if (agentFilter) {
      // agentFilter is an id string; ticket.agent may be an id or object
      temp = temp.filter((t) => {
        if (!t.agent) return false;
        if (typeof t.agent === "string") return t.agent === agentFilter;
        if (typeof t.agent === "object") return t.agent._id === agentFilter || t.agent === agentFilter;
        return false;
      });
    }
    if (priorityFilter) temp = temp.filter((t) => t.priority === priorityFilter);
    setFilteredTickets(temp);
    updateStats(temp);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags") setFormData({ ...formData, tags: value.split(",").map(t => t.trim()).filter(Boolean) });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editTicket ? "PUT" : "POST";
    const url = editTicket
      ? `${API_BASE_URL}/api/tickets/${editTicket._id}`
      : `${API_BASE_URL}/api/tickets`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        // If the backend returned the created/updated ticket, use it; otherwise refetch
        if (data && data._id) {
          // Ensure requestedOn exists for display
          if (!data.requestedOn) data.requestedOn = new Date().toISOString();
          // Prepend created/updated ticket to lists (if create) or replace (if update)
          if (editTicket) {
            setTickets((prev) => prev.map((t) => (t._id === data._id ? data : t)));
            setFilteredTickets((prev) => prev.map((t) => (t._id === data._id ? data : t)));
          } else {
            setTickets((prev) => [data, ...prev]);
            setFilteredTickets((prev) => [data, ...prev]);
          }
          updateStats([...(editTicket ? tickets : [data, ...tickets])]);
        } else {
          // fallback: refetch full list
          await fetchTickets();
        }

        setShowForm(false);
        setEditTicket(null);
        setFormData({
          subject: "",
          requesterName: "",
          requesterType: "client",
          description: "",
          project: "",
          priority: "Medium",
          channel: "",
          type: "",
          tags: [],
          status: "Open",
          group: "",
          agent: "",
        });
      } else {
        console.error("Error:", data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (ticket) => {
    setEditTicket(ticket);
    setFormData({
      subject: ticket.subject || "",
      requesterName: ticket.requesterName || "",
      requesterType: ticket.requesterType || "client",
      description: ticket.description || "",
      project: ticket.project?._id || ticket.project || "",
      priority: ticket.priority || "Medium",
      channel: ticket.channel || "",
      type: ticket.type || "",
      tags: ticket.tags || [],
      status: ticket.status || "Open",
      group: ticket.group || "",
      agent: ticket.agent?._id || ticket.agent || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this ticket?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t._id !== id));
        setFilteredTickets((prev) => prev.filter((t) => t._id !== id));
        updateStats(filteredTickets.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve a ticket (set status to Resolved)
  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Resolved" }),
      });
      const data = await res.json();
      if (res.ok && data && data._id) {
        setTickets((prev) => prev.map((t) => (t._id === id ? data : t)));
        setFilteredTickets((prev) => prev.map((t) => (t._id === id ? data : t)));
        updateStats(filteredTickets.map((t) => (t._id === id ? data : t)));
      } else {
        console.error("Failed to resolve ticket", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Determine agent list to show: if /api/users (HR) returned data, prefer that; otherwise fall back to employees list
  const agentList = (Array.isArray(users) && users.length > 0) ? users : (Array.isArray(employee) ? employee : []);

  // Helper to render "Others" column (priority or custom others field)
  const renderOthers = (ticket) => {
    if (ticket.others) return ticket.others;
    const pr = ticket.priority || "";
    if (pr) return `priority:${pr}`;
    return "-";
  };

  // Helper to format requestedOn
  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Tickets</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Total Tickets</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Closed</p>
          <p className="text-xl font-bold">{stats.closed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Open</p>
          <p className="text-xl font-bold">{stats.open}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">Resolved</p>
          <p className="text-xl font-bold">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Start typing to search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>
        <input
          type="text"
          placeholder="Group"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Agent"
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Filters
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition col-span-1 md:col-span-3"
        >
          + Add Ticket
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto pt-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 border-b pb-2">
              {editTicket ? "Edit Ticket" : "Create Ticket"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Ticket Details */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">🎫 Ticket Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Ticket Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="border rounded w-full px-3 py-2 mt-1 focus:ring focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Type</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="border rounded w-full px-3 py-2 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Requester */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">👤 Requester</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

                  {/* Requester Type */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requesterType"
                        value="client"
                        checked={formData.requesterType === "client"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requesterType: e.target.value,
                            requesterName: "",
                          })
                        }
                        className="mr-2"
                      />
                      Client
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="requesterType"
                        value="employee"
                        checked={formData.requesterType === "employee"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requesterType: e.target.value,
                            requesterName: "",
                          })
                        }
                        className="mr-2"
                      />
                      Employee
                    </label>
                  </div>

                  {/* Requester Name Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Requester Name *</label>
                    <select
                      name="requesterName"
                      value={formData.requesterName}
                      onChange={handleChange}
                      required
                      className="border rounded w-full px-3 py-2 mt-1"
                    >
                      <option value="">Select Requester</option>
                      {formData.requesterType === "client"
                        ? clients.map(client => (
                          <option key={client._id} value={client.name}>
                            {client.name} ({client.company})
                          </option>
                        ))
                        : employee.map(emp => (
                          <option key={emp._id} value={emp.name}>
                            {emp.name} ({emp.role})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment Info */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">📋 Assignment Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Assign Group *</label>
                    <input
                      type="text"
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      required
                      className="border rounded w-full px-3 py-2 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Agent</label>
                    <select
                      name="agent"
                      value={formData.agent}
                      onChange={handleChange}
                      className="border rounded w-full px-3 py-2 mt-1"
                    >
                      <option value="">Select Agent</option>
                      {agentList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Project</label>
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="border rounded w-full px-3 py-2"
                />
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Upload File</label>
                <input
                  type="file"
                  name="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  className="border rounded w-full px-3 py-2"
                />
              </div>

              {/* Other Details */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-1">🧾 Other Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="border rounded w-full px-3 py-2 mt-1"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Channel Name</label>
                    <input
                      type="text"
                      name="channel"
                      value={formData.channel}
                      onChange={handleChange}
                      className="border rounded w-full px-3 py-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags.join(",")}
                      onChange={handleChange}
                      placeholder="tag1,tag2,tag3"
                      className="border rounded w-full px-3 py-2 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditTicket(null);
                    setFormData({
                      subject: "",
                      requesterName: "",
                      requesterType: "client",
                      description: "",
                      project: "",
                      priority: "Medium",
                      channel: "",
                      type: "",
                      tags: [],
                      status: "Open",
                      group: "",
                      agent: "",
                    });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editTicket ? "Update Ticket" : "Create Ticket"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Ticket #</th>
              <th className="px-4 py-2 border">Ticket Subject</th>
              <th className="px-4 py-2 border">Requester Name</th>
              <th className="px-4 py-2 border">Requested On</th>
              <th className="px-4 py-2 border">Others</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {currentTickets.length > 0 ? (
              currentTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-indigo-50">
                  <td className="px-4 py-2 border">{ticket.number || "-"}</td>
                  <td className="px-4 py-2 border">{ticket.subject}</td>
                  <td className="px-4 py-2 border">{ticket.requesterName}</td>
                  <td className="px-4 py-2 border">
                    {formatDate(ticket.requestedOn)}
                  </td>
                  <td className="px-4 py-2 border">{renderOthers(ticket)}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs ${ticket.status === "Closed"
                        ? "bg-green-600"
                        : ticket.status === "Open"
                          ? "bg-blue-600"
                          : ticket.status === "Pending"
                            ? "bg-orange-500"
                            : ticket.status === "Resolved"
                              ? "bg-gray-600"
                              : "bg-gray-500"
                        }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border flex gap-1">
                    <button
                      onClick={() => handleEdit(ticket)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    {ticket.status !== "Resolved" ? (
                      <button
                        onClick={() => handleResolve(ticket._id)}
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-400 text-white px-2 py-1 rounded cursor-not-allowed"
                      >
                        Resolved
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(ticket._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center italic text-gray-500">
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
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>{" "}
          entries
        </div>
        <div className="flex gap-2 items-center">
          <span>
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTickets.length)} of{" "}
            {filteredTickets.length} entries
          </span>
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tickets;