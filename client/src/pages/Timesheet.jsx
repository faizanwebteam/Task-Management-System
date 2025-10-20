import React, { useEffect, useState } from "react";
import { useTimer } from "../context/TimerContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function Timesheet() {
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem("token");
  const { timers, formatTime } = useTimer();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
      else console.error("Failed to fetch tasks:", data.message);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString(); // e.g., "10/17/2025, 10:35 AM"
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Timesheet</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
            <th className="py-3 px-4 border-b">#</th>
            <th className="py-3 px-4 border-b">Task</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Start Time</th>
            <th className="py-3 px-4 border-b">End Time</th>
            <th className="py-3 px-4 border-b">Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              const timerData = timers[task._id];
              const currentTime = timerData ? timerData.seconds : (task.totalTimeSpent || 0);
              const isActive = timerData ? timerData.running && !timerData.paused : false;

              // Get the latest session (not just the first)
              const lastSession = task.sessions?.[task.sessions.length - 1];
              const startTime = lastSession ? formatDateTime(lastSession.startTime) : "-";
              const endTime = isActive
                ? "Active"
                : lastSession?.endTime
                ? formatDateTime(lastSession.endTime)
                : "-";

              const totalHours = formatTime(currentTime);

              return (
                <tr key={task._id} className="even:bg-gray-50 hover:bg-indigo-50">
                  <td className="py-3 px-4 border-b">{index + 1}</td>
                  <td className="py-3 px-4 border-b">{task.title}</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`font-semibold ${
                        task.status === "completed" ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {task.status}
                    </span>
                    {isActive && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Running
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">{startTime}</td>
                  <td className="py-3 px-4 border-b">{endTime}</td>
                  <td className="py-3 px-4 border-b font-mono">{totalHours}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Timesheet;
