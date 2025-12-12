import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Typography, List, Input, Modal, Form, message, Space, Tag, Select, DatePicker, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, StarOutlined, InboxOutlined, FilterOutlined, ShareAltOutlined, HistoryOutlined, BarChartOutlined, RobotOutlined, PictureOutlined, TwitterOutlined } from '@ant-design/icons';
import AIAssistant from '../../components/AIAssistant';
import MDEditor from '@uiw/react-md-editor';
import NoteTemplates from '../../components/NoteTemplates';
import VersionHistory from '../../components/VersionHistory';
import NoteAnalytics from '../../components/NoteAnalytics';
import AINoteGenerator from '../../components/AINoteGenerator';
import ImageGenerator from '../../components/ImageGenerator';
import SocialMediaIntegration from '../../components/SocialMediaIntegration';

const { Title, Text } = Typography;
const { Search } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  color?: string;
}

type ExportFormat = 'json' | 'markdown';

const STORAGE_KEY = 'noteFusionNotes';

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to NoteFusion',
    content: 'This is your first note. You can edit or delete it later.',
    category: 'Getting Started',
    tags: ['welcome', 'tutorial'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Getting Started',
    content: 'Click the "Add Note" button to create a new note.',
    category: 'Tutorial',
    tags: ['tutorial', 'basics'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : sampleNotes;
  });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();
  const [markdownContent, setMarkdownContent] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateRange: null as any,
    favoritesOnly: false,
    archivedOnly: false,
    hasTags: false,
    sortBy: 'updatedAt' as 'createdAt' | 'updatedAt' | 'title',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<Note | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  // Get all unique categories and tags
  const categories = useMemo(() => {
    const cats = Array.from(new Set(notes.map(note => note.category).filter(Boolean)));
    return cats;
  }, [notes]);

  const tags = useMemo(() => {
    const allTags = notes.flatMap(note => note.tags || []);
    return Array.from(new Set(allTags));
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || (note.tags && note.tags.includes(selectedTag));
      
      return matchesSearch && matchesCategory && matchesTag;
    });

    // Apply advanced filters
    if (searchFilters.favoritesOnly) {
      filtered = filtered.filter(note => note.isFavorite);
    }
    if (searchFilters.archivedOnly) {
      filtered = filtered.filter(note => note.isArchived);
    }
    if (searchFilters.hasTags) {
      filtered = filtered.filter(note => note.tags && note.tags.length > 0);
    }
    if (searchFilters.dateRange && searchFilters.dateRange.length === 2) {
      const [start, end] = searchFilters.dateRange;
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= start && noteDate <= end;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[searchFilters.sortBy];
      let bValue: any = b[searchFilters.sortBy];
      
      if (searchFilters.sortBy === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (searchFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notes, searchText, selectedCategory, selectedTag, searchFilters]);

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + N: New note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowTemplates(true);
      }
      
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportClick();
      }
      
      // Ctrl/Cmd + I: Import
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        document.getElementById('import-notes')?.click();
      }
      
      // Ctrl/Cmd + A: Analytics
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setShowAnalytics(true);
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Ctrl/Cmd + H: Show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Ctrl/Cmd + G: Show AI generator
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setShowAIGenerator(true);
      }
      
      // Ctrl/Cmd + M: Show image generator
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setShowImageGenerator(true);
      }
      
      // Ctrl/Cmd + S: Show social media
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSocialMedia(true);
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        if (showTemplates) setShowTemplates(false);
        if (showVersionHistory) setShowVersionHistory(false);
        if (showAnalytics) setShowAnalytics(false);
        if (showShortcuts) setShowShortcuts(false);
        if (showAIGenerator) setShowAIGenerator(false);
        if (showImageGenerator) setShowImageGenerator(false);
        if (showSocialMedia) setShowSocialMedia(false);
        if (shareModalVisible) setShareModalVisible(false);
        if (isModalVisible) setIsModalVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTemplates, showVersionHistory, showAnalytics, showShortcuts, showAIGenerator, showImageGenerator, showSocialMedia, shareModalVisible, isModalVisible]);

  // Export notes to JSON or Markdown
  const exportToMarkdown = (notesToExport: Note[]): string => {
    return notesToExport.map(note => {
      const date = new Date(note.createdAt).toLocaleString();
      let content = `# ${note.title}\n\n${note.content}\n\n`;
      
      if (note.category) content += `**Category:** ${note.category}  \n`;
      if (note.tags && note.tags.length > 0) content += `**Tags:** ${note.tags.join(', ')}  \n`;
      if (note.color) content += `**Color:** ${note.color}  \n`;
      
      content += `*Created: ${date}*  \n`;
      if (note.updatedAt) content += `*Updated: ${new Date(note.updatedAt).toLocaleString()}*  \n`;
      if (note.isArchived) content += '*Archived*  \n';
      if (note.isFavorite) content += '*⭐ Favorite*  \n';
      
      return content + '\n---\n\n';
    }).join('\n');
  };

  
  const exportNotes = (format: ExportFormat = 'json') => {
    if (notes.length === 0) {
      message.warning('No notes to export');
      return;
    }

    let dataStr: string;
    let mimeType: string;
    let fileExtension: string;

    if (format === 'markdown') {
      dataStr = exportToMarkdown(notes);
      mimeType = 'text/markdown;charset=utf-8';
      fileExtension = 'md';
    } else {
      dataStr = JSON.stringify(notes, null, 2);
      mimeType = 'application/json;charset=utf-8';
      fileExtension = 'json';
    }

    const exportName = `notes-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    const dataUri = `data:${mimeType},${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    message.success(`Notes exported as ${format.toUpperCase()} successfully!`);
  };

  const handleExportClick = () => {
    Modal.confirm({
      title: 'Export Notes',
      content: 'Choose export format:',
      okText: 'Export as JSON',
      cancelText: 'Export as Markdown',
      onOk() {
        exportNotes('json');
      },
      onCancel() {
        exportNotes('markdown');
      }
    });
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let importedNotes: Note[] = [];
          
          if (file.name.endsWith('.json')) {
            importedNotes = JSON.parse(content);
          } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            // Parse markdown format
            const sections = content.split('---').filter(s => s.trim());
            importedNotes = sections.map((section, index) => {
              const lines = section.trim().split('\n');
              const title = lines.find(l => l.startsWith('# '))?.replace('# ', '') || `Imported Note ${index + 1}`;
              const content = lines.filter(l => !l.startsWith('#') && !l.startsWith('**')).join('\n').trim();
              return {
                id: Date.now().toString() + index,
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isArchived: false,
                isFavorite: false
              };
            });
          }
          
          setNotes([...notes, ...importedNotes]);
          message.success(`Successfully imported ${importedNotes.length} notes!`);
        } catch (error) {
          message.error('Failed to import file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = ''; // Reset input
  };

  const showAddModal = () => {
    setEditingNote(null);
    form.resetFields();
    setMarkdownContent('');
    setIsModalVisible(true);
  };

  const showEditModal = (note: Note) => {
    setEditingNote(note);
    setMarkdownContent(note.content);
    form.setFieldsValue({
      title: note.title,
      category: note.category,
      tags: note.tags,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setMarkdownContent('');
    setIsModalVisible(false);
    setEditingNote(null);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Note',
      content: 'Are you sure you want to delete this note?',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, keep it',
      onOk() {
        setNotes(notes.filter(note => note.id !== id));
        message.success('Note deleted successfully!');
      },
    });
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const toggleArchive = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isArchived: !note.isArchived } : note
    ));
  };

  const handleShare = (note: Note) => {
    setNoteToShare(note);
    setShareModalVisible(true);
  };

  const generateShareLink = () => {
    if (!noteToShare) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${noteToShare.id}`;
  };

  const copyShareLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    message.success('Share link copied to clipboard!');
  };

  const handleSelectTemplate = (template: any) => {
    setEditingNote(null);
    form.resetFields();
    setMarkdownContent(template.content);
    form.setFieldsValue({
      title: template.name,
      category: template.category,
      tags: template.tags,
    });
    setShowTemplates(false);
    setIsModalVisible(true);
  };

  const handleShowVersionHistory = (note: Note) => {
    setSelectedNoteForHistory(note);
    setShowVersionHistory(true);
  };

  const handleRestoreVersion = (content: string) => {
    if (selectedNoteForHistory) {
      setMarkdownContent(content);
      setShowVersionHistory(false);
      showEditModal(selectedNoteForHistory);
    }
  };

  const handleSubmit = (values: any) => {
    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...values, content: markdownContent, updatedAt: new Date().toISOString() }
          : note
      ));
      message.success('Note updated successfully!');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...values,
        content: markdownContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        isFavorite: false,
      };
      setNotes([...notes, newNote]);
      message.success('Note added successfully!');
    }
    form.resetFields();
    setMarkdownContent('');
    setIsModalVisible(false);
    setEditingNote(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2}>My Notes</Title>
        <Space wrap>
          <Search
            placeholder="Search notes..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            aria-label="Search notes"
            title="Search notes by title or content"
          />
          <Button 
            icon={<FilterOutlined />}
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            type={showAdvancedSearch ? 'primary' : 'default'}
          >
            Advanced
          </Button>
          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 120, minWidth: 100 }}
            allowClear
          >
            <Select.Option value="all">All Categories</Select.Option>
            {categories.map(cat => (
              <Select.Option key={cat} value={cat}>{cat}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Tag"
            value={selectedTag}
            onChange={setSelectedTag}
            style={{ width: 120, minWidth: 100 }}
            allowClear
          >
            <Select.Option value="all">All Tags</Select.Option>
            {tags.map(tag => (
              <Select.Option key={tag} value={tag}>{tag}</Select.Option>
            ))}
          </Select>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportClick}
            disabled={notes.length === 0}
          >
            Export
          </Button>
          <div>
            <input
              type="file"
              id="import-notes"
              accept=".json,.md,.txt"
              style={{ display: 'none' }}
              onChange={handleImportChange}
              aria-label="Import notes from file"
              title="Import notes from JSON, Markdown, or text file"
            />
            <Button 
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('import-notes')?.click()}
            >
              Import
            </Button>
          </div>
          <Button 
            icon={<BarChartOutlined />}
            onClick={() => setShowAnalytics(true)}
          >
            Analytics
          </Button>
          <Button 
            icon={<RobotOutlined />}
            onClick={() => setShowAIGenerator(true)}
          >
            AI Generator
          </Button>
          <Button 
            icon={<PictureOutlined />}
            onClick={() => setShowImageGenerator(true)}
          >
            Image Generator
          </Button>
          <Button 
            icon={<TwitterOutlined />}
            onClick={() => setShowSocialMedia(true)}
          >
            Social Media
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowTemplates(true)}>
            Add Note
          </Button>
        </Space>
      </div>

      {showAdvancedSearch && (
        <Card title="Advanced Search Filters" style={{ marginBottom: 16 }}>
          <Space wrap style={{ width: '100%' }}>
            <div>
              <Text strong>Date Range:</Text>
              <DatePicker.RangePicker 
                value={searchFilters.dateRange}
                onChange={(dates) => setSearchFilters(prev => ({ ...prev, dateRange: dates }))}
                style={{ marginLeft: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Sort By:</Text>
              <Select
                value={searchFilters.sortBy}
                onChange={(value) => setSearchFilters(prev => ({ ...prev, sortBy: value }))}
                style={{ marginLeft: 8, width: 120 }}
              >
                <Select.Option value="updatedAt">Last Modified</Select.Option>
                <Select.Option value="createdAt">Created Date</Select.Option>
                <Select.Option value="title">Title</Select.Option>
              </Select>
            </div>
            
            <div>
              <Text strong>Order:</Text>
              <Select
                value={searchFilters.sortOrder}
                onChange={(value) => setSearchFilters(prev => ({ ...prev, sortOrder: value }))}
                style={{ marginLeft: 8, width: 80 }}
              >
                <Select.Option value="desc">Desc</Select.Option>
                <Select.Option value="asc">Asc</Select.Option>
              </Select>
            </div>
            
            <Checkbox
              checked={searchFilters.favoritesOnly}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, favoritesOnly: e.target.checked }))}
            >
              Favorites only
            </Checkbox>
            
            <Checkbox
              checked={searchFilters.archivedOnly}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, archivedOnly: e.target.checked }))}
            >
              Archived only
            </Checkbox>
            
            <Checkbox
              checked={searchFilters.hasTags}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, hasTags: e.target.checked }))}
            >
              Has tags
            </Checkbox>
          </Space>
        </Card>
      )}

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={filteredNotes}
        renderItem={note => (
          <List.Item>
            <Card 
              title={note.title} 
              style={{ height: '100%' }}
              hoverable
              extra={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    type="text" 
                    icon={<HistoryOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowVersionHistory(note);
                    }} 
                    aria-label="View version history"
                  />
                  <Button 
                    type="text" 
                    icon={<ShareAltOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(note);
                    }} 
                    aria-label="Share note"
                  />
                  <Button 
                    type="text" 
                    icon={<StarOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(note.id);
                    }} 
                    style={{ color: note.isFavorite ? '#faad14' : undefined }}
                    aria-label="Toggle favorite"
                  />
                  <Button 
                    type="text" 
                    icon={<InboxOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchive(note.id);
                    }} 
                    style={{ color: note.isArchived ? '#52c41a' : undefined }}
                    aria-label="Toggle archive"
                  />
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      showEditModal(note);
                    }} 
                    aria-label="Edit note"
                  />
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    aria-label="Delete note"
                  />
                </div>
              }
            >
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                <MDEditor.Markdown source={note.content} style={{ backgroundColor: 'transparent' }} />
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                <div>Created: {new Date(note.createdAt).toLocaleString()}</div>
                {note.updatedAt && (
                  <div>Updated: {new Date(note.updatedAt).toLocaleString()}</div>
                )}
              </div>
              {note.category && (
                <Tag color="blue" style={{ marginTop: '8px' }}>{note.category}</Tag>
              )}
              {note.tags && note.tags.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {note.tags.map(tag => (
                    <Tag key={tag} style={{ marginBottom: '4px' }}>{tag}</Tag>
                  ))}
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />

      <AIAssistant />

      <Modal
        title={editingNote ? 'Edit Note' : 'Add New Note'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingNote ? {
            title: editingNote.title,
            content: editingNote.content
          } : undefined}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" />
          </Form.Item>
          
          <Form.Item
            label="Content"
            required
          >
            <MDEditor
              value={markdownContent}
              onChange={(val) => setMarkdownContent(val || '')}
              height={200}
              preview="edit"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
          >
            <Input placeholder="e.g. Work, Personal, Ideas" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags (press Enter to add)"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingNote ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Share Note"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="copy" type="primary" onClick={copyShareLink}>
            Copy Link
          </Button>
        ]}
      >
        {noteToShare && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Note Title:</Text>
              <div>{noteToShare.title}</div>
            </div>
            <div>
              <Text strong>Share Link:</Text>
              <Input.TextArea
                value={generateShareLink()}
                readOnly
                rows={2}
                style={{ marginTop: 8 }}
              />
            </div>
            <div style={{ padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Anyone with this link can view this note. They won't be able to edit it.
              </Text>
            </div>
          </Space>
        )}
      </Modal>

      <Modal
        title="Create from Template"
        open={showTemplates}
        onCancel={() => setShowTemplates(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Button onClick={showAddModal} style={{ marginBottom: 16 }}>
            Start with Blank Note
          </Button>
        </div>
        <NoteTemplates onSelectTemplate={handleSelectTemplate} />
      </Modal>

      <Modal
        title="Version History"
        open={showVersionHistory}
        onCancel={() => setShowVersionHistory(false)}
        footer={null}
        width={800}
      >
        {selectedNoteForHistory && (
          <VersionHistory
            onRestore={handleRestoreVersion}
          />
        )}
      </Modal>

      <Modal
        title="Note Analytics"
        open={showAnalytics}
        onCancel={() => setShowAnalytics(false)}
        footer={null}
        width={900}
      >
        <NoteAnalytics notes={notes} />
      </Modal>

      <Modal
        title="AI Note Generator"
        open={showAIGenerator}
        onCancel={() => setShowAIGenerator(false)}
        footer={null}
        width={900}
      >
        <AINoteGenerator />
      </Modal>

      <Modal
        title="AI Image Generator"
        open={showImageGenerator}
        onCancel={() => setShowImageGenerator(false)}
        footer={null}
        width={900}
      >
        <ImageGenerator />
      </Modal>

      <Modal
        title="Social Media Integration"
        open={showSocialMedia}
        onCancel={() => setShowSocialMedia(false)}
        footer={null}
        width={900}
      >
        <SocialMediaIntegration />
      </Modal>

      <Modal
        title="Keyboard Shortcuts"
        open={showShortcuts}
        onCancel={() => setShowShortcuts(false)}
        footer={[
          <Button key="close" onClick={() => setShowShortcuts(false)}>
            Close
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Ctrl/Cmd + N</Text>
            <Text type="secondary"> - Create new note</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + E</Text>
            <Text type="secondary"> - Export notes</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + I</Text>
            <Text type="secondary"> - Import notes</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + A</Text>
            <Text type="secondary"> - Show analytics</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + F</Text>
            <Text type="secondary"> - Focus search</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + G</Text>
            <Text type="secondary"> - Show AI generator</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + M</Text>
            <Text type="secondary"> - Show image generator</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + S</Text>
            <Text type="secondary"> - Show social media integration</Text>
          </div>
          <div>
            <Text strong>Ctrl/Cmd + H</Text>
            <Text type="secondary"> - Show this help</Text>
          </div>
          <div>
            <Text strong>Escape</Text>
            <Text type="secondary"> - Close any open modal</Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default NotesPage;
