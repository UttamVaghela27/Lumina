import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../user/hooks/useAuth";

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
