// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";

// Create Context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // Update localStorage whenever user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Login function: store in memory and localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // Logout function: clear memory and localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
