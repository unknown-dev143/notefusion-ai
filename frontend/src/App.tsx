import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
<<<<<<< HEAD
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Spin, ConfigProvider, App as AntdApp, Modal } from 'antd';
// PWA and Service Worker
import PWAInstallPrompt from './components/PWAInstallPrompt';
import pwaManager from './utils/pwaUtils';
import { useEffect, useState } from 'react';
=======
import { Toaster } from 'react-hot-toast';
import { Spin, ConfigProvider, App as AntdApp, Modal } from 'antd';
import { register } from './serviceWorkerRegistration';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { AuthProvider } from './features/auth/context/AuthContext';
import { AdminProvider } from './features/admin/context/AdminContext';
import { SearchProvider } from './contexts/SearchContext';
import { AIOrganizationProvider } from './features/ai/context/AIOrganizationContext';
import { RbacProvider } from './features/auth/rbac/RbacContext';
import { NotesPage } from './features/notes';
import { theme } from './theme';
<<<<<<< HEAD
=======
import { InstallButton } from './components/InstallButton';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { FolderProvider } from './features/folders';
import BackupManager from './features/backup/components/BackupManager';
import ErrorBoundary from './components/ErrorBoundary';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
<<<<<<< HEAD
import styles from './App.module.css';
import { FeatureFlagProvider } from './features/feature-flags';
import { ThemeProvider } from './contexts/ThemeContext';
import StudyPage from './features/study/pages/StudyPage';
import PwaTest from './pages/PwaTest';
import TasksPage from './pages/TasksPage';
=======
import { FeatureFlagProvider } from './features/feature-flags';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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

<<<<<<< HEAD
// Register service worker on app load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    pwaManager.registerServiceWorker().catch(console.error);
  });
}

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
const AudioDemoPage = withSuspense(lazy(() => import('./pages/AudioDemo')));
const VerifyEmailPage = withSuspense(lazy(() => import('./features/auth/pages/VerifyEmailPage')));
const AudioPage = withSuspense(lazy(() => import('./features/audio/pages/AudioPage').then(m => ({ default: m.AudioPage }))));
const FlashcardPage = withSuspense(lazy(() => import('./features/flashcards/FlashcardPage')));
const ProfilePage = withSuspense(lazy(() => import('./pages/ProfilePage')));
=======
const VerifyEmailPage = withSuspense(lazy(() => import('./features/auth/pages/VerifyEmailPage')));
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

// Base path for authentication routes
const AUTH_PATH = '/auth';

// Layout component for authentication pages
const AuthLayout = () => (
<<<<<<< HEAD
  <div className={styles['authLayout']} data-testid="auth-layout">
    <div className={styles['authContainer']}>
=======
  <div className="auth-layout" data-testid="auth-layout">
    <div className="auth-container">
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  </div>
);


// Loading fallback component
<<<<<<< HEAD
// Check if the app is running as a PWA
const isRunningAsPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div 
    role="status" 
    aria-live="polite"
    aria-busy="true"
<<<<<<< HEAD
    className={styles['loadingFallback']}
  >
    <Spin size="large" />
    <p>{message}</p>
  </div>
);

// PWA update handling
const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const updateServiceWorker = () => {
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
<<<<<<< HEAD
  };

  // Check for updates when the app loads
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const reg = await pwaManager.registerServiceWorker();
        setRegistration(reg);
        
        // Listen for controller change (update available)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setUpdateAvailable(true);
        });
        
        // Check for updates every hour
        const interval = setInterval(() => {
          pwaManager.checkForUpdates();
        }, 60 * 60 * 1000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return undefined;
      }
    };
    
    checkForUpdates();
  }, []);
  
=======
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

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  return { updateAvailable, updateServiceWorker };
};

// Main App component with proper TypeScript types
const App: React.FC = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  
  // Handle service worker update
<<<<<<< HEAD
  useEffect(() => {
=======
  React.useEffect(() => {
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
    <ConfigProvider theme={theme}>
      <AntdApp className={styles['appContainer']}>
        <ErrorBoundary>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
=======
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <Suspense fallback={<LoadingFallback />}>
          <AntdApp notification={{ placement: 'topRight' }}>
            <BrowserRouter>
              <FeatureFlagProvider>
                <AuthProvider>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                <RbacProvider>
                  <AdminProvider>
                    <SearchProvider>
                      <AIOrganizationProvider>
<<<<<<< HEAD
                        <FeatureFlagProvider>
                          <FolderProvider>
                            <Toaster position="top-right" />
                            {/* PWA Install Prompt and Status */}
                            {!isRunningAsPWA() && <PWAInstallPrompt />}
                            
                            <main className={styles['mainContent']}>
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
                                
                                {/* Audio Demo Page */}
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
                                
                                {/* Audio Demo Page */}
                                <Route 
                                  path="/audio-demo" 
                                  element={
                                    <ErrorBoundary componentName="AudioDemo">
                                      <AudioDemoPage />
                                    </ErrorBoundary>
                                  } 
                                />
                                
                                {/* Tasks Page */}
                                <Route 
                                  path="/tasks" 
                                  element={
                                    <ErrorBoundary componentName="TasksPage">
                                      <TasksPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Study Tools Page */}
                                <Route 
                                  path="/study" 
                                  element={
                                    <ErrorBoundary componentName="StudyPage">
                                      <StudyPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Flashcard Routes */}
                                <Route 
                                  path="/flashcards" 
                                  element={
                                    <ErrorBoundary componentName="FlashcardPage">
                                      <FlashcardPage />
                                    </ErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="/flashcards/note/:noteId" 
                                  element={
                                    <ErrorBoundary componentName="FlashcardPage">
                                      <FlashcardPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Protected Profile Page */}
                                <Route 
                                  path="/profile" 
                                  element={
                                    <ProtectedRoute>
                                      <ErrorBoundary componentName="ProfilePage">
                                        <ProfilePage />
                                      </ErrorBoundary>
                                    </ProtectedRoute>
                                  } 
                                />

                                {/* Audio Tools Page */}
                                <Route 
                                  path="/audio-tools" 
                                  element={
                                    <ErrorBoundary componentName="AudioPage">
                                      <AudioPage />
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

                                {/* Feature Flags Page */}
                                <Route 
                                  path="/pwa-test" 
                                  element={
                                    <ErrorBoundary componentName="PwaTest">
                                      <PwaTest />
                                    </ErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="/feature-flags" 
                                  element={
                                    <ErrorBoundary componentName="FeatureFlagsPage">
                                      <FeatureFlagsPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* 404 Route */}
                                <Route 
                                  path="*" 
                                  element={
                                    <div className={styles['notFoundContainer']}>
                                      <h1>404 - Page Not Found</h1>
                                      <p>The page you're looking for doesn't exist.</p>
                                    </div>
                                  } 
                                />
                              </Routes>
                            </main>
                          </FolderProvider>
                        </FeatureFlagProvider>
                      </AIOrganizationProvider>
                    </SearchProvider>
                  </AdminProvider>
                </RbacProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  );
};

export default App;
