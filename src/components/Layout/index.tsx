import React, { useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Button, Typography, Space, Badge, Input, List, Drawer, Menu } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  BulbOutlined,
  CreditCardOutlined,
  BellOutlined,
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  RobotOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  EditOutlined,
  TranslationOutlined,
  QrcodeOutlined,
  CloudOutlined,
  SafetyOutlined,
  CodeOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Layout.css';

const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user: authUser, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Real search implementation - search through localStorage data
    const searchResults: any[] = [];

    // Search notes
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    savedNotes.forEach((note: any) => {
      if (note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()) ||
          note.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))) {
        searchResults.push({
          type: 'note',
          title: note.title,
          url: `/notes/${note.id}`,
          description: note.content.substring(0, 100) + '...',
          tags: note.tags
        });
      }
    });

    // Search bookmarks
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    bookmarks.forEach((bookmark: any) => {
      if (bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.description.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))) {
        searchResults.push({
          type: 'bookmark',
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          tags: bookmark.tags
        });
      }
    });

    // Search video gallery
    const videoGallery = JSON.parse(localStorage.getItem('videoGallery') || '[]');
    videoGallery.forEach((video: any) => {
      if (video.name.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          type: 'video',
          title: video.name,
          url: '/video-editor',
          description: `Duration: ${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}`,
          createdAt: video.createdAt
        });
      }
    });

    // Search image gallery
    const imageGallery = JSON.parse(localStorage.getItem('imageGallery') || '[]');
    imageGallery.forEach((image: any) => {
      if (image.name.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({
          type: 'image',
          title: image.name,
          url: '/image-editor',
          description: `Edited image with filters applied`,
          createdAt: image.createdAt
        });
      }
    });

    // Add static pages that are always available
    const staticPages = [
      { type: 'ai', title: 'AI Assistant', url: '/ai', description: 'Get help from AI assistant' },
      { type: 'robot', title: 'Robot Assistant', url: '/robot', description: 'Advanced robot automation and analysis tools' },
      { type: 'code', title: 'AI Code Reviewer', url: '/code-review', description: 'AI-powered code analysis and review' },
      { type: 'sentiment', title: 'AI Sentiment Analyzer', url: '/sentiment', description: 'Analyze text sentiment and emotions' },
      { type: 'summarizer', title: 'AI Document Summarizer', url: '/summarizer', description: 'AI-powered document summarization' },
      { type: 'whiteboard', title: 'Collaborative Whiteboard', url: '/whiteboard', description: 'Draw and collaborate in real-time' },
      { type: 'flashcard', title: 'Flashcards', url: '/flashcards', description: 'Study with interactive flashcards' },
      { type: 'mindmap', title: 'Mind Maps', url: '/mindmap', description: 'Create visual mind maps' },
      { type: 'quiz', title: 'Quiz System', url: '/quiz', description: 'Test your knowledge' },
      { type: 'calendar', title: 'Calendar', url: '/calendar', description: 'Manage your schedule' },
      { type: 'notes', title: 'Notes Manager', url: '/notes-manager', description: 'Advanced notes management system' },
      { type: 'document', title: 'Document Creator', url: '/document-creator', description: 'Create professional documents' },
      { type: 'subtitles', title: 'Subtitle Generator', url: '/subtitles', description: 'Generate and edit video subtitles' },
      { type: 'video', title: 'Video Processor', url: '/video-processor', description: 'Process and edit videos' },
      { type: 'image', title: 'Image Processor', url: '/image-processor', description: 'Process and edit images' },
      { type: 'qr', title: 'QR Code Generator', url: '/qr-generator', description: 'Generate QR codes for sharing' }
    ];

    staticPages.forEach(page => {
      if (page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.description.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push(page);
      }
    });

    setSearchResults(searchResults);
    setShowSearchResults(true);
  };

  // Don't show layout for auth pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return <>{children}</>;
  }

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    
    // Ctrl/Cmd + K focuses search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchRef.current?.querySelector('input')?.focus();
    }
    
    // Alt + M toggles mobile menu
    if (e.altKey && e.key === 'm') {
      e.preventDefault();
      setMobileMenuOpen(prev => !prev);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      // Focus first menu item when drawer opens
      const firstMenuItem = document.querySelector('.ant-drawer .ant-menu-item');
      firstMenuItem?.querySelector('a')?.focus();
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'home',
                    icon: <HomeOutlined />,
                    label: 'Dashboard',
                    onClick: () => navigate('/')
                  },
                  {
                    key: 'settings',
                    icon: <SettingOutlined />,
                    label: 'Settings',
                    onClick: () => navigate('/settings')
                  },
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'User Profile',
                    onClick: () => navigate('/profile')
                  }
                ]
              }}
              trigger={['click']}
              placement="bottomLeft"
            >
              <Link to="/" style={{ cursor: 'pointer' }}>
                <Space>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: 'white', lineHeight: '1' }}>
                      NoteFusion
                    </div>
                    <div style={{ fontSize: '10px', color: '#1890ff', lineHeight: '1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      AI Powered
                    </div>
                  </div>
                </Space>
              </Link>
            </Dropdown>
          </div>
          <div className="header-actions">
            <div ref={searchRef} style={{ position: 'relative' }}>
              <Input.Search
                placeholder="Search features... (Ctrl+K)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={performSearch}
                onFocus={() => {
                  if (searchValue) {
                    setShowSearchResults(true);
                  }
                }}
                aria-label="Search features and content"
                aria-describedby="search-help"
              />
              <span id="search-help" className="sr-only">
                Press Ctrl+K to focus search, or type to search
              </span>
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  <List
                    dataSource={searchResults}
                    renderItem={(item) => (
                      <List.Item
                        onClick={() => {
                          navigate(item.path);
                          setSearchValue('');
                          setShowSearchResults(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <List.Item.Meta
                          avatar={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
            <Badge count={5} size="small">
              <Button icon={<BellOutlined />} />
            </Badge>
          </div>
          <nav>
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                className="mobile-menu-button"
                style={{ color: 'white' }}
                title="Menu (Alt+M)"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              />
            )}
            
            {/* Theme Toggle */}
            <Button
              type="text"
              icon={<BulbOutlined />}
              onClick={toggleTheme}
              style={{ color: 'white' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            
            {/* User Dropdown */}
            {authUser ? (
              <Dropdown 
                menu={{
                  items: [
                    {
                      key: 'payment',
                      icon: <CreditCardOutlined />,
                      label: 'Payment & Billing',
                      onClick: () => navigate('/payment')
                    },
                    {
                      key: 'settings',
                      icon: <SettingOutlined />,
                      label: 'Settings',
                      onClick: () => navigate('/settings')
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Logout',
                      onClick: logout
                    }
                  ]
                }}
                trigger={['click']}
              >
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <Avatar 
                    src={authUser.avatar} 
                    icon={!authUser.avatar ? <UserOutlined /> : undefined}
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{ color: 'white', marginRight: 8 }}>{authUser.name || authUser.email}</Text>
                  <DownOutlined style={{ color: 'white' }} />
                </div>
              </Dropdown>
            ) : (
              <Space>
                <Button type="text">
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
                <Button type="primary">
                  <Link to="/signup">
                    Sign Up
                  </Link>
                </Button>
              </Space>
            )}
          </nav>
        </header>
        <main className="app-main">
          {children}
        </main>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} NoteFusion AI. All rights reserved.</p>
        </footer>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        id="mobile-navigation-drawer"
        title="Navigation"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        bodyStyle={{ padding: 0 }}
        aria-label="Mobile navigation menu"
        rootClassName="mobile-navigation-drawer"
      >
        <Menu mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/notes" icon={<BookOutlined />}>
            <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>Notes</Link>
          </Menu.Item>
          <Menu.Item key="/flashcards">
            <Link to="/flashcards" onClick={() => setMobileMenuOpen(false)}>Flashcards</Link>
          </Menu.Item>
          <Menu.Item key="/quiz">
            <Link to="/quiz" onClick={() => setMobileMenuOpen(false)}>Quiz</Link>
          </Menu.Item>
          <Menu.Item key="/mindmap" icon={<BranchesOutlined />}>
            <Link to="/mindmap" onClick={() => setMobileMenuOpen(false)}>Mind Map</Link>
          </Menu.Item>
          <Menu.Item key="/whiteboard">
            <Link to="/whiteboard" onClick={() => setMobileMenuOpen(false)}>Whiteboard</Link>
          </Menu.Item>
          <Menu.Item key="/study-groups" icon={<TeamOutlined />}>
            <Link to="/study-groups" onClick={() => setMobileMenuOpen(false)}>Study Groups</Link>
          </Menu.Item>
          <Menu.Item key="/calendar">
            <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendar</Link>
          </Menu.Item>
          
          <Menu.Divider />
          
          <Menu.Item key="/ai" icon={<RobotOutlined />}>
            <Link to="/ai" onClick={() => setMobileMenuOpen(false)}>AI Assistant</Link>
          </Menu.Item>
          <Menu.Item key="/robot" icon={<RobotOutlined />}>
            <Link to="/robot" onClick={() => setMobileMenuOpen(false)}>Robot Assistant</Link>
          </Menu.Item>
          <Menu.Item key="/code-review" icon={<CodeOutlined />}>
            <Link to="/code-review" onClick={() => setMobileMenuOpen(false)}>Code Review</Link>
          </Menu.Item>
          <Menu.Item key="/sentiment" icon={<ThunderboltOutlined />}>
            <Link to="/sentiment" onClick={() => setMobileMenuOpen(false)}>Sentiment</Link>
          </Menu.Item>
          <Menu.Item key="/summarizer" icon={<FileTextOutlined />}>
            <Link to="/summarizer" onClick={() => setMobileMenuOpen(false)}>Summarizer</Link>
          </Menu.Item>
          <Menu.Item key="/image-processor" icon={<PictureOutlined />}>
            <Link to="/image-processor" onClick={() => setMobileMenuOpen(false)}>Images</Link>
          </Menu.Item>
          <Menu.Item key="/video-processor" icon={<VideoCameraOutlined />}>
            <Link to="/video-processor" onClick={() => setMobileMenuOpen(false)}>Videos</Link>
          </Menu.Item>
          <Menu.Item key="/subtitles" icon={<TranslationOutlined />}>
            <Link to="/subtitles" onClick={() => setMobileMenuOpen(false)}>Subtitles</Link>
          </Menu.Item>
          
          <Menu.Divider />
          
          <Menu.Item key="/document-creator" icon={<EditOutlined />}>
            <Link to="/document-creator" onClick={() => setMobileMenuOpen(false)}>Documents</Link>
          </Menu.Item>
          <Menu.Item key="/notes-manager" icon={<EditOutlined />}>
            <Link to="/notes-manager" onClick={() => setMobileMenuOpen(false)}>Notes Manager</Link>
          </Menu.Item>
          <Menu.Item key="/qr-generator" icon={<QrcodeOutlined />}>
            <Link to="/qr-generator" onClick={() => setMobileMenuOpen(false)}>QR Codes</Link>
          </Menu.Item>
          <Menu.Item key="/tasks">
            <Link to="/tasks" onClick={() => setMobileMenuOpen(false)}>Tasks</Link>
          </Menu.Item>
          
          <Menu.Divider />
          
          <Menu.Item key="/cloud" icon={<CloudOutlined />}>
            <Link to="/cloud" onClick={() => setMobileMenuOpen(false)}>Cloud Storage</Link>
          </Menu.Item>
          <Menu.Item key="/payment" icon={<CreditCardOutlined />}>
            <Link to="/payment" onClick={() => setMobileMenuOpen(false)}>Payment</Link>
          </Menu.Item>
          {authUser?.role === 'admin' && (
            <Menu.Item key="/admin" icon={<SafetyOutlined />}>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            </Menu.Item>
          )}
        </Menu>
      </Drawer>
    </>
  );

};

export default Layout;
