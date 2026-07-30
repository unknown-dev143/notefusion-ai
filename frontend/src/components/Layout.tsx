import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import { authApi } from '../api';
import GoogleAuth from './GoogleAuth';
import WalletHub from './WalletHub';
import NotificationBadge from '../features/notifications/components/NotificationBadge';
import AdvancedSearch from './AdvancedSearch';
import CaptureHub from './CaptureHub';
import QuickCapture from './QuickCapture';
import CommandPalette from './CommandPalette';
import KeyboardShortcuts from './KeyboardShortcuts';

import { SimpleThemeToggle } from './SimpleThemeToggle';
import { FloatingThemeToggle } from './FloatingThemeToggle';
import PWAInstallPrompt from './PWAInstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import EmaCopilot from './NeuralCopilot';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedLogo from './layout/AnimatedLogo';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/context/AuthContext';
import GamificationOverlay from './GamificationOverlay';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useWebSocket();
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      alert(" To install on iPhone: Tap 'Share' icon below, then scroll down to 'Add to Home Screen'.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (⌘K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Quick Search (⌘/)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // New Note (⌘N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/notes');
      }
      // Graph View (⌘G)
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        navigate('/graph');
      }
      // Tasks (⌘T)
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        navigate('/tasks');
      }
      // Keyboard Shortcuts (?)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
      // Settings (⌘,)
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }
      // Save (⌘S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        toast.success(t('saveSuccess') || 'Project state synchronized to cloud');
      }
      // Screenshot (⌘Shift S)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toast('Capturing neural snapshot...', { icon: '📸' });
      }
      // Export (⌘E)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        navigate('/upload');
        toast('Opening Export Console', { icon: '📤' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    navigate('/dashboard');
  };

  const baseNavigation = [
    { name: 'Neural Commander', path: '/dashboard', icon: '📊', category: 'Workspace' },
    { name: 'Classic Workspace', path: '/workspace', icon: '🏠', category: 'Workspace' },
    { name: t('upload'), path: '/upload', icon: '📤', category: 'Workspace' },
    { name: t('whiteboard'), path: '/whiteboard', icon: '🖊️', category: 'Creative' },
    { name: t('notes'), path: '/notes', icon: '📝', category: 'Workspace' },
    { name: 'Daily Notes', path: '/daily-notes', icon: '📅', category: 'Productivity' },
    { name: 'Voice Notes', path: '/voice-notes', icon: '🎤', category: 'Productivity' },
    { name: 'Web Clipper', path: '/web-clipper', icon: '✂️', category: 'Productivity' },
    { name: 'PDF Annotation', path: '/pdf-annotation', icon: '📄', category: 'Tools' },
    { name: 'OCR Scanner', path: '/ocr-scanner', icon: '📷', category: 'Tools' },
    { name: 'Block Refs', path: '/block-references', icon: '🔗', category: 'Productivity' },
    { name: 'Versions', path: '/version-history', icon: '🕒', category: 'Tools' },
    { name: 'Spaced Rep', path: '/spaced-repetition', icon: '🧠', category: 'Study' },
    { name: 'Slide Maker', path: '/slide-maker', icon: '📽️', category: 'Tools' },
    { name: 'Kaggle Nexus', path: '/kaggle', icon: '📊', category: 'Tools' },
    { name: 'Mind Map', path: '/mind-map', icon: '🌀', category: 'Creative' },
    { name: 'Public Site', path: '/publishing', icon: '🌍', category: 'Tools' },
    { name: t('graph'), path: '/graph', icon: '💎', category: 'Insights' },
    { name: 'Explore HUD', path: '/explore-hud', icon: '🔍', category: 'Insights' },
    { name: t('tasks'), path: '/tasks', icon: '✅', category: 'Productivity' },
    { name: 'Reminders', path: '/reminders', icon: '⏰', category: 'Productivity' },
    { name: 'Study', path: '/study', icon: '⏲️', category: 'Study' },
    { name: 'Testing Hub', path: '/testing', icon: '🎯', category: 'System' },
    { name: 'Notifications', path: '/notifications', icon: '🔔', category: 'System' },
    { name: t('aiTutor'), path: '/ai-tutor', icon: '👨‍🏫', category: 'AI Magic' },
    { name: 'Images', path: '/image-generation', icon: '🖼️', category: 'AI Magic' },
    { name: 'Video', path: '/video-generation', icon: '🎥', category: 'AI Magic' },
    { name: 'Audio', path: '/audio-demo', icon: '🎵', category: 'AI Magic' },
    { name: 'Fusion Lab', path: '/fusion-lab', icon: '🔥', category: 'AI Magic' },
    { name: 'Socratic Tutor', path: '/socratic-tutor', icon: '🤖', category: 'AI Magic' },
    { name: 'Examiner', path: '/examiner', icon: '📝', category: 'AI Magic' },
    { name: 'Architect', path: '/architect', icon: '🏗️', category: 'AI Magic' },
    { name: 'Logic Debater', path: '/logic-debater', icon: '⚖️', category: 'AI Magic' },
    { name: 'Creative Muse', path: '/creative-muse', icon: '💡', category: 'AI Magic' },
    { name: 'Sheets', path: '/spreadsheet', icon: '📊', category: 'Tools' },
    { name: t('calendar'), path: '/calendar', icon: '📅', category: 'Productivity' },
    { name: 'Statistics', path: '/statistics', icon: '📈', category: 'Insights' },
    { name: 'Ecosystem', path: '/ecosystem', icon: '🌐', category: 'Community' },
    { name: 'AI Portal', path: '/ai-portal', icon: '🌌', category: 'AI Magic' },
    { name: 'Token Shop', path: '/token-shop', icon: '🪙', category: 'Productivity' },
    { name: 'Backup', path: '/backup', icon: '💾', category: 'System' },
    { name: 'Marketplace', path: '/marketplace', icon: '🛍️', category: 'Community' },
  ];

  const navigation = user?.role === 'teacher' || user?.role === 'admin' 
    ? [{ name: 'Teacher Console', path: '/teacher', icon: '👨‍🏫', category: 'Workspace' }, ...baseNavigation]
    : baseNavigation;

  const Breadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
        {paths.map((p, i) => (
          <React.Fragment key={p}>
            <span>/</span>
            <Link 
              to={`/${paths.slice(0, i + 1).join('/')}`}
              className={i === paths.length - 1 ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              {p.replace('-', ' ')}
            </Link>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'} transition-colors duration-500 font-sans selection:bg-blue-600 selection:text-white noise-bg`}>
      {/* Navigation Bar - Glassmorphism */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        resolvedTheme === 'dark' 
          ? 'bg-slate-950/80 border-slate-800' 
          : 'bg-white/80 border-slate-200'
      } backdrop-blur-xl animate-slide-down`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <AnimatedLogo size={40} className="group-hover:scale-110 transition-transform" />
              <span className="text-lg font-[800] tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                NoteFusion<span className="text-blue-600">AI</span>
              </span>
            </Link>

            {/* Search Bar - Now more prominent and accessible on mobile icons */}
            <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
              <div 
                className="max-w-lg w-full lg:max-w-xs cursor-pointer group"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors">🔍</span>
                  </div>
                  <div className={`flex w-full pl-10 pr-3 py-2.5 border rounded-2xl leading-5 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-slate-900/50 border-slate-700 text-slate-300' 
                      : 'bg-white border-slate-200 text-slate-500'
                  } group-hover:ring-4 group-hover:ring-blue-500/10 group-hover:border-blue-500 transition-all sm:text-sm font-semibold items-center justify-between ai-sparkle`}>
                    <span className="truncate">Deep Search notes...</span>
                    <span className="text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-lg tracking-widest uppercase ml-2 shadow-lg shadow-blue-500/20">AI</span>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 hidden lg:flex items-center">
                    <kbd className="inline-block px-1.5 py-0.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold shadow-sm">
                      ⌘ K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Categorized Dropdowns */}
            <div className="hidden xl:flex items-center space-x-2 ml-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  isActive('/dashboard')
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:bg-slate-100 hover:scale-[1.02]'
                }`}
              >
                <span className="text-lg">🏠</span>
                <span className="font-bold text-sm">Home</span>
              </Link>

              {/* Tools Dropdown */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm flex items-center gap-2 transition-all group-hover:bg-slate-100`}>
                  <span>🧰</span> Tools <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`absolute top-full left-0 mt-1 w-64 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-2xl rounded-2xl border p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[100]`}>
                   <div className="grid grid-cols-1 gap-1">
                      {navigation.filter(i => ['Productivity', 'Tools', 'Workspace'].includes(i.category!) && i.name !== 'Home' && i.name !== 'Classic Workspace').map(item => (
                        <Link key={item.path} to={item.path} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                          <span className="text-base">{item.icon}</span> {item.name}
                        </Link>
                      ))}
                      <Link to="/ecosystem" className="mt-2 text-center text-xs font-black text-blue-600 hover:underline py-2">View All Resources →</Link>
                   </div>
                </div>
              </div>

              {/* AI Dropdown */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 font-black text-sm flex items-center gap-2 transition-all shadow-sm border border-blue-100 holographic neon-blue`}>
                   AI Labs <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`absolute top-full right-0 mt-1 w-64 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-2xl rounded-2xl border p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[100]`}>
                   <div className="grid grid-cols-1 gap-1">
                      <div className="px-3 py-1 mb-1"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Features</span></div>
                      {navigation.filter(i => i.category === 'AI Magic').map(item => (
                        <Link key={item.path} to={item.path} className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50/50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                          <span className="text-base">{item.icon}</span> {item.name}
                        </Link>
                      ))}
                   </div>
                </div>
              </div>

              <Link
                to="/graph"
                className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  isActive('/graph')
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">💎</span>
                <span className="font-bold text-sm">Graph</span>
              </Link>

              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  isActive('/marketplace')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <span className="text-lg">🛍️</span>
                <span className="font-bold text-sm">Marketplace</span>
              </Link>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-2">

              <div className="hidden sm:flex items-center space-x-1">
                <WalletHub />
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <NotificationBadge />
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <SimpleThemeToggle size="medium" />
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

              {/* User Dropdown */}
              <div className="relative mr-2">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center hover:shadow-md transition-all overflow-hidden"
                >
                  <img src={`https://ui-avatars.com/api/?name=${user?.name || user?.username || 'User'}&background=random`} alt="Avatar" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className={`fixed inset-0 z-10`} onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className={`absolute right-0 mt-3 w-56 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl border z-20 overflow-hidden animate-dropdown p-2`}>
                       <div className={`px-3 py-2 border-b ${resolvedTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'} mb-2`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Account</p>
                          <p className="text-sm font-bold text-slate-800">{user?.role === 'teacher' ? 'Professor / Instructor' : 'Premium Scholar'}</p>
                       </div>
                       {(user?.role === 'teacher' || user?.role === 'admin') && (
                         <Link to="/teacher" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors mb-1">
                            <span className="text-lg">👨‍🏫</span> Teacher Console
                         </Link>
                       )}
                       <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors">
                          <span className="text-lg text-slate-400">👤</span> My Profile
                       </Link>
                       <Link to="/subscription" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors">
                          <span className="text-lg text-slate-400">💎</span> Subscription
                       </Link>
                       <Link to="/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors">
                          <span className="text-lg text-slate-400">⚙️</span> Settings
                       </Link>
                       <button onClick={handleInstallApp} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-blue-600 transition-colors text-left">
                          <span className="text-lg">📲</span> Install / Add to Home
                       </button>
                       <div className="h-px bg-slate-100 my-2"></div>
                       <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-bold transition-colors text-left"
                       >
                          <span className="text-lg">🚪</span> Sign Out
                       </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                aria-label="Toggle Menu"
              >
                <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Improved Mobile/Sidebar Menu - Now categorized */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] flex animate-fade-in">
            <div className={`fixed inset-0 ${resolvedTheme === 'dark' ? 'bg-slate-950/60' : 'bg-slate-900/40'} backdrop-blur-sm`} onClick={() => setIsMenuOpen(false)}></div>
            <div className={`relative w-80 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-r border-slate-800' : 'bg-white'} shadow-2xl h-full overflow-y-auto animate-slide-right flex flex-col`}>
              <div className={`p-6 border-bottom flex items-center justify-between ${resolvedTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <span className={`text-xl font-black ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>NoteFusion AI</span>
                <button onClick={() => setIsMenuOpen(false)} className={`p-2 ${resolvedTheme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-200'} rounded-lg`}>×</button>
              </div>
              
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Workspace</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'Workspace' || i.category === 'Creative').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Productivity</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'Productivity').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">AI Magic</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'AI Magic').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Insights & Tools</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'Tools' || i.category === 'Insights' || i.category === 'System').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Study</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'Study').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 px-4">🛍️ Community</h3>
                  <div className="space-y-1">
                    {navigation.filter(i => i.category === 'Community').map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.path) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                        <span>{item.icon}</span> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 px-4">
                 <div className={`p-4 rounded-2xl ${resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} border border-slate-100`}>
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Storage Status</span>
                       <span className="text-[10px] font-bold text-blue-600">Premium</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                       <div className="w-1/3 h-full bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">1.2 GB / 5.0 GB used</p>
                 </div>
              </div>

              <div className="mt-auto p-4 border-t space-y-4">
                {/* Theme Toggle - Prominent in Mobile Menu */}
                <div className={`flex items-center justify-between p-4 ${resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-2xl border border-blue-100`}>
                  <div>
                    <p className="text-sm font-black text-slate-800">Theme Mode</p>
                    <p className="text-xs text-slate-500 font-medium">Switch appearance</p>
                  </div>
                  <SimpleThemeToggle size="large" />
                </div>
                
                <GoogleAuth />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-[calc(100vh-160px)]">
        <Breadcrumbs />
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-600'} border-t mt-16 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm">
            <p>© 2024 NoteFusion AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AdvancedSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <CaptureHub />
      <QuickCapture />
      <PWAInstallPrompt />
      <OfflineIndicator />
      <EmaCopilot />
      <GamificationOverlay />

      {/* Mobile Bottom Navigation */}
      <nav className={`sm:hidden fixed bottom-5 left-6 right-6 ${resolvedTheme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md rounded-[32px] border z-50 px-6 py-4 flex justify-between items-center shadow-2xl`}>
        <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </Link>
        <Link to="/notes" className={`flex flex-col items-center gap-1 ${isActive('/notes') ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className="text-xl">📝</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Notes</span>
        </Link>
        <div className="relative -top-8">
           <button onClick={() => navigate('/notes')} className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 border-4 border-white active:scale-95 transition-transform">
             <span className="text-2xl">➕</span>
           </button>
        </div>
        <Link to="/marketplace" className={`flex flex-col items-center gap-1 ${isActive('/marketplace') ? 'text-indigo-600' : 'text-slate-400'}`}>
          <span className="text-xl">🛍️</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Market</span>
        </Link>
        <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;

