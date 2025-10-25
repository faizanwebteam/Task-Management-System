import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [profile, setProfile] = useState({});
  const [projectStats, setProjectStats] = useState({});
  const [taskStats, setTaskStats] = useState({});
  const { token } = useContext(AuthContext);
  const intervalRef = useRef(null);

  // 🕒 Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (clockedIn) setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn]);

  // Fetch data on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchAttendance();
      fetchProjects();
      fetchTasks();
    }
  }, [token]);

  // ====== API Calls ======

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) calculateProjectStats(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) calculateTaskStats(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/last`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data) {
        if (data.clockOutTime === null) {
          const clockIn = new Date(data.clockInTime);
          setClockInTime(clockIn);
          setClockedIn(true);
          setElapsedSeconds(Math.floor((new Date() - clockIn) / 1000));
        }
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  };

  // ====== Stats Calculation ======

  const calculateProjectStats = (projects) => {
    const now = new Date();
    const stats = {
      total: projects.length,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };

    projects.forEach((p) => {
      if (p.status === "completed") stats.completed++;
      else if (p.status === "in progress") stats.inProgress++;
      if (p.dueDate && new Date(p.dueDate) < now && p.status !== "completed") {
        stats.overdue++;
      }
    });

    setProjectStats(stats);
  };

  const calculateTaskStats = (tasks) => {
    const now = new Date();
    const stats = {
      total: tasks.length,
      pending: 0,
      running: 0,
      completed: 0,
      overdue: 0,
    };

    tasks.forEach((t) => {
      if (t.status === "pending") stats.pending++;
      if (t.timerRunning) stats.running++;
      if (t.status === "completed") stats.completed++;
      if (t.dueDate && new Date(t.dueDate) < now && t.status !== "completed") {
        stats.overdue++;
      }
    });

    setTaskStats(stats);
  };

  // ====== Attendance Controls ======

  const handleClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        const clockIn = new Date(data.clockInTime);
        setClockInTime(clockIn);
        setClockedIn(true);
        setElapsedSeconds(0);
      } else alert(data.message || "Failed to clock in");
    } catch (error) {
      console.error("Clock in error:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setClockedIn(false);
        setClockInTime(null);
        setElapsedSeconds(0);
      } else alert(data.message || "Failed to clock out");
    } catch (error) {
      console.error("Clock out error:", error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ====== UI ======
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Attendance Tracker */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Attendance Tracker</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-lg text-gray-700">
            Current Time:{" "}
            <span className="font-mono text-indigo-600">{currentTime.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={clockedIn ? handleClockOut : handleClockIn}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition ${
              clockedIn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {clockedIn ? "Clock Out" : "Clock In"}
          </button>

          {clockedIn && (
            <div className="text-gray-800 text-lg font-mono">
              Time Worked: {formatTime(elapsedSeconds)}
            </div>
          )}
        </div>
        {clockInTime && (
          <p className="mt-3 text-gray-600">
            Clocked in at: {clockInTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Profile Section (Name + Role only) */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {profile.name || "—"}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {profile.role || "—"}
          </p>
        </div>
      </div>

      {/* Task & Project Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Stats */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Tasks</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatCard label="Total" value={taskStats.total} color="text-gray-700" />
            <StatCard label="Pending" value={taskStats.pending} color="text-yellow-600" />
            <StatCard label="Running" value={taskStats.running} color="text-blue-600" />
            <StatCard label="Completed" value={taskStats.completed} color="text-green-600" />
            <StatCard label="Overdue" value={taskStats.overdue} color="text-red-600" />
          </div>
        </div>

        {/* Project Stats */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Projects</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatCard label="Total" value={projectStats.total} color="text-gray-700" />
            <StatCard label="In Progress" value={projectStats.inProgress} color="text-blue-600" />
            <StatCard label="Completed" value={projectStats.completed} color="text-green-600" />
            <StatCard label="Overdue" value={projectStats.overdue} color="text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <p className={`text-lg font-bold ${color}`}>{value ?? 0}</p>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
}

export default Dashboard;
