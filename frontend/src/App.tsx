import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Spin, ConfigProvider, App as AntdApp, Modal } from 'antd';
import { register } from './serviceWorkerRegistration';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AdminProvider } from './features/admin/context/AdminContext';
import { SearchProvider } from './contexts/SearchContext';
import { AIOrganizationProvider } from './features/ai/context/AIOrganizationContext';
import { RbacProvider } from './features/auth/rbac/RbacContext';
import { NotesPage } from './features/notes';
import { theme } from './theme';
import { InstallButton } from './components/InstallButton';
import { FolderProvider } from './features/folders';
import BackupManager from './features/backup/components/BackupManager';
import ErrorBoundary from './components/ErrorBoundary';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
import { FeatureFlagProvider } from './features/feature-flags';

// Initialize mock service worker in development
const initializeMocks = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch (error) {
      console.error('Failed to start mock service worker:', error);
    }
  }
};

// Initialize mocks immediately
initializeMocks().catch(console.error);

// Lazy load auth pages with error boundary and loading state
const withSuspense = <T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) => (props: T) => (
  <Suspense fallback={fallback || <LoadingFallback />}>
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  </Suspense>
);

const LoginPage = withSuspense(lazy(() => import('./features/auth/pages/LoginPage')));
const SignupPage = withSuspense(lazy(() => import('./features/auth/pages/SignupPage')));
const ForgotPasswordPage = withSuspense(lazy(() => import('./features/auth/pages/ForgotPasswordPage')));
const ResetPasswordPage = withSuspense(lazy(() => import('./features/auth/pages/ResetPasswordPage')));
const VerifyEmailPage = withSuspense(lazy(() => import('./features/auth/pages/VerifyEmailPage')));

// Base path for authentication routes
const AUTH_PATH = '/auth';

// Layout component for authentication pages
const AuthLayout = () => (
  <div className="auth-layout" data-testid="auth-layout">
    <div className="auth-container">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  </div>
);


// Loading fallback component
const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div 
    role="status" 
    aria-live="polite"
    aria-busy="true"
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '1rem',
      textAlign: 'center'
    }}
  >
    <Spin size="large" />
    <p style={{ marginTop: '1rem', color: '#666' }}>{message}</p>
  </div>
);

// (config type is defined in serviceWorkerRegistration.ts)

const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = React.useState<boolean>(false);
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);

  const updateServiceWorker = React.useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const registerSW = async () => {
      try {
        await register({
          onUpdate: (updatedReg: ServiceWorkerRegistration) => {
            setRegistration(updatedReg);
            setUpdateAvailable(true);
          },
          onSuccess: (successReg: ServiceWorkerRegistration) => {
            console.log('ServiceWorker registration successful');
            setRegistration(successReg);
          }
        });
      } catch (error) {
        console.error('Error during service worker registration:', error);
      }
    };

    registerSW();
  }, []);

  return { updateAvailable, updateServiceWorker };
};

// Main App component with proper TypeScript types
const App: React.FC = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  
  // Handle service worker update
  React.useEffect(() => {
    if (updateAvailable) {
      Modal.confirm({
        title: 'Update Available',
        content: 'A new version is available. Would you like to update now?',
        onOk: updateServiceWorker,
        okText: 'Update',
        cancelText: 'Later',
      });
    }
  }, [updateAvailable, updateServiceWorker]);

  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <Suspense fallback={<LoadingFallback />}>
          <AntdApp notification={{ placement: 'topRight' }}>
            <BrowserRouter>
              <FeatureFlagProvider>
                <AuthProvider>
                <RbacProvider>
                  <AdminProvider>
                    <SearchProvider>
                      <AIOrganizationProvider>
                        <FolderProvider>
                        <Routes>
                        <Route path={AUTH_PATH} element={<AuthLayout />}>
                          <Route index element={<Navigate to="login" replace />} />
                          <Route path="login" element={<LoginPage />} />
                          <Route path="signup" element={<SignupPage />} />
                          <Route path="verify-email" element={<VerifyEmailPage />} />
                          <Route path="forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="reset-password" element={<ResetPasswordPage />} />
                        </Route>
                        <Route path="/" element={<Navigate to="/notes" replace />} />
                        
                        {/* Notes Routes */}
                        <Route 
                          path="/notes/*" 
                          element={
                            <ErrorBoundary componentName="NotesPage">
                              <NotesPage />
                            </ErrorBoundary>
                          } 
                        />
                        
                        {/* Backup Routes */}
                        <Route 
                          path="/backups" 
                          element={
                            <ErrorBoundary componentName="BackupManager">
                              <BackupManager />
                            </ErrorBoundary>
                          } 
                        />

                        {/* Dev-only: ErrorBoundary test page */}
                        {process.env.NODE_ENV === 'development' && (
                          <Route path="/__test/error-boundary" element={
                            <ErrorBoundary>
                              <div>Error boundary test page is no longer available. Use the ErrorBoundary component directly in your components.</div>
                            </ErrorBoundary>
                          } />
                        )}
                        
                        {/* Feature Flags Page */}
                        <Route 
                          path="/feature-flags" 
                          element={
                            <ErrorBoundary componentName="FeatureFlagsPage">
                              <FeatureFlagsPage />
                            </ErrorBoundary>
                          } 
                        />

                        {/* 404 Route */}
                        <Route path="*" element={
                          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
                            <h1>404 - Page Not Found</h1>
                            <p>The page you are looking for doesn't exist or has been moved.</p>
                            <div style={{ marginTop: '20px' }}>
                              <InstallButton />
                            </div>
                          </div>
                        } />
                      </Routes>
                      </FolderProvider>
                    </AIOrganizationProvider>
                  </SearchProvider>
                </AdminProvider>
              </RbacProvider>
                </AuthProvider>
              </FeatureFlagProvider>
            </BrowserRouter>
            <Toaster position="top-right" />
          </AntdApp>
        </Suspense>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
