import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeOutlined, 
  PlusOutlined, 
  FolderOpenOutlined,
  ReadOutlined,
  UserOutlined,
  SettingOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  DownOutlined,
  AudioOutlined,
  UnorderedListOutlined,
  ExperimentOutlined,
  ThunderboltFilled,
  SearchOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../features/auth/context/AuthContext';
import { Button, Dropdown, Avatar, Space, Typography, Badge } from 'antd';
import './Navbar.css';

const { Text } = Typography;

const ALL_FEATURES = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠', category: 'Core' },
  { name: 'Notes', path: '/notes', icon: '📝', category: 'Core' },
  { name: 'Note Editor', path: '/notes/new', icon: '✏️', category: 'Core' },
  { name: 'Marketplace', path: '/marketplace', icon: '🛍️', category: 'Social' },
  { name: 'Teacher Dashboard', path: '/teacher', icon: '👨‍🏫', category: 'Admin' },
  { name: 'AI Tutor', path: '/ai-tutor', icon: '🤖', category: 'AI' },
  { name: 'AI Playground', path: '/playground', icon: '⚡', category: 'AI' },
  { name: 'Image Generation', path: '/image-gen', icon: '🎨', category: 'AI' },
  { name: 'Video Generation', path: '/video-gen', icon: '🎬', category: 'AI' },
  { name: 'Voice Notes', path: '/voice-notes', icon: '🎙️', category: 'Tools' },
  { name: 'OCR Scanner', path: '/ocr', icon: '📷', category: 'Tools' },
  { name: 'PDF Annotation', path: '/pdf', icon: '📄', category: 'Tools' },
  { name: 'Mind Map', path: '/mindmap', icon: '🧠', category: 'Tools' },
  { name: 'Graph View', path: '/graph', icon: '🕸️', category: 'Tools' },
  { name: 'Whiteboard', path: '/whiteboard', icon: '🖊️', category: 'Tools' },
  { name: 'Slide Maker', path: '/slides', icon: '📊', category: 'Tools' },
  { name: 'Spreadsheet', path: '/spreadsheet', icon: '📈', category: 'Tools' },
  { name: 'Spaced Repetition', path: '/spaced-repetition', icon: '🔁', category: 'Learning' },
  { name: 'Quiz Builder', path: '/quiz', icon: '❓', category: 'Learning' },
  { name: 'Learning Dashboard', path: '/learning', icon: '🎓', category: 'Learning' },
  { name: 'Tasks', path: '/tasks', icon: '✅', category: 'Productivity' },
  { name: 'Calendar', path: '/calendar', icon: '📅', category: 'Productivity' },
  { name: 'Statistics', path: '/stats', icon: '📊', category: 'Productivity' },
  { name: 'Token Shop', path: '/tokens', icon: '🪙', category: 'Billing' },
  { name: 'Subscription', path: '/subscription', icon: '💳', category: 'Billing' },
  { name: 'Settings', path: '/settings', icon: '⚙️', category: 'Account' },
  { name: 'Profile', path: '/profile', icon: '👤', category: 'Account' },
  { name: 'Notifications', path: '/notifications', icon: '🔔', category: 'Account' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setSearchQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const filteredFeatures = ALL_FEATURES.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(i => Math.min(i + 1, filteredFeatures.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredFeatures[selectedIndex]) {
      navigate(filteredFeatures[selectedIndex].path);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <HomeOutlined /> },
    { name: 'Tasks', path: '/tasks', icon: <UnorderedListOutlined /> },
    { name: 'New Session', path: '/new', icon: <PlusOutlined /> },
    { name: 'Sessions', path: '/sessions', icon: <FolderOpenOutlined /> },
    { name: 'Learning', path: '/flashcards-quizzes', icon: <ReadOutlined /> },
    { name: 'Audio', path: '/audio-tools', icon: <AudioOutlined /> },
    { name: 'Whiteboard', path: '/whiteboard', icon: <ExperimentOutlined /> },
    { name: 'Pricing', path: '/pricing', icon: <CreditCardOutlined /> },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const menuItems = [
    {
      key: 'profile-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ display: 'block' }}>{user?.displayName || 'User'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: 'Your Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/account'),
    },
    {
      key: 'subscription',
      label: 'Subscription',
      icon: <CreditCardOutlined />,
      onClick: () => navigate('/subscription'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <>
      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="qs-overlay" onClick={() => setSearchOpen(false)}>
          <div className="qs-modal" onClick={e => e.stopPropagation()}>
            <div className="qs-input-row">
              <SearchOutlined className="qs-icon" />
              <input
                ref={searchInputRef}
                className="qs-input"
                placeholder="Search features… (↑↓ to navigate, Enter to go)"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleSearchKeyDown}
              />
              <button className="qs-close" onClick={() => setSearchOpen(false)}>
                <CloseOutlined />
              </button>
            </div>
            <div className="qs-results">
              {filteredFeatures.length === 0 && (
                <div className="qs-empty">No features found for "{searchQuery}"</div>
              )}
              {filteredFeatures.map((f, i) => (
                <div
                  key={f.path}
                  className={`qs-result-item ${i === selectedIndex ? 'qs-result-active' : ''}`}
                  onClick={() => { navigate(f.path); setSearchOpen(false); setSearchQuery(''); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="qs-result-icon">{f.icon}</span>
                  <span className="qs-result-name">{f.name}</span>
                  <span className="qs-result-category">{f.category}</span>
                </div>
              ))}
            </div>
            <div className="qs-footer">
              <span>↑↓ navigate</span>
              <span>⏎ open</span>
              <span>Esc close</span>
            </div>
          </div>
        </div>
      )}

    <nav className={`navbar-root ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <ThunderboltFilled />
          </div>
          <span className="logo-text">NoteFusion<span className="logo-accent">AI</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Quick Search Trigger */}
        <button className="qs-trigger" onClick={() => { setSearchOpen(true); setSearchQuery(''); }}>
          <SearchOutlined style={{ fontSize: 14 }} />
          <span className="qs-trigger-text">Search features…</span>
          <span className="qs-trigger-kbd">Ctrl K</span>
        </button>

        {/* User Section */}
        <div className="navbar-user">
          <Space size="middle">
            <Badge dot color="#1890ff">
              <Button type="text" icon={<SettingOutlined />} style={{ color: '#666' }} />
            </Badge>
            
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <div className="user-dropdown-trigger">
                <Avatar 
                  src={user?.photoURL} 
                  icon={!user?.photoURL && <UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
                <DownOutlined style={{ fontSize: '10px', marginLeft: '4px', color: '#888' }} />
              </div>
            </Dropdown>
          </Space>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;