// src/context/TimerContext.jsx

import React, { createContext, useState, useEffect, useRef, useCallback } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Create Context
export const TimerContext = createContext();

// Provider component
export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const intervalRef = useRef(null);
  const token = localStorage.getItem("token");

  // Initialize timers from backend
  const initializeTimers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const newTimers = {};
        data.forEach((task) => {
          let initialSeconds = task.totalTimeSpent || 0;

          // If timer is active, calculate seconds since start
          if (task.activeTimer) {
            const elapsed = Math.floor((Date.now() - new Date(task.activeTimer)) / 1000);
            initialSeconds += elapsed;
          }

          newTimers[task._id] = {
            seconds: initialSeconds,
            running: !!task.activeTimer,
            paused: task.paused || false,
            activeTimer: task.activeTimer || null,
          };
        });
        setTimers(newTimers);
      }
    } catch (error) {
      console.error("Error initializing timers:", error);
    }
  }, [token]);

  // Initialize timers on mount
  useEffect(() => {
    if (token) {
      initializeTimers();
    }
  }, [token, initializeTimers]);

  // Update timers every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((taskId) => {
          // Only increment if running AND not paused
          if (updated[taskId]?.running && !updated[taskId]?.paused) {
            updated[taskId] = {
              ...updated[taskId],
              seconds: updated[taskId].seconds + 1,
            };
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Start timer
  const startTimer = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/starttime`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTimers((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            running: true,
            paused: false,
            activeTimer: data.activeTimer,
            seconds: data.totalTime,
          },
        }));
        return true;
      }
    } catch (err) {
      console.error("Error starting timer:", err);
    }
    return false;
  };

  // Pause timer
  const pauseTimer = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/pausetime`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTimers((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            paused: true,
            running: false,
            seconds: data.totalTime,
            activeTimer: null,
          },
        }));
        return true;
      }
    } catch (err) {
      console.error("Error pausing timer:", err);
    }
    return false;
  };

  // Stop timer
  const stopTimer = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/stoptime`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTimers((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            running: false,
            paused: false,
            seconds: data.totalTime,
            activeTimer: null,
          },
        }));
        return true;
      }
    } catch (err) {
      console.error("Error stopping timer:", err);
    }
    return false;
  };

  // Resume timer (local state only)
  const resumeTimer = (taskId) => {
    setTimers((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], running: true, paused: false },
    }));
  };

  // Format time helper
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Refresh timers from backend
  const refreshTimers = async () => {
    await initializeTimers();
  };

  const value = {
    timers,
    startTimer,
    pauseTimer,
    stopTimer,
    resumeTimer,
    formatTime,
    refreshTimers,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook to use timer context
export const useTimer = () => {
  const context = React.useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
