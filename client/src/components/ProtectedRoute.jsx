import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Simple route guard: if token exists, render children; otherwise redirect to /login
// If your AuthContext exposes a loading flag, you can add it here for smoother UX.
export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    // Preserve where the user was trying to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
