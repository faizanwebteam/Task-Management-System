// src/context/TimerContext.jsx
import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from "react";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Create Context
export const TimerContext = createContext();

// Provider component
export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const intervalRef = useRef(null);
  const { token, logout, authLoading } = useContext(AuthContext);

  // Helper: common headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // Generic PUT request handler
  const apiPut = async (url) => {
    if (!token) return null;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: getHeaders(),
      });

      if (res.status === 401) {
        console.warn("Unauthorized. Logging out.");
        logout?.();
        return null;
      }

      if (res.ok) return await res.json();
    } catch (err) {
      console.error("API PUT error:", err);
    }

    return null;
  };

  // Initialize timers from backend
  const initializeTimers = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: getHeaders(),
      });

      if (res.status === 401) {
        console.warn("Unauthorized when initializing timers. Logging out.");
        logout?.();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        const newTimers = {};
        data.forEach((task) => {
          let initialSeconds = task.totalTimeSpent || 0;

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
  }, [token, logout]);

  // Initialize timers on mount AFTER authLoading
  useEffect(() => {
    if (!authLoading && token) {
      initializeTimers();
    }
  }, [authLoading, token, initializeTimers]);

  // Update timers every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((taskId) => {
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
  if (!token) {
    console.warn("No token available, cannot start timer.");
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/starttime`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      console.warn("Unauthorized. Token may be invalid.");
      return false;
    }

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
    const data = await apiPut(`${API_BASE_URL}/api/tasks/${taskId}/pausetime`);
    if (data) {
      setTimers((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          running: false,
          paused: true,
          seconds: data.totalTime,
          activeTimer: null,
        },
      }));
      return true;
    }
    return false;
  };

  // Stop timer
  const stopTimer = async (taskId) => {
    const data = await apiPut(`${API_BASE_URL}/api/tasks/${taskId}/stoptime`);
    if (data) {
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
    return false;
  };

// Resume timer (call backend)
const resumeTimer = async (taskId) => {
  const data = await apiPut(`${API_BASE_URL}/api/tasks/${taskId}/resumetime`);
  if (data) {
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
  return false;
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
    if (!token) return;
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

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

// Custom hook
export const useTimer = () => {
  const context = React.useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
