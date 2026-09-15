import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="page-container flex-center flex-col text-center" style={{ minHeight: '50vh' }}>
        <h2 className="text-xl font-bold text-danger mb-2">Access Restricted</h2>
        <p className="text-secondary max-w-md">
          Your role ({user?.role}) does not have permission to access this portal section.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
