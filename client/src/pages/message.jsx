// src/pages/Message.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Message = () => {
  const { token, user } = useContext(AuthContext);

  // Form state
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);

  // Messages
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch inbox messages
  const fetchInbox = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInbox(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    }
  };

  // Fetch sent messages
  const fetchSent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSent(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch sent messages:", err);
    }
  };

  // Polling every 5 seconds for inbox updates
  useEffect(() => {
    fetchInbox();
    fetchSent();
    const interval = setInterval(() => {
      fetchInbox();
      fetchSent();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiver || !subject) {
      alert("Please select a member and enter a subject.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("receiver", receiver);
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("type", "direct");
      if (file) formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");

      alert("Message sent successfully!");
      setReceiver("");
      setSubject("");
      setBody("");
      setFile(null);

      // Refresh messages
      fetchInbox();
      fetchSent();
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message: " + err.message);
    }
  };

  // Delete message (HR/Admin only)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete message");
      alert(data.message);
      fetchInbox();
      fetchSent();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      {/* Send Message Form */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">New Conversation</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Choose Member *</label>
            <select
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select Member</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Add File (optional)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Inbox */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Inbox</h2>
        {inbox.length === 0 ? (
          <p>No messages received.</p>
        ) : (
          <ul className="space-y-2">
            {inbox.map((msg) => (
              <li key={msg._id} className="border p-2 rounded flex justify-between items-start">
                <div>
                  <p>
                    <strong>From:</strong> {msg.sender?.name} ({msg.sender?.role})
                  </p>
                  <p>
                    <strong>Subject:</strong> {msg.subject}
                  </p>
                  <p>{msg.body}</p>
                  {msg.file && (
                    <p>
                      <strong>File:</strong>{" "}
                      <a
                        href={`${API_BASE_URL}/uploads/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {msg.file}
                      </a>
                    </p>
                  )}
                </div>
                {(user.role === "hr" || user.role === "admin") && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="text-red-600 ml-4"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sent */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Sent Messages</h2>
        {sent.length === 0 ? (
          <p>No messages sent.</p>
        ) : (
          <ul className="space-y-2">
            {sent.map((msg) => (
              <li key={msg._id} className="border p-2 rounded flex justify-between items-start">
                <div>
                  <p>
                    <strong>To:</strong> {msg.receiver?.name || "Announcement"}
                  </p>
                  <p>
                    <strong>Subject:</strong> {msg.subject}
                  </p>
                  <p>{msg.body}</p>
                  {msg.file && (
                    <p>
                      <strong>File:</strong>{" "}
                      <a
                        href={`${API_BASE_URL}/uploads/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {msg.file}
                      </a>
                    </p>
                  )}
                </div>
                {(user.role === "hr" || user.role === "admin") && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="text-red-600 ml-4"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Message;
