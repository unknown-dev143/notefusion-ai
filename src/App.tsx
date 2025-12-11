import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutsProvider } from './components/KeyboardShortcutsProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotesPage from './pages/NotesPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import MFAVerification from './components/MFAVerification';
import DashboardPage from './pages/DashboardPage';

// Mobile Components
import MobileDashboard from './components/MobileDashboard';

// Import all advanced components
import QuizSystem from './components/QuizSystem';
import StreakTracker from './components/StreakTracker';
import PresentationMode from './components/PresentationMode';
import ModuleManagement from './components/ModuleManagement';
import StudyScheduler from './components/StudyScheduler';
import SessionManager from './components/SessionManager';
import FlashcardSystem from './components/FlashcardSystem';
import VoiceRecorder from './components/VoiceRecorder';
import StudyGroups from './components/StudyGroups';
import IntegrationHub from './components/IntegrationHub';
import PDFProcessor from './components/PDFProcessor';
import AIAssistant from './components/AIAssistant';
import AINoteGenerator from './components/AINoteGenerator';
import AdvancedSearch from './components/AdvancedSearch';
import ExportSystem from './components/ExportSystem';
import TranscriptEditor from './components/TranscriptEditor';
import SocialMediaIntegration from './components/SocialMediaIntegration';
import NoteAnalytics from './components/NoteAnalytics';
import ImageGenerator from './components/ImageGenerator';
import VersionHistory from './components/VersionHistory';
import PaymentSystem from './components/PaymentSystem';
import VideoGenerator from './components/VideoGenerator';
import ScreenCapture from './components/ScreenCapture';
import VideoRecorder from './components/VideoRecorder';
import FileManager from './components/FileManager';
import TaskManager from './components/TaskManager';
import StudyTimer from './components/StudyTimer';
import Bookmarks from './components/Bookmarks';
import DashboardWidgets from './components/DashboardWidgets';
import CollaborationTools from './components/CollaborationTools';
import StudyPlanner from './components/StudyPlanner';
import ProgressTracker from './components/ProgressTracker';
import AdminDashboard from './components/AdminDashboard';
import CloudStorage from './components/CloudStorage';
import RobotAssistant from './components/RobotAssistant';
import AICodeReviewer from './components/AICodeReviewer';
import AISentimentAnalyzer from './components/AISentimentAnalyzer';
import AIDocumentSummarizer from './components/AIDocumentSummarizer';
import OfflineMode from './components/OfflineMode';
import MindMap from './components/MindMap';
import Notes from './components/Notes';
import DocumentCreator from './components/DocumentCreator';
import SubtitleGenerator from './components/SubtitleGenerator';
import VideoProcessor from './components/VideoProcessor';
import ImageProcessor from './components/ImageProcessor';
import QRCodeGenerator from './components/QRCodeGenerator';
import Profile from './components/Profile';
import AdaptiveLearningPath from './components/AdaptiveLearningPath';
import AdvancedWhiteboard from './components/AdvancedWhiteboard';
import Calendar from './components/Calendar';
import DocumentConverter from './components/DocumentConverter';
import DocumentManager from './components/DocumentManager';
import FlashcardEnhancements from './components/FlashcardEnhancements';
import Gamification from './components/Gamification';
import ImageEditor from './components/ImageEditor';
import InteractiveQuizSystem from './components/InteractiveQuizSystem';
import LearningAnalytics from './components/LearningAnalytics';
import NoteTemplates from './components/NoteTemplates';
import NotificationSettings from './components/NotificationSettings';
import PomodoroTimer from './components/PomodoroTimer';
import PresentationAnalytics from './components/PresentationAnalytics';
import PresentationCollaboration from './components/PresentationCollaboration';
import PresentationGenerator from './components/PresentationGenerator';
import PresentationNotes from './components/PresentationNotes';
import PresentationVoiceOver from './components/PresentationVoiceOver';
import SpacedRepetitionSystem from './components/SpacedRepetitionSystem';
import VoiceCommands from './components/VoiceCommands';
import VideoAnalytics from './components/VideoAnalytics';
import VideoChapters from './components/VideoChapters';
import VideoComments from './components/VideoComments';
import VideoCompression from './components/VideoCompression';
import VideoEditor from './components/VideoEditor';
import VideoThumbnails from './components/VideoThumbnails';
import VideoTranscription from './components/VideoTranscription';
import VideoWatermark from './components/VideoWatermark';
import Whiteboard from './components/Whiteboard';
import WhiteboardEnhanced from './components/WhiteboardEnhanced';
import WhiteboardExport from './components/WhiteboardExport';
import WordDocumentCreator from './components/WordDocumentCreator';

