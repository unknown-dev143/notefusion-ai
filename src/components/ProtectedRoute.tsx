import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { tokenService } from '../services/tokenService';
import { message } from 'antd';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requiredPermission,
  fallback 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [tokenValidating, setTokenValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const validToken = await tokenService.getValidAccessToken();
        if (!validToken) {
          message.error('Session expired. Please login again.');
          setTokenValidating(false);
        } else {
          setTokenValidating(false);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setTokenValidating(false);
      }
    };

    if (user) {
      validateToken();
    } else {
      setTokenValidating(false);
    }
  }, [user]);

  if (loading || tokenValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermission && !tokenService.hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
