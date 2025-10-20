import React, { useState, useEffect, useRef, } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { token } = useContext(AuthContext)
  const intervalRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (clockedIn) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn]);

  // Fetch last attendance record
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/attendance/last`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          if (data.clockOutTime === null) {
            // user is still clocked in
            const clockIn = new Date(data.clockInTime);
            setClockInTime(clockIn);
            setClockedIn(true);
            const elapsed = Math.floor((new Date() - clockIn) / 1000);
            setElapsedSeconds(elapsed);
          }
        }
      } catch (error) {
        console.error("Failed to fetch last attendance:", error);
      }
    };
    fetchAttendance();
  }, [token]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockin`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      const data = await res.json();
      if (res.ok) {
        const clockIn = new Date(data.clockInTime);
        setClockInTime(clockIn);
        setClockedIn(true);
        setElapsedSeconds(0);
      } else {
        alert(data.message || "Failed to clock in");
      }
    } catch (error) {
      console.error("Clock in error:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/clockout`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClockedIn(false);
        setClockInTime(null);
        setElapsedSeconds(0);
      } else {
        alert(data.message || "Failed to clock out");
      }
    } catch (error) {
      console.error("Clock out error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Attendance Tracker
          </h2>

          {/* Current Time */}
          <div className="text-xl text-gray-700 mb-6">
            Current Time: <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Clock In / Clock Out */}
          <div className="flex flex-col md:flex-row items-center gap-6">
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
            <p className="mt-4 text-gray-600">
              Clocked in at: {clockInTime.toLocaleTimeString()}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
