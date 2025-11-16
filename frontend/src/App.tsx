import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainFeatures from './components/MainFeatures';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import Whiteboard from './pages/Whiteboard';
import Payment from './pages/Payment';
import { Toaster } from 'react-hot-toast';
import './App.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

// Environment variables handling that works in both browser and Node.js
const getEnvVar = (key: string, defaultValue: string): string => {
  // Try to get from window._env_ (set in public/index.html)
  if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_[key]) {
    return (window as any)._env_[key];
  }
  
  // Try to get from process.env (for backward compatibility)
  if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`] as string;
  }
  
  // Fallback to default value
  return defaultValue;
};

// Fallback component if WebSocket fails
const FallbackApp = () => (
  <div className="min-h-screen bg-gray-100 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">NoteFusion AI</h1>
        <p className="mt-2 text-lg text-gray-600">Real-time Collaboration Demo</p>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">
            WebSocket connection failed. The app is running in fallback mode.
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Application Status</h2>
        <p className="text-gray-600">
          Backend API: {getEnvVar('REACT_APP_API_URL', 'http://localhost:8000')}
        </p>
        <p className="text-gray-600 mt-2">
          Frontend Status: ✅ Running
        </p>
        <p className="text-gray-600 mt-2">
          WebSocket Status: ❌ Connection Failed (Fallback Mode)
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Application Error</h1>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm text-red-800 overflow-auto">
              {error?.toString()}
              {error?.stack && `\n\n${error.stack}`}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Open access - no authentication required
  const isAuthenticated = () => {
    // Always return true for open access
    return true;
  };

  // Open Route Component - everyone can access
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Allow everyone to access - no login required
    return <>{children}</>;
  };

  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Suspense fallback={<FallbackApp />}>
          <WebSocketProvider>
            <Toaster position="top-right" />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/upload"
              element={
                <Layout>
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-in">
                        Upload & Generate Notes
                      </h1>
                      <p className="text-xl text-gray-600 animate-fade-in-delay">
                        Upload files and generate comprehensive study notes
                      </p>
                    </div>
                    <MainFeatures />
                  </div>
                </Layout>
              }
            />
            <Route
              path="/whiteboard"
              element={
                <Layout>
                  <Whiteboard />
                </Layout>
              }
            />
            <Route
              path="/notes"
              element={
                <Layout>
                  <Notes />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />
            <Route
              path="/payment"
              element={
                <Layout>
                  <Payment />
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WebSocketProvider>
      </Suspense>
    </BrowserRouter>
    </Elements>
  );
}

export default App;