// New AI Components
import AIResearchAssistant from './components/AIResearchAssistant';
import AIContentRewriter from './components/AIContentRewriter';
import AITutor from './components/AITutor';
import AISmartScheduler from './components/AISmartScheduler';
import AIEmailAssistant from './components/AIEmailAssistant';
import AICreativitySuite from './components/AICreativitySuite';
import AIMultiModalProcessor from './components/AIMultiModalProcessor';
import AIVoiceCloning from './components/AIVoiceCloning';

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
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<Layout><Outlet /></Layout>}>
        <Route index element={<DashboardPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="notes" element={<NotesPage />} />
        
        {/* Module Management */}
        <Route path="modules" element={<ModuleManagement />} />
        <Route path="quiz" element={<QuizSystem />} />
        <Route path="streaks" element={<StreakTracker />} />
        <Route path="presentation" element={<PresentationMode />} />
        <Route path="scheduler" element={<StudyScheduler />} />
        <Route path="sessions" element={<SessionManager />} />
        <Route path="flashcards" element={<FlashcardSystem />} />
        <Route path="voice" element={<VoiceRecorder />} />
        <Route path="study-groups" element={<StudyGroups />} />
        <Route path="integrations" element={<IntegrationHub />} />
        <Route path="pdf" element={<PDFProcessor />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="ai-notes" element={<AINoteGenerator />} />
        <Route path="robot" element={<RobotAssistant />} />
        <Route path="code-review" element={<AICodeReviewer />} />
        <Route path="sentiment" element={<AISentimentAnalyzer />} />
        <Route path="summarizer" element={<AIDocumentSummarizer />} />
        <Route path="search" element={<AdvancedSearch />} />
        <Route path="export" element={<ExportSystem />} />
        <Route path="transcript" element={<TranscriptEditor />} />
        <Route path="social" element={<SocialMediaIntegration />} />
        <Route path="analytics" element={<NoteAnalytics notes={[]} />} />
        <Route path="image-gen" element={<ImageGenerator />} />
        <Route path="history" element={<VersionHistory onRestore={(content) => console.log('Restore:', content)} />} />
        <Route path="payment" element={<PaymentSystem />} />
        <Route path="video-gen" element={<VideoGenerator />} />
        <Route path="screen-capture" element={<ScreenCapture />} />
        <Route path="video-recorder" element={<VideoRecorder />} />
        <Route path="files" element={<FileManager />} />
        <Route path="tasks" element={<TaskManager />} />
        <Route path="timer" element={<StudyTimer />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="widgets" element={<DashboardWidgets />} />
        <Route path="collaboration" element={<CollaborationTools />} />
        <Route path="planner" element={<StudyPlanner />} />
        <Route path="progress" element={<ProgressTracker />} />
        <Route path="offline" element={<OfflineMode />} />
        <Route path="mindmap" element={<MindMap />} />
        
        {/* Document & Notes Features */}
        <Route path="notes-manager" element={<Notes />} />
        <Route path="document-creator" element={<DocumentCreator />} />
        <Route path="document-converter" element={<DocumentConverter />} />
        <Route path="document-manager" element={<DocumentManager />} />
        <Route path="word-docs" element={<WordDocumentCreator />} />
        <Route path="note-templates" element={<NoteTemplates onSelectTemplate={(template) => console.log('Selected template:', template)} />} />
        <Route path="subtitles" element={<SubtitleGenerator />} />
        
        {/* Learning & Study Features */}
        <Route path="adaptive-learning" element={<AdaptiveLearningPath />} />
        <Route path="learning-analytics" element={<LearningAnalytics />} />
        <Route path="spaced-repetition" element={<SpacedRepetitionSystem />} />
        <Route path="pomodoro" element={<PomodoroTimer />} />
        
        {/* Whiteboard & Creative Tools */}
        <Route path="whiteboard" element={<Whiteboard />} />
        <Route path="whiteboard-enhanced" element={<WhiteboardEnhanced />} />
        <Route path="whiteboard-export" element={<WhiteboardExport />} />
        <Route path="advanced-whiteboard" element={<AdvancedWhiteboard />} />
        
        {/* Media Processing */}
        <Route path="video-processor" element={<VideoProcessor />} />
        <Route path="video-editor" element={<VideoEditor />} />
        <Route path="video-analytics" element={<VideoAnalytics />} />
        <Route path="video-chapters" element={<VideoChapters />} />
        <Route path="video-comments" element={<VideoComments />} />
        <Route path="video-compression" element={<VideoCompression />} />
        <Route path="video-thumbnails" element={<VideoThumbnails />} />
        <Route path="video-transcription" element={<VideoTranscription />} />
        <Route path="video-watermark" element={<VideoWatermark />} />
        <Route path="image-processor" element={<ImageProcessor />} />
        <Route path="image-editor" element={<ImageEditor />} />
        
        {/* Presentation Features */}
        <Route path="presentation-analytics" element={<PresentationAnalytics />} />
        <Route path="presentation-collaboration" element={<PresentationCollaboration />} />
        <Route path="presentation-generator" element={<PresentationGenerator />} />
        <Route path="presentation-notes" element={<PresentationNotes />} />
        <Route path="presentation-voiceover" element={<PresentationVoiceOver />} />
        
        {/* Enhanced Features */}
        <Route path="flashcards-enhanced" element={<FlashcardEnhancements />} />
        <Route path="interactive-quiz" element={<InteractiveQuizSystem />} />
        <Route path="gamification" element={<Gamification />} />
        <Route path="voice-commands" element={<VoiceCommands />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="notifications" element={<NotificationSettings />} />
        
        {/* Sharing Features */}
        <Route path="qr-generator" element={<QRCodeGenerator />} />
        
        {/* Advanced AI Features */}
        <Route path="ai-research" element={<AIResearchAssistant />} />
        <Route path="ai-rewriter" element={<AIContentRewriter />} />
        <Route path="ai-tutor" element={<AITutor />} />
        <Route path="ai-scheduler" element={<AISmartScheduler />} />
        <Route path="ai-email" element={<AIEmailAssistant />} />
        <Route path="ai-creativity" element={<AICreativitySuite />} />
        <Route path="ai-multimodal" element={<AIMultiModalProcessor />} />
        <Route path="ai-voice" element={<AIVoiceCloning />} />
        
        {/* Mobile Routes */}
        <Route path="mobile-dashboard" element={<MobileDashboard />} />
        
        <Route path="payment" element={<PaymentSystem />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="cloud" element={<CloudStorage />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <KeyboardShortcutsProvider>
          <AppRoutes />
        </KeyboardShortcutsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
