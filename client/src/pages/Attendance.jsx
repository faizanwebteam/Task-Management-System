import React, { useState, useEffect, useRef, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { format } from "date-fns";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Attendance() {
  const [logs, setLogs] = useState([]); // all history logs
  const [lastLog, setLastLog] = useState(null); // last attendance record
  const [clockedIn, setClockedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const { token, authLoading } = useContext(AuthContext);

  // Fetch last record
  const fetchLastLog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/last`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data) {
        setLastLog(data);
        if (!data.clockOutTime) {
          setClockedIn(true);
          const start = new Date(data.clockInTime).getTime();
          const now = new Date().getTime();
          setTimer(Math.floor((now - start) / 1000));
        } else {
          setClockedIn(false);
          setTimer(0);
        }
      } else {
        setLastLog(null);
        setClockedIn(false);
        setTimer(0);
      }
    } catch (err) {
      console.error("Error fetching last log:", err);
      setLastLog(null);
      setClockedIn(false);
      setTimer(0);
    }
  };

  // Fetch full attendance history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setLogs([]);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (!authLoading && token) {
      fetchLastLog();
      fetchHistory();
    }
  }, [authLoading, token]);

  // Auto-refresh last log & history every 1 minute
  useEffect(() => {
    if (!authLoading && token) {
      const interval = setInterval(() => {
        fetchLastLog();
        fetchHistory();
      }, 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [authLoading, token]);

  // Timer for active session
  useEffect(() => {
    if (clockedIn) {
      intervalRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [clockedIn]);

  // Clock In
  const handleClockIn = async () => {
    if (authLoading || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClockedIn(true);
        setLastLog(data);
        setTimer(0);
        fetchHistory(); // refresh history
      } else {
        alert(data.message || "Failed to clock in");
      }
    } catch (err) {
      console.error("Clock In Error:", err);
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    if (authLoading || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClockedIn(false);
        setLastLog(data);
        setTimer(0);
        fetchHistory(); // refresh history
      } else {
        alert(data.message || "Failed to clock out");
      }
    } catch (err) {
      console.error("Clock Out Error:", err);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6 container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Attendance</h2>

        {/* Clock In / Clock Out */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={clockedIn ? handleClockOut : handleClockIn}
            className={`px-6 py-3 font-semibold rounded-lg text-white transition ${
              clockedIn
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {clockedIn ? "Clock Out" : "Clock In"}
          </button>
          {clockedIn && (
            <span className="text-gray-700 font-medium">
              Timer: {formatDuration(timer)}
            </span>
          )}
        </div>

        {/* Attendance History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
                <th className="py-3 px-4 border-b text-left">Date</th>
                <th className="py-3 px-4 border-b text-left">Clock In</th>
                <th className="py-3 px-4 border-b text-left">Clock Out</th>
                <th className="py-3 px-4 border-b text-left">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, idx) => {
                  const start = new Date(log.clockInTime);
                  const end = log.clockOutTime ? new Date(log.clockOutTime) : new Date();
                  const diffSeconds = Math.floor((end - start) / 1000);
                  return (
                    <tr key={idx} className="even:bg-gray-50 hover:bg-indigo-50 transition">
                      <td className="py-3 px-4 border-b">{format(start, "yyyy-MM-dd")}</td>
                      <td className="py-3 px-4 border-b">{format(start, "HH:mm:ss")}</td>
                      <td className="py-3 px-4 border-b">
                        {log.clockOutTime ? format(end, "HH:mm:ss") : "--:--:--"}
                      </td>
                      <td className="py-3 px-4 border-b">{formatDuration(diffSeconds)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500 italic">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Attendance;
