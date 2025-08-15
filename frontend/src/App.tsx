import * as React from 'react';
const { Suspense, useEffect, lazy } = React;
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Spin, ConfigProvider } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AdminProvider } from './features/admin/context/AdminContext';
import { SearchProvider } from './contexts/SearchContext';
import { RbacProvider } from './features/auth/rbac/RbacContext';
import { NoteProvider } from './features/notes/context/NoteContext';
import { theme } from './theme';

// Lazy load layouts
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const AppLayout = lazy(() => import('./layouts/AppLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotesPage = lazy(() => import('./pages/notes/NotesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const PricingManagement = lazy(() => import('./pages/admin/PricingManagement'));
const SubscriptionPage = lazy(() => import('./pages/subscription/SubscriptionPage'));

// Type for route configuration
interface RouteConfig {
  path?: string;
  index?: boolean;
  element?: React.ReactNode;
  children?: RouteConfig[];
  isPrivate?: boolean;
  roles?: string[];
  component?: React.ComponentType<any>;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
  key?: string;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spin size="large" />
  </div>
);

// Auth hooks
const useAuth = () => {
  const { isAuthenticated, isLoading, user } = React.useContext(AuthContext);
  return { isAuthenticated, isLoading, user };
};

const useRbac = () => {
  return {
    hasRole: (role: string) => true, // Implement role check logic
  };
};

// Layout component for routes
const RouteLayout: React.FC<{ route: RouteConfig; children: React.ReactNode }> = ({ route, children }) => {
  const { isPrivate, roles } = route;
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useRbac();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isPrivate && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.some(role => !hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Render routes recursively
const renderRoutes = (routes: RouteConfig[] = []) => {
  return routes.map((route, index) => {
    const Layout = route.layout || React.Fragment;
    const Element = route.component || (() => null);
    const key = route.key || route.path || `route-${index}`;

    return (
      <Route
        key={key}
        path={route.path}
        index={route.index}
        element={
          <RouteLayout route={route}>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                {route.element || <Element />}
              </Suspense>
            </Layout>
          </RouteLayout>
        }
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    );
  });
};

// Route configurations
const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    element: <Home />,
    layout: PublicLayout,
  },
  {
    path: '/login',
    element: <LoginPage />,
    layout: PublicLayout,
  },
  {
    path: '/signup',
    element: <SignupPage />,
    layout: PublicLayout,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    layout: PublicLayout,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    layout: PublicLayout,
  },
  
  // Authenticated routes
  {
    path: '/dashboard',
    element: <DashboardPage />,
    isPrivate: true,
  },
  {
    path: '/notes',
    element: <NotesPage />,
    isPrivate: true,
  },
  {
    path: '/notes/:noteId',
    element: <NotesPage />,
    isPrivate: true,
  },
  {
    path: '/notes/new',
    element: <NotesPage />,
    isPrivate: true,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    isPrivate: true,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    layout: AppLayout,
    isPrivate: true,
  },
  {
    path: '/subscription',
    element: <SubscriptionPage />,
    layout: AppLayout,
    isPrivate: true,
  },
  
  // Admin routes - Using less obvious paths
  {
    path: '/sys/console',
    element: <AdminDashboard />,
    layout: AdminLayout,
    isPrivate: true,
    roles: ['admin'],
  },
  {
    path: '/sys/console/users',
    element: <UserManagementPage />,
    layout: AdminLayout,
    isPrivate: true,
    roles: ['admin'],
  },
  {
    path: '/sys/console/analytics',
    element: <AnalyticsPage />,
    layout: AdminLayout,
    isPrivate: true,
    roles: ['admin'],
  },
  {
    path: '/sys/console/pricing',
    element: <PricingManagement />,
    layout: AdminLayout,
    isPrivate: true,
    roles: ['admin'],
  },
];

// Main App component
const App: React.FC = () => {
  // Set up global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // You can add error reporting here (e.g., Sentry)
    };

    window.addEventListener('error', handleGlobalError);
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <RbacProvider>
              <AdminProvider>
                <SearchProvider>
                  <NoteProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Toaster position="top-right" />
                      <Routes>
                        {renderRoutes(routes)}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </NoteProvider>
                </SearchProvider>
              </AdminProvider>
            </RbacProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;
