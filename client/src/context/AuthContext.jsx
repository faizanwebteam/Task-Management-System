// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";

// Create Context
export const AuthContext = createContext();

// Keys for localStorage
const LS_USER_KEY = "auth_user";
const LS_TOKEN_KEY = "auth_token";

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(LS_USER_KEY);
      const storedToken = localStorage.getItem(LS_TOKEN_KEY);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (_) {
      // ignore JSON parse errors
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Persist to localStorage whenever changes occur
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      localStorage.setItem(LS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(LS_USER_KEY);
      localStorage.removeItem(LS_TOKEN_KEY);
    }
  }, [user, token]);

  // Login function
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
