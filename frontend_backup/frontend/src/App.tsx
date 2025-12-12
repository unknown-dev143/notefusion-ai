import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const NotesPage = lazy(() => import('./features/notes').then(module => ({ default: module.NotesPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));

// Loading component
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f2f5'
  }}>
    <div>Loading NoteFusion AI...</div>
  </div>
);

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AntdApp>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path=\"/\" element={
                  <div style={{ padding: '2rem' }}>
                    <h1>Welcome to NoteFusion AI</h1>
                    <p>Please log in to continue</p>
                    <div style={{ marginTop: '2rem' }}>
                      <a href=\"/login\" style={{ marginRight: '1rem' }}>Login</a>
                      <a href=\"/signup\">Sign Up</a>
                    </div>
                  </div>
                } />
                <Route path=\"/login\" element={<LoginPage />} />
                <Route path=\"/signup\" element={<SignupPage />} />
                <Route path=\"/notes\" element={
                  <Suspense fallback={<div>Loading notes...</div>}>
                    <NotesPage />
                  </Suspense>
                } />
                <Route path=\"/subscription\" element={
                  <ErrorBoundary componentName=\"SubscriptionPage\">
                    <Suspense fallback={<div>Loading subscription page...</div>}>
                      <SubscriptionPage />
                    </Suspense>
                  </ErrorBoundary>
                } />
                <Route path=\"*\" element={
                  <div style={{ padding: '2rem' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href=\"/\">Return to Home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
