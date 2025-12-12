import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, List, Tag, Dropdown, Menu, Modal, message, Row, Col, Select, Tooltip, Empty, Alert, QRCode } from 'antd';
import { 
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  CopyOutlined,
  ShareAltOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  MoreOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Enhanced Interfaces
interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  format: 'plain' | 'markdown' | 'rich';
  moduleCode?: string;
  attachments?: string[];
  folderId?: string;
  linkedNotes?: string[];
  reminder?: string;
  collaborators?: string[];
  versions?: NoteVersion[];
  collections?: string[];
  isPublic: boolean;
  viewCount: number;
  lastAccessed: string;
  aiTags?: string[];
  studyProgress?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  createdAt: string;
  author: string;
  changes: string;
}

interface NoteCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      content: '# Machine Learning Fundamentals\n\n## Introduction\n\nMachine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\n## Key Concepts\n\n### Supervised Learning\n- Classification\n- Regression\n\n### Unsupervised Learning\n- Clustering\n- Dimensionality reduction',
      category: 'study',
      tags: ['ML', 'AI', 'Fundamentals'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      isFavorite: true,
      format: 'markdown',
      moduleCode: 'CS301',
      isPublic: false,
      viewCount: 15,
      lastAccessed: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Project Meeting Notes',
      content: 'Meeting Date: December 9, 2025\n\nAttendees:\n- Team Lead\n- Developers\n- Designer\n\nDiscussion Points:\n1. Project timeline review\n2. Resource allocation\n3. Next sprint planning\n\nAction Items:\n- Update documentation\n- Schedule follow-up meeting',
      category: 'meeting',
      tags: ['project', 'meeting'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      format: 'plain',
      isPublic: false,
      viewCount: 8,
      lastAccessed: new Date().toISOString()
    }
  ]);

  const [categories] = useState<NoteCategory[]>([
    { id: 'study', name: 'Study Notes', color: 'blue', icon: <FileTextOutlined /> },
    { id: 'meeting', name: 'Meeting Notes', color: 'green', icon: <FileTextOutlined /> },
    { id: 'personal', name: 'Personal', color: 'purple', icon: <FileTextOutlined /> },
    { id: 'project', name: 'Project', color: 'orange', icon: <FileTextOutlined /> },
    { id: 'research', name: 'Research', color: 'red', icon: <FileTextOutlined /> }
  ]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');

  // Editor state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('study');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteFormat, setNoteFormat] = useState<'plain' | 'markdown' | 'rich'>('plain');
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      message.error('Please enter both title and content');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      tags: noteTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      format: noteFormat,
      isPublic: false,
      viewCount: 0,
      lastAccessed: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setCreateModalVisible(false);
    resetForm();
    message.success('Note created successfully!');
  };

  const updateNote = () => {
    if (!selectedNote || !noteTitle.trim() || !noteContent.trim()) {
      message.error('Please enter both title and content');
      return;
    }

    const updatedNote: Note = {
      ...selectedNote,
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      tags: noteTags,
      updatedAt: new Date().toISOString(),
      format: noteFormat
    };

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));

    setEditModalVisible(false);
    setSelectedNote(null);
    resetForm();
    message.success('Note updated successfully!');
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    message.success('Note deleted successfully!');
  };

  const toggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const duplicateNote = (note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: Date.now().toString(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };

    setNotes(prev => [duplicatedNote, ...prev]);
    message.success('Note duplicated successfully!');
  };

  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setNoteTags(note.tags);
    setNoteFormat(note.format);
    setIsEditing(true);
    setEditModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setCreateModalVisible(true);
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('study');
    setNoteTags([]);
    setNoteFormat('plain');
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const generateShareUrl = (note: Note) => {
    const baseUrl = window.location.origin;
    const shareData = btoa(JSON.stringify({
      id: note.id,
      title: note.title,
      type: 'note',
      timestamp: Date.now()
    }));
    return `${baseUrl}/shared/${shareData}`;
  };

  const shareNote = (note: Note) => {
    setSelectedNote(note);
    const url = generateShareUrl(note);
    setShareUrl(url);
    setShareModalVisible(true);
  };

  const generateQRCode = (note: Note) => {
    setSelectedNote(note);
    const url = generateShareUrl(note);
    setShareUrl(url);
    setQrModalVisible(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy to clipboard');
    });
  };

  const shareToSocialMedia = (platform: string, note: Note) => {
    const url = generateShareUrl(note);
    const text = `Check out this note: ${note.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  const exportNote = (note: Note, format: 'pdf' | 'docx' | 'markdown' | 'txt') => {
    let content = note.content;
    let mimeType = 'text/plain';
    let fileName = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}`;

    switch (format) {
      case 'pdf':
        content = generatePDFContent(note);
        mimeType = 'application/pdf';
        fileName += '.pdf';
        break;
      case 'docx':
        content = generateDOCXContent(note);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName += '.docx';
        break;
      case 'markdown':
        mimeType = 'text/markdown';
        fileName += '.md';
        break;
      case 'txt':
        mimeType = 'text/plain';
        fileName += '.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success(`Note exported as ${format.toUpperCase()} successfully!`);
  };

  const generatePDFContent = (note: Note): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${note.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; border-bottom: 2px solid #333; }
    .meta { color: #666; margin-bottom: 20px; }
    .tags { margin-top: 20px; }
    .tag { display: inline-block; background: #f0f0f0; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="meta">
    <p>Category: ${note.category}</p>
    <p>Created: ${new Date(note.createdAt).toLocaleString()}</p>
    <p>Updated: ${new Date(note.updatedAt).toLocaleString()}</p>
  </div>
  <div>${note.format === 'markdown' ? renderMarkdown(note.content) : note.content.replace(/\n/g, '<br>')}</div>
  <div class="tags">
    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
  </div>
</body>
</html>`;
  };

  const generateDOCXContent = (note: Note): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${note.title}</title>
  <style>
    body { font-family: 'Calibri', sans-serif; margin: 40px; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <p><strong>Category:</strong> ${note.category}</p>
  <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
  <p><strong>Tags:</strong> ${note.tags.join(', ')}</p>
  <hr>
  <div>${note.format === 'markdown' ? renderMarkdown(note.content) : note.content.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
  };

  const renderMarkdown = (content: string): string => {
    // Simple markdown rendering (in production, use a proper markdown library)
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const noteActionsMenu = (note: Note) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => openEditModal(note)}>
        Edit
      </Menu.Item>
      <Menu.Item key="duplicate" icon={<CopyOutlined />} onClick={() => duplicateNote(note)}>
        Duplicate
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />} onClick={() => shareNote(note)}>
        Share Link
      </Menu.Item>
      <Menu.Item key="qr" icon={<QrcodeOutlined />} onClick={() => generateQRCode(note)}>
        Generate QR Code
      </Menu.Item>
      <Menu.SubMenu key="social" title="Share to Social" icon={<ShareAltOutlined />}>
        <Menu.Item key="twitter" onClick={() => shareToSocialMedia('twitter', note)}>
          Twitter
        </Menu.Item>
        <Menu.Item key="facebook" onClick={() => shareToSocialMedia('facebook', note)}>
          Facebook
        </Menu.Item>
        <Menu.Item key="linkedin" onClick={() => shareToSocialMedia('linkedin', note)}>
          LinkedIn
        </Menu.Item>
        <Menu.Item key="whatsapp" onClick={() => shareToSocialMedia('whatsapp', note)}>
          WhatsApp
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="export" title="Export" icon={<DownloadOutlined />}>
        <Menu.Item key="pdf" onClick={() => exportNote(note, 'pdf')}>PDF</Menu.Item>
        <Menu.Item key="docx" onClick={() => exportNote(note, 'docx')}>Word</Menu.Item>
        <Menu.Item key="markdown" onClick={() => exportNote(note, 'markdown')}>Markdown</Menu.Item>
        <Menu.Item key="txt" onClick={() => exportNote(note, 'txt')}>Text</Menu.Item>
      </Menu.SubMenu>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => deleteNote(note.id)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  // Enhanced Features Functions (removed unused functions for build)

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Notes</Title>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Search and Filter Bar */}
          <Row gutter={16} align="middle">
            <Col flex={1}>
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 150 }}
                placeholder="Category"
              >
                <Option value="all">All Categories</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    <Space>
                      {category.icon}
                      {category.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 120 }}
              >
                <Option value="date">Sort by Date</Option>
                <Option value="title">Sort by Title</Option>
                <Option value="category">Sort by Category</Option>
              </Select>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                New Note
              </Button>
            </Col>
          </Row>

          {/* Notes List */}
          <div>
            {filteredNotes.length === 0 ? (
              <Empty
                description="No notes found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Create your first note
                </Button>
              </Empty>
            ) : (
              <List
                dataSource={filteredNotes}
                renderItem={(note) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Toggle Favorite">
                        <Button
                          type="text"
                          icon={note.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                          onClick={() => toggleFavorite(note.id)}
                        />
                      </Tooltip>,
                      <Dropdown overlay={noteActionsMenu(note)} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: categories.find(c => c.id === note.category)?.color || '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {categories.find(c => c.id === note.category)?.icon || <FileTextOutlined />}
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong>{note.title}</Text>
                          {note.isFavorite && <StarFilled style={{ color: '#faad14', fontSize: 14 }} />}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text type="secondary" ellipsis>
                            {note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                          </Text>
                          <Space>
                            <Tag color={categories.find(c => c.id === note.category)?.color}>
                              {categories.find(c => c.id === note.category)?.name}
                            </Tag>
                            {note.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Space>
      </Card>

      {/* Create/Edit Note Modal */}
      <Modal
        title={isEditing ? 'Edit Note' : 'Create New Note'}
        visible={createModalVisible || editModalVisible}
        onOk={isEditing ? updateNote : createNote}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
          setSelectedNote(null);
          resetForm();
        }}
        width={800}
        okText={isEditing ? 'Update' : 'Create'}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Title</Text>
            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Enter note title..."
              style={{ marginTop: 8 }}
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Category</Text>
                <Select
                  value={noteCategory}
                  onChange={setNoteCategory}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      <Space>
                        {category.icon}
                        {category.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Format</Text>
                <Select
                  value={noteFormat}
                  onChange={setNoteFormat}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="plain">Plain Text</Option>
                  <Option value="markdown">Markdown</Option>
                  <Option value="rich">Rich Text</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <div>
            <Text strong>Tags</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {noteTags.map(tag => (
                  <Tag key={tag} closable onClose={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
                <Input
                  size="small"
                  style={{ width: 120 }}
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={addTag}
                  onBlur={addTag}
                />
              </Space>
            </div>
          </div>

          <div>
            <Text strong>Content</Text>
            <TextArea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter note content..."
              rows={10}
              style={{ marginTop: 8 }}
            />
            {noteFormat === 'markdown' && (
              <Alert
                message="Markdown Format"
                description="You can use markdown syntax: **bold**, *italic*, # heading, ## subheading"
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        </Space>
      </Modal>

      {/* Share Modal */}
      <Modal
        title={`Share Note - ${selectedNote?.title}`}
        visible={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => copyToClipboard(shareUrl)}>
            Copy Link
          </Button>,
          <Button key="close" onClick={() => setShareModalVisible(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        {selectedNote && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Share URL:</Text>
              <Input
                value={shareUrl}
                readOnly
                addonAfter={<CopyOutlined onClick={() => copyToClipboard(shareUrl)} />}
                style={{ marginTop: 8 }}
              />
            </div>

            <Alert
              message="Sharing Options"
              description="You can also share this note directly to social media platforms using the options in the note menu."
              type="info"
              showIcon
            />

            <div>
              <Text strong>Quick Share:</Text>
              <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={6}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => shareToSocialMedia('twitter', selectedNote)}
                  >
                    Twitter
                  </Button>
                </Col>
                <Col span={6}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => shareToSocialMedia('facebook', selectedNote)}
                  >
                    Facebook
                  </Button>
                </Col>
                <Col span={6}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => shareToSocialMedia('linkedin', selectedNote)}
                  >
                    LinkedIn
                  </Button>
                </Col>
                <Col span={6}>
                  <Button 
                    size="small" 
                    block 
                    onClick={() => shareToSocialMedia('whatsapp', selectedNote)}
                  >
                    WhatsApp
                  </Button>
                </Col>
              </Row>
            </div>
          </Space>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={`QR Code - ${selectedNote?.title}`}
        visible={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => copyToClipboard(shareUrl)}>
            Copy URL
          </Button>,
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Close
          </Button>
        ]}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
          <QRCode value={shareUrl} size={256} />
          <Text type="secondary">Scan to view note</Text>
          <Text code style={{ wordBreak: 'break-all', textAlign: 'center' }}>
            {shareUrl}
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

export default Notes;
