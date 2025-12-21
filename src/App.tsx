import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutsProvider } from './components/KeyboardShortcutsProvider';
import { FeatureIntegrationProvider } from './contexts/FeatureIntegrationContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import SuspenseWrapper from './components/SuspenseWrapper';
import ErrorDisplay from './components/ErrorDisplay';
import PageLoader from './components/PageLoader';

// Lazy loaded components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const MFAVerification = lazy(() => import('./components/MFAVerification'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const Whiteboard = lazy(() => import('./components/Whiteboard'));
const AIContentGenerator = lazy(() => import('./components/AIContentGenerator'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const StudyPlanner = lazy(() => import('./components/StudyPlanner'));
const FlashcardSystem = lazy(() => import('./components/FlashcardSystem'));
const MindMap = lazy(() => import('./components/MindMap'));
const VideoProcessor = lazy(() => import('./components/VideoProcessor'));
const ImageGenerator = lazy(() => import('./components/ImageGenerator'));
const QuizSystem = lazy(() => import('./components/QuizSystem'));
const ModuleManagement = lazy(() => import('./components/ModuleManagement'));
const SocialMediaIntegration = lazy(() => import('./components/SocialMediaIntegration'));
const AICodeReviewer = lazy(() => import('./components/AICodeReviewer'));
const AISentimentAnalyzer = lazy(() => import('./components/AISentimentAnalyzer'));
const AIDocumentSummarizer = lazy(() => import('./components/AIDocumentSummarizer'));
const DocumentCreator = lazy(() => import('./components/DocumentCreator'));
const ImageProcessor = lazy(() => import('./components/ImageProcessor'));
const Profile = lazy(() => import('./components/Profile'));
const RobotAssistant = lazy(() => import('./components/RobotAssistant'));
const SubtitleGenerator = lazy(() => import('./components/SubtitleGenerator'));
const QRCodeGenerator = lazy(() => import('./components/QRCodeGenerator'));
const VoiceRecorder = lazy(() => import('./components/VoiceRecorder'));
const StudyScheduler = lazy(() => import('./components/StudyScheduler'));
const SessionManager = lazy(() => import('./components/SessionManager'));
const AINoteGenerator = lazy(() => import('./components/AINoteGenerator'));
const AIAdvancedSearch = lazy(() => import('./components/AIAdvancedSearch'));
const AIExportSystem = lazy(() => import('./components/AIExportSystem'));
const AITranscriptEditor = lazy(() => import('./components/AITranscriptEditor'));
const ExcelPage = lazy(() => import('./pages/ExcelPage'));
const Antigravity = lazy(() => import('./components/Antigravity'));
const AISocialIntegration = lazy(() => import('./components/AISocialIntegration'));
const AIAnalytics = lazy(() => import('./components/AIAnalytics'));
const AIImageGenerator = lazy(() => import('./components/AIImageGenerator'));
const PDFProcessor = lazy(() => import('./components/PDFProcessor'));
const VersionHistory = lazy(() => import('./components/VersionHistory'));
const StreakTracker = lazy(() => import('./components/StreakTracker'));
const PresentationMode = lazy(() => import('./components/PresentationMode'));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'));
const GamificationSystem = lazy(() => import('./components/GamificationSystem'));
const NoteMarketplace = lazy(() => import('./components/NoteMarketplace'));
const FriendsSystem = lazy(() => import('./components/FriendsSystem'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const VideoGenerator = lazy(() => import('./components/VideoGenerator'));

// Initialize feature integration
import './services/FeatureIntegrationService';

const PublicRoute = () => {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

const PrivateRoute = () => {
  const { user, mfaRequired } = useAuth();
  if (mfaRequired) {
    return <MFAVerification />;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const errorFallback = (
    <ErrorDisplay
      title="Page Load Error"
      message="Failed to load this page. Please try again."
      showRetry={true}
      showHome={true}
    />
  );

  const loadingFallback = (
    <PageLoader
      message="Loading page..."
      showLogo={true}
      size="large"
    />
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route 
            path="/login" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <Login />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <Signup />
              </SuspenseWrapper>
            } 
          />
        </Route>

        <Route element={<Layout><Outlet /></Layout>}>
          <Route 
            index 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <DashboardPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="home" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <HomePage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="about" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AboutPage />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="notes" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <NotesPage />
              </SuspenseWrapper>
            } 
          />
          
          {/* Whiteboard & Creative Tools */}
          <Route 
            path="whiteboard" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <Whiteboard />
              </SuspenseWrapper>
            } 
          />
          
          {/* Excel Spreadsheet */}
          <Route 
            path="excel" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <ExcelPage />
              </SuspenseWrapper>
            } 
          />
          
          {/* Advanced AI Features */}
          <Route 
            path="ai" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIAssistant />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai-generator" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIContentGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="antigravity" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <Antigravity />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="admin" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <ProtectedAdminRoute />
              </SuspenseWrapper>
            } 
          />
          
          {/* Calendar & Scheduling */}
          <Route 
            path="calendar" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <CalendarPage />
              </SuspenseWrapper>
            } 
          />
          
          {/* Study & Learning Tools */}
          <Route 
            path="study" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <StudyPlanner />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="flashcards" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <FlashcardSystem />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="mindmap" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <MindMap />
              </SuspenseWrapper>
            } 
          />
          
          {/* Media & Content Tools */}
          <Route 
            path="video" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <VideoProcessor />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="images" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <ImageGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="video-generator" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <VideoGenerator />
              </SuspenseWrapper>
            } 
          />
          
          {/* Learning & Assessment */}
          <Route 
            path="quiz" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <QuizSystem />
              </SuspenseWrapper>
            } 
          />
          
          {/* Course Management */}
          <Route 
            path="modules" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <ModuleManagement />
              </SuspenseWrapper>
            } 
          />
          
          {/* Social & Sharing */}
          <Route 
            path="social" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <SocialMediaIntegration />
              </SuspenseWrapper>
            } 
          />
          
          {/* AI Tools */}
          <Route 
            path="code-review" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AICodeReviewer />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="sentiment" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AISentimentAnalyzer />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="summarizer" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIDocumentSummarizer />
              </SuspenseWrapper>
            } 
          />
          
          {/* Content Tools */}
          <Route 
            path="document-creator" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <DocumentCreator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="image-processor" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <ImageProcessor />
              </SuspenseWrapper>
            } 
          />
          
          {/* Additional Content Tools */}
          <Route 
            path="robot" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <RobotAssistant />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="subtitles" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <SubtitleGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="video-processor" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <VideoProcessor />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="qr-generator" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <QRCodeGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="voice-recorder" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <VoiceRecorder />
              </SuspenseWrapper>
            } 
          />
          
          {/* Additional Dashboard Features */}
          <Route 
            path="study" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <StudyScheduler />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="sessions" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <SessionManager />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/generator" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AINoteGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/search" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIAdvancedSearch />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/export" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIExportSystem />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/transcript" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AITranscriptEditor />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/social" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AISocialIntegration />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/analytics" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIAnalytics />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="ai/image" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AIImageGenerator />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="pdf" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <PDFProcessor />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="history" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <VersionHistory 
                  onRestore={(content: string) => {
                    console.log('Restoring content:', content);
                  }}
                />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="streak" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <StreakTracker />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="presentation" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <PresentationMode />
              </SuspenseWrapper>
            } 
          />
          
          {/* Gamification & Social Features */}
          <Route 
            path="achievements" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <GamificationSystem />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="marketplace" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <NoteMarketplace />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="friends" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <FriendsSystem />
              </SuspenseWrapper>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                <AnalyticsDashboard />
              </SuspenseWrapper>
            } 
          />
          
          <Route element={<PrivateRoute />}>
            <Route 
              path="settings" 
              element={
                <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                  <SettingsPage />
                </SuspenseWrapper>
              } 
            />
            <Route 
              path="profile" 
              element={
                <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
                  <Profile />
                </SuspenseWrapper>
              } 
            />
          </Route>
        </Route>
        
        <Route 
          path="*" 
          element={
            <SuspenseWrapper fallback={loadingFallback} errorFallback={errorFallback}>
              <NotFoundPage />
            </SuspenseWrapper>
          } 
        />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  const globalErrorFallback = (
    <ErrorDisplay
      title="Application Error"
      message="A critical error occurred in the application. Please refresh the page or contact support if the problem persists."
      showRetry={true}
      showHome={true}
      showReport={true}
      type="error"
    />
  );

  return (
    <ErrorBoundary fallback={globalErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <KeyboardShortcutsProvider>
            <FeatureIntegrationProvider>
              <AppRoutes />
            </FeatureIntegrationProvider>
          </KeyboardShortcutsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
