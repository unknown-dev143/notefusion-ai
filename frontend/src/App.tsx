import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, Layout } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const NotesPage = lazy(() => import('./features/notes').then(m => ({ default: (m as any).NotesPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const TestErrorBoundary = lazy(() => import('./features/test/TestErrorBoundary'));
const FlashcardPage = lazy(() => import('./features/flashcards/FlashcardPage'));
const TasksPage = lazy(() => import('./features/tasks').then(m => ({ default: (m as any).TasksPage })));
const AIChatPage = lazy(() => import('./features/ai/pages/AIChatPage'));
const AntigravityPage = lazy(() => import('./components/AntigravityFeature'));

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
    <ThemeProvider>
      <AntdApp>
        <ErrorBoundary>
          <BrowserRouter>
            <Layout style={{ minHeight: '100vh' }}>
              <Navigation />
              <Layout.Content>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/notes" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/subscription" element={
                      <ErrorBoundary componentName="SubscriptionPage">
                        <Suspense fallback={<div>Loading subscription page...</div>}>
                          <SubscriptionPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/test-error" element={
                      <ErrorBoundary componentName="TestErrorBoundary">
                        <Suspense fallback={<div>Loading test page...</div>}>
                          <TestErrorBoundary />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/notes" element={
                      <ErrorBoundary componentName="NotesPage">
                        <Suspense fallback={<div>Loading notes...</div>}>
                          <NotesPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/flashcards" element={
                      <ErrorBoundary componentName="FlashcardPage">
                        <Suspense fallback={<div>Loading flashcards...</div>}>
                          <FlashcardPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/tasks" element={
                      <ErrorBoundary componentName="TasksPage">
                        <Suspense fallback={<div>Loading tasks...</div>}>
                          <TasksPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/ai-chat" element={
                      <ErrorBoundary componentName="AIChatPage">
                        <Suspense fallback={<div>Loading AI chat...</div>}>
                          <AIChatPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="/antigravity" element={
                      <ErrorBoundary componentName="AntigravityPage">
                        <Suspense fallback={<div>Loading antigravity feature...</div>}>
                          <AntigravityPage />
                        </Suspense>
                      </ErrorBoundary>
                    } />
                    <Route path="*" element={
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <a href="/notes">Return to Notes</a>
                      </div>
                    } />
                  </Routes>
                </Suspense>
              </Layout.Content>
            </Layout>
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ThemeProvider>
  );
};

export default App;
