import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { ROLES } from '../features/auth/rbac/RbacContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectTo = '/login',
  children,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(role => user?.role === role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
    {children}
  </ProtectedRoute>
);
