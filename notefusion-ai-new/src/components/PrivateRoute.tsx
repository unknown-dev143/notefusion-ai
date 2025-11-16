import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  element?: React.ReactElement;
  children?: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure we return a valid React element
  if (element) {
    return element;
  }
  
  if (children) {
    return <>{children}</>;
  }
  
  return null;
};

export default PrivateRoute;
