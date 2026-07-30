import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProgressionProvider } from './contexts/ProgressionContext';
import { NoteProvider } from './features/notes/context/NoteContext';
import { NotificationProvider } from './features/notifications/context/NotificationContext';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainFeatures from './components/MainFeatures';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import Whiteboard from './pages/Whiteboard';
import Payment from './pages/Payment';
import ExamStage from './pages/ExamStage';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Lazy load all the missing pages
const DailyNotes = React.lazy(() => import('./pages/DailyNotes'));
const VoiceNotes = React.lazy(() => import('./pages/VoiceNotes'));
const WebClipper = React.lazy(() => import('./pages/WebClipper'));
const PDFAnnotation = React.lazy(() => import('./pages/PDFAnnotation'));
const OCRScanner = React.lazy(() => import('./pages/OCRScanner'));
const BlockReferences = React.lazy(() => import('./pages/BlockReferences'));
const VersionHistory = React.lazy(() => import('./pages/VersionHistory'));
const SpacedRepetition = React.lazy(() => import('./pages/SpacedRepetition'));
const SlideMaker = React.lazy(() => import('./pages/SlideMaker'));
const KaggleHub = React.lazy(() => import('./pages/KaggleHub'));
const MindMap = React.lazy(() => import('./pages/MindMap'));
const PublishingHub = React.lazy(() => import('./pages/PublishingHub'));
const GraphView = React.lazy(() => import('./pages/GraphView'));
const ExploreHUDPage = React.lazy(() => import('./pages/ExploreHUDPage'));
const TasksPage = React.lazy(() => import('./pages/TasksPage'));
const RemindersPage = React.lazy(() => import('./pages/RemindersPage'));
const LearningDashboard = React.lazy(() => import('./pages/LearningDashboard'));
const TestingHub = React.lazy(() => import('./pages/TestingHub'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const AITutor = React.lazy(() => import('./pages/AITutor'));
const ImageGeneration = React.lazy(() => import('./pages/ImageGeneration'));
const VideoGeneration = React.lazy(() => import('./pages/VideoGeneration'));
const AudioDemo = React.lazy(() => import('./pages/AudioDemo'));
const FusionLab = React.lazy(() => import('./pages/FusionLab'));
const SocraticTutorPage = React.lazy(() => import('./pages/SocraticTutorPage'));
const ExaminerPage = React.lazy(() => import('./pages/ExaminerPage'));
const ArchitectPage = React.lazy(() => import('./pages/ArchitectPage'));
const LogicDebaterPage = React.lazy(() => import('./pages/LogicDebaterPage'));
const CreativeMusePage = React.lazy(() => import('./pages/CreativeMusePage'));
const Spreadsheet = React.lazy(() => import('./pages/Spreadsheet'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'));
const EcosystemHub = React.lazy(() => import('./pages/EcosystemHub'));
const AIPortal = React.lazy(() => import('./pages/AIPortal'));
const TokenShop = React.lazy(() => import('./pages/TokenShop'));
const BackupExportPage = React.lazy(() => import('./pages/BackupExportPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const NoteEditor = React.lazy(() => import('./pages/NoteEditor'));
const PublicSiteView = React.lazy(() => import('./pages/PublicSiteView'));
const AIPlayground = React.lazy(() => import('./pages/AIPlayground'));
const QuizBuilder = React.lazy(() => import('./pages/QuizBuilder'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const FeatureFlagsPage = React.lazy(() => import('./pages/FeatureFlagsPage'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const NoteMarketplace = React.lazy(() => import('./pages/NoteMarketplace'));
const SharedNoteView = React.lazy(() => import('./pages/SharedNoteView'));
const GoogleSuccess = React.lazy(() => import('./pages/GoogleSuccess'));

const stripePromise = loadStripe(
  (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key'
);
const queryClient = new QueryClient();

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
  
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-red-500/30 text-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4">Neural Link Disrupted</h2>
        <p className="text-gray-400 mb-6 text-sm">
          A localized anomaly occurred in the interface matrix. 
          {error?.message && <span className="block mt-2 font-mono text-xs bg-gray-900 p-2 rounded text-red-400">{error.message}</span>}
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  );

  // Teacher Route Component - only teachers can access
  const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <FallbackApp />;
    
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Elements stripe={stripePromise}>
          <BrowserRouter>
            <Suspense fallback={<FallbackApp />}>
              <AuthProvider>
                <ThemeProvider>
                  <LanguageProvider>
                    <ProgressionProvider>
                      <NoteProvider>
                        <NotificationProvider>
                          <WebSocketProvider>
                            <Toaster position="top-right" />
                            <ErrorBoundary FallbackComponent={ErrorFallback}>
                              <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/playground" element={<AIPlayground />} />
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
              path="/notes/new"
              element={
                <Layout>
                  <NoteEditor />
                </Layout>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <Layout>
                  <NoteEditor />
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
            {/* Public route without Layout */}
            <Route path="/public/:slug" element={<PublicSiteView />} />

            <Route
              path="/payment"
              element={
                <Layout>
                  <Payment />
                </Layout>
              }
            />
            <Route
              path="/exam"
              element={
                <Layout>
                  <ExamStage />
                </Layout>
              }
            />
            {/* Added missing routes for Tools Box and AI Tools */}
            <Route path="/daily-notes" element={<Layout><DailyNotes /></Layout>} />
            <Route path="/voice-notes" element={<Layout><VoiceNotes /></Layout>} />
            <Route path="/web-clipper" element={<Layout><WebClipper /></Layout>} />
            <Route path="/pdf-annotation" element={<Layout><PDFAnnotation /></Layout>} />
            <Route path="/ocr-scanner" element={<Layout><OCRScanner /></Layout>} />
            <Route path="/block-references" element={<Layout><BlockReferences /></Layout>} />
            <Route path="/version-history" element={<Layout><VersionHistory /></Layout>} />
            <Route path="/spaced-repetition" element={<Layout><SpacedRepetition /></Layout>} />
            <Route path="/slide-maker" element={<Layout><SlideMaker /></Layout>} />
            <Route path="/kaggle" element={<Layout><KaggleHub /></Layout>} />
            <Route path="/mind-map" element={<Layout><MindMap /></Layout>} />
            <Route path="/publishing" element={<Layout><PublishingHub /></Layout>} />
            <Route path="/graph" element={<Layout><GraphView /></Layout>} />
            <Route path="/explore-hud" element={<Layout><ExploreHUDPage /></Layout>} />
            <Route path="/tasks" element={<Layout><TasksPage /></Layout>} />
            <Route path="/reminders" element={<Layout><RemindersPage /></Layout>} />
            <Route path="/study" element={<Layout><LearningDashboard /></Layout>} />
            <Route path="/testing" element={<Layout><TestingHub /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
            <Route path="/ai-tutor" element={<Layout><AITutor /></Layout>} />
            <Route path="/teacher" element={<TeacherRoute><Layout><TeacherDashboard /></Layout></TeacherRoute>} />
            <Route path="/image-generation" element={<Layout><ImageGeneration /></Layout>} />
            <Route path="/video-generation" element={<Layout><VideoGeneration /></Layout>} />
            <Route path="/audio-demo" element={<Layout><AudioDemo /></Layout>} />
            <Route path="/fusion-lab" element={<Layout><FusionLab /></Layout>} />
            <Route path="/socratic-tutor" element={<Layout><SocraticTutorPage /></Layout>} />
            <Route path="/examiner" element={<Layout><ExaminerPage /></Layout>} />
            <Route path="/architect" element={<Layout><ArchitectPage /></Layout>} />
            <Route path="/logic-debater" element={<Layout><LogicDebaterPage /></Layout>} />
            <Route path="/creative-muse" element={<Layout><CreativeMusePage /></Layout>} />
            <Route path="/spreadsheet" element={<Layout><Spreadsheet /></Layout>} />
            <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
            <Route path="/statistics" element={<Layout><StatisticsPage /></Layout>} />
            <Route path="/ecosystem" element={<Layout><EcosystemHub /></Layout>} />
            <Route path="/ai-portal" element={<Layout><AIPortal /></Layout>} />
            <Route path="/token-shop" element={<Layout><TokenShop /></Layout>} />
            <Route path="/backup" element={<Layout><BackupExportPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
            <Route path="/marketplace" element={<Layout><NoteMarketplace /></Layout>} />
            <Route path="/shared/:token" element={<SharedNoteView />} />
            <Route path="/auth/google/success" element={<GoogleSuccess />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                              </Routes>
                            </ErrorBoundary>
                          </WebSocketProvider>
                        </NotificationProvider>
                      </NoteProvider>
                    </ProgressionProvider>
                  </LanguageProvider>
                </ThemeProvider>
              </AuthProvider>
            </Suspense>
          </BrowserRouter>
        </Elements>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
