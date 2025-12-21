import React, { useEffect, useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Button, Typography, Space, Badge, Input, List, Drawer, Menu } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  RobotOutlined,
  BranchesOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  EditOutlined,
  TeamOutlined,
  GlobalOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
  ThunderboltOutlined,
  CreditCardOutlined,
  CodeOutlined,
  TranslationOutlined,
  SafetyOutlined,
  AudioOutlined,
  RocketOutlined,
  FileExcelOutlined,
  TrophyOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
// import UsageTracker from '../UsageTracker';
// import AdRewardsScreen from '../AdRewardsScreen';
import './Layout.css';

const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [showAdRewards, setShowAdRewards] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  // Use user as authUser for consistency
  const authUser = user;

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
      { type: 'excel', title: 'Excel Spreadsheet', url: '/excel', description: 'Professional spreadsheet with charts and formulas' },
      { type: 'flashcard', title: 'Flashcards', url: '/flashcards', description: 'Study with interactive flashcards' },
      { type: 'mindmap', title: 'Mind Maps', url: '/mindmap', description: 'Create visual mind maps' },
      { type: 'quiz', title: 'Quiz System', url: '/quiz', description: 'Test your knowledge' },
      { type: 'calendar', title: 'Calendar', url: '/calendar', description: 'Manage your schedule' },
      { type: 'notes', title: 'Notes Manager', url: '/notes-manager', description: 'Advanced notes management system' },
      { type: 'document', title: 'Document Creator', url: '/document-creator', description: 'Create professional documents' },
      { type: 'subtitles', title: 'Subtitle Generator', url: '/subtitles', description: 'Generate and edit video subtitles' },
      { type: 'video', title: 'Video Processor', url: '/video-processor', description: 'Process and edit videos' },
      { type: 'image', title: 'Image Processor', url: '/image-processor', description: 'Process and edit images' },
      { type: 'qr', title: 'QR Code Generator', url: '/qr-generator', description: 'Generate QR codes for sharing' },
      { type: 'audio', title: 'Voice Recorder', url: '/voice-recorder', description: 'Record and transcribe audio with AI' },
      { type: 'achievements', title: 'Achievements', url: '/achievements', description: 'View your achievements and gamification progress' },
      { type: 'marketplace', title: 'Note Marketplace', url: '/marketplace', description: 'Buy and sell notes with the community' },
      { type: 'friends', title: 'Friends Network', url: '/friends', description: 'Connect with friends and share notes' }
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
      setMobileMenuOpen((prev: boolean) => !prev);
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
    <React.Fragment>
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
            {/* Quick AI Access Button */}
            <Button
              type="text"
              icon={<RobotOutlined />}
              onClick={() => navigate('/ai')}
              style={{
                marginLeft: '16px',
                color: 'white',
                border: '1px solid #1890ff',
                borderRadius: '20px',
                padding: '4px 12px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
              }}
              className="ai-quick-access"
              title="Quick AI Access"
            >
              <span style={{ fontSize: '12px', fontWeight: '500' }}>AI</span>
            </Button>
          </div>
          <div className="header-actions">
            {/* Usage Tracker */}
            {/* <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
              <UsageTracker size="small" />
            </div> */}
            
            {/* Ad Rewards Button */}
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />}
              // onClick={() => setShowAdRewards(true)}
              style={{ marginRight: '16px', background: '#52c41a', borderColor: '#52c41a' }}
              title="Earn More Tokens"
            >
              Earn Tokens
            </Button>
            
            {/* Main Navigation Menu */}
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
              <Button 
                type="text" 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                style={{ color: 'white' }}
                title="Home"
              />
              <Button 
                type="text" 
                icon={<BookOutlined />}
                onClick={() => navigate('/notes')}
                style={{ color: 'white' }}
                title="Notes"
              />
              <Button 
                type="text" 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/whiteboard')}
                style={{ color: 'white' }}
                title="Whiteboard"
              />
              <Button 
                type="text" 
                icon={<FileExcelOutlined />}
                onClick={() => navigate('/excel')}
                style={{ color: 'white' }}
                title="Excel Spreadsheet"
              />
              <Button 
                type="text" 
                icon={<RobotOutlined />}
                onClick={() => navigate('/ai')}
                style={{ color: 'white' }}
                title="AI Assistant"
              />
              <Button 
                type="text" 
                icon={<BranchesOutlined />}
                onClick={() => navigate('/mindmap')}
                style={{ color: 'white' }}
                title="Mind Map"
              />
              <Button 
                type="text" 
                icon={<VideoCameraOutlined />}
                onClick={() => navigate('/video')}
                style={{ color: 'white' }}
                title="Video"
              />
              <Button 
                type="text" 
                icon={<PictureOutlined />}
                onClick={() => navigate('/images')}
                style={{ color: 'white' }}
                title="Images"
              />
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => navigate('/quiz')}
                style={{ color: 'white' }}
                title="Quiz"
              />
              <Button 
                type="text" 
                icon={<TeamOutlined />}
                onClick={() => navigate('/modules')}
                style={{ color: 'white' }}
                title="Modules"
              />
              <Button 
                type="text" 
                icon={<GlobalOutlined />}
                onClick={() => navigate('/social')}
                style={{ color: 'white' }}
                title="Social"
              />
              <Button 
                type="text" 
                icon={<CodeOutlined />}
                onClick={() => navigate('/code-review')}
                style={{ color: 'white' }}
                title="Code Review"
              />
              <Button 
                type="text" 
                icon={<SafetyOutlined />}
                onClick={() => navigate('/sentiment')}
                style={{ color: 'white' }}
                title="Sentiment Analyzer"
              />
              <Button 
                type="text" 
                icon={<TranslationOutlined />}
                onClick={() => navigate('/summarizer')}
                style={{ color: 'white' }}
                title="Document Summarizer"
              />
              <Button 
                type="text" 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/document-creator')}
                style={{ color: 'white' }}
                title="Document Creator"
              />
              <Button 
                type="text" 
                icon={<PictureOutlined />}
                onClick={() => navigate('/image-processor')}
                style={{ color: 'white' }}
                title="Image Processor"
              />
              <Button 
                type="text" 
                icon={<TrophyOutlined />}
                onClick={() => navigate('/achievements')}
                style={{ color: 'white' }}
                title="Achievements"
              />
              <Button 
                type="text" 
                icon={<ShopOutlined />}
                onClick={() => navigate('/marketplace')}
                style={{ color: 'white' }}
                title="Marketplace"
              />
              <Button 
                type="text" 
                icon={<UsergroupAddOutlined />}
                onClick={() => navigate('/friends')}
                style={{ color: 'white' }}
                title="Friends"
              />
            </div>
            
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
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
                style={{ color: 'white' }}
                title="Settings"
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
        title="Navigation"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <Menu mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          </Menu.Item>
          <Menu.Item key="/notes" icon={<BookOutlined />}>
            <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>Notes</Link>
          </Menu.Item>
          <Menu.Item key="/whiteboard" icon={<FileTextOutlined />}>
            <Link to="/whiteboard" onClick={() => setMobileMenuOpen(false)}>Whiteboard</Link>
          </Menu.Item>
          <Menu.Item key="/excel" icon={<FileExcelOutlined />}>
            <Link to="/excel" onClick={() => setMobileMenuOpen(false)}>Excel Spreadsheet</Link>
          </Menu.Item>
          <Menu.Item key="/ai" icon={<RobotOutlined />}>
            <Link to="/ai" onClick={() => setMobileMenuOpen(false)}>AI Assistant</Link>
          </Menu.Item>
          <Menu.Item key="/antigravity" icon={<RocketOutlined />}>
            <Link to="/antigravity" onClick={() => setMobileMenuOpen(false)}>Antigravity</Link>
          </Menu.Item>
          {user?.role === 'admin' && (
            <Menu.Item key="/admin" icon={<SettingOutlined />}>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            </Menu.Item>
          )}
          <Menu.Item key="/mindmap" icon={<BranchesOutlined />}>
            <Link to="/mindmap" onClick={() => setMobileMenuOpen(false)}>Mind Maps</Link>
          </Menu.Item>
          <Menu.Item key="/video" icon={<VideoCameraOutlined />}>
            <Link to="/video" onClick={() => setMobileMenuOpen(false)}>Video</Link>
          </Menu.Item>
          <Menu.Item key="/images" icon={<PictureOutlined />}>
            <Link to="/images" onClick={() => setMobileMenuOpen(false)}>Images</Link>
          </Menu.Item>
          <Menu.Item key="/quiz" icon={<EditOutlined />}>
            <Link to="/quiz" onClick={() => setMobileMenuOpen(false)}>Quiz</Link>
          </Menu.Item>
          <Menu.Item key="/modules" icon={<TeamOutlined />}>
            <Link to="/modules" onClick={() => setMobileMenuOpen(false)}>Modules</Link>
          </Menu.Item>
          <Menu.Item key="/social" icon={<GlobalOutlined />}>
            <Link to="/social" onClick={() => setMobileMenuOpen(false)}>Social</Link>
          </Menu.Item>
          <Menu.Item key="/code-review" icon={<CodeOutlined />}>
            <Link to="/code-review" onClick={() => setMobileMenuOpen(false)}>Code Review</Link>
          </Menu.Item>
          <Menu.Item key="/sentiment" icon={<SafetyOutlined />}>
            <Link to="/sentiment" onClick={() => setMobileMenuOpen(false)}>Sentiment</Link>
          </Menu.Item>
          <Menu.Item key="/summarizer" icon={<TranslationOutlined />}>
            <Link to="/summarizer" onClick={() => setMobileMenuOpen(false)}>Summarizer</Link>
          </Menu.Item>
          <Menu.Item key="/document-creator" icon={<FileTextOutlined />}>
            <Link to="/document-creator" onClick={() => setMobileMenuOpen(false)}>Documents</Link>
          </Menu.Item>
          <Menu.Item key="/image-processor" icon={<PictureOutlined />}>
            <Link to="/image-processor" onClick={() => setMobileMenuOpen(false)}>Image Processor</Link>
          </Menu.Item>
          <Menu.Item key="/voice-recorder" icon={<AudioOutlined />}>
            <Link to="/voice-recorder" onClick={() => setMobileMenuOpen(false)}>Voice Recorder</Link>
          </Menu.Item>
          
          <Menu.Divider />
          
          {authUser ? (
            <>
              <Menu.Item key="/profile" icon={<UserOutlined />}>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              </Menu.Item>
              <Menu.Item key="/settings" icon={<SettingOutlined />}>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
              </Menu.Item>
              <Menu.Item key="/payment" icon={<CreditCardOutlined />}>
                <Link to="/payment" onClick={() => setMobileMenuOpen(false)}>Payment</Link>
              </Menu.Item>
              <Menu.Item key="/logout" icon={<LogoutOutlined />}>
                <Link to="/login" onClick={logout}>Logout</Link>
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item key="/login" icon={<UserOutlined />}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </Menu.Item>
              <Menu.Item key="/signup" icon={<UserOutlined />}>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>
    
    {/* Ad Rewards Screen */}
    {/* <AdRewardsScreen
      visible={showAdRewards}
      onClose={() => setShowAdRewards(false)}
    /> */}
    </React.Fragment>
  );
};

export default Layout;
