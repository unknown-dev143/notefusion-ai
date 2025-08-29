import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Spin, ConfigProvider, App as AntdApp, Modal } from 'antd';
// PWA and Service Worker
import PWAInstallPrompt from './components/PWAInstallPrompt';
import pwaManager from './utils/pwaUtils';
import { useEffect, useState } from 'react';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AdminProvider } from './features/admin/context/AdminContext';
import { SearchProvider } from './contexts/SearchContext';
import { AIOrganizationProvider } from './features/ai/context/AIOrganizationContext';
import { RbacProvider } from './features/auth/rbac/RbacContext';
import { NotesPage } from './features/notes';
import { theme } from './theme';
import { FolderProvider } from './features/folders';
import BackupManager from './features/backup/components/BackupManager';
import ErrorBoundary from './components/ErrorBoundary';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
import styles from './App.module.css';
import { FeatureFlagProvider } from './features/feature-flags';
import { ThemeProvider } from './contexts/ThemeContext';
import StudyPage from './features/study/pages/StudyPage';
import PwaTest from './pages/PwaTest';
import TasksPage from './pages/TasksPage';

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

// Register service worker on app load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    pwaManager.registerServiceWorker().catch(console.error);
  });
}

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
const AudioDemoPage = withSuspense(lazy(() => import('./pages/AudioDemo')));
const VerifyEmailPage = withSuspense(lazy(() => import('./features/auth/pages/VerifyEmailPage')));
const AudioPage = withSuspense(lazy(() => import('./features/audio/pages/AudioPage').then(m => ({ default: m.AudioPage }))));
const FlashcardPage = withSuspense(lazy(() => import('./features/flashcards/FlashcardPage')));
const ProfilePage = withSuspense(lazy(() => import('./pages/ProfilePage')));

// Base path for authentication routes
const AUTH_PATH = '/auth';

// Layout component for authentication pages
const AuthLayout = () => (
  <div className={styles['authLayout']} data-testid="auth-layout">
    <div className={styles['authContainer']}>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  </div>
);


// Loading fallback component
// Check if the app is running as a PWA
const isRunningAsPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div 
    role="status" 
    aria-live="polite"
    aria-busy="true"
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
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
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
  
  return { updateAvailable, updateServiceWorker };
};

// Main App component with proper TypeScript types
const App: React.FC = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  
  // Handle service worker update
  useEffect(() => {
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
    <ConfigProvider theme={theme}>
      <AntdApp className={styles['appContainer']}>
        <ErrorBoundary>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <RbacProvider>
                  <AdminProvider>
                    <SearchProvider>
                      <AIOrganizationProvider>
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
  );
};

export default App;
