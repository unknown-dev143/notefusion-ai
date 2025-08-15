import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

type Permission = string;
type Role = string;

interface RbacContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

// Define your role-permission mappings here
const rolePermissions: Record<Role, Permission[]> = {
  admin: ['manage_users', 'manage_roles', 'view_reports', 'manage_settings'],
  user: ['view_dashboard', 'create_notes', 'edit_own_notes'],
  guest: ['view_public_notes'],
};

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export const RbacProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const getUserPermissions = useCallback((): Permission[] => {
    if (!user) return [];
    
    // Get permissions from user's roles
    const userRoles = user.role ? [user.role] : [];
    return userRoles.reduce<Permission[]>((permissions, role) => {
      return [...permissions, ...(rolePermissions[role] || [])];
    }, []);
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  }, [getUserPermissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }, [getUserPermissions]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }, [getUserPermissions]);

  const hasRole = useCallback((role: Role): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: Role[]): boolean => {
    return roles.some(role => user?.role === role);
  }, [user]);

  const value = useMemo(() => ({
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }), [hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole]);

  return (
    <RbacContext.Provider value={value}>
      {children}
    </RbacContext.Provider>
  );
};

export const useRbac = (): RbacContextType => {
  const context = useContext(RbacContext);
  if (context === undefined) {
    throw new Error('useRbac must be used within an RbacProvider');
  }
  return context;
};
