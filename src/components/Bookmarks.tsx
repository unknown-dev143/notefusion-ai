import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Input, Select, Tag, Modal, message, Tooltip } from 'antd';
import { BookOutlined, StarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: '1',
      title: 'Math Study Guide',
      url: '/notes/math-guide',
      description: 'Comprehensive math study materials',
      category: 'Academic',
      tags: ['math', 'study', 'important'],
      isFavorite: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Project Resources',
      url: '/projects/resources',
      description: 'Useful project development resources',
      category: 'Projects',
      tags: ['projects', 'development'],
      isFavorite: false,
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Physics Notes',
      url: '/notes/physics',
      description: 'Physics lecture notes and formulas',
      category: 'Academic',
      tags: ['physics', 'notes'],
      isFavorite: true,
      createdAt: '2024-01-13'
    }
  ]);

  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const [bookmarkForm, setBookmarkForm] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Personal',
    tags: [] as string[]
  });

  const categories = ['all', 'Academic', 'Personal', 'Projects', 'Work', 'Resources'];

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory;
    const matchesFavorites = !filterFavorites || bookmark.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const createBookmark = () => {
    if (!bookmarkForm.title.trim() || !bookmarkForm.url.trim()) {
      message.error('Please enter title and URL');
      return;
    }

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      title: bookmarkForm.title,
      url: bookmarkForm.url,
      description: bookmarkForm.description,
      category: bookmarkForm.category,
      tags: bookmarkForm.tags,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    message.success('Bookmark added successfully!');
    resetForm();
  };

  const updateBookmark = () => {
    if (!editingBookmark || !bookmarkForm.title.trim() || !bookmarkForm.url.trim()) {
      message.error('Please enter title and URL');
      return;
    }

    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === editingBookmark.id 
        ? { ...bookmark, ...bookmarkForm }
        : bookmark
    ));

    message.success('Bookmark updated successfully!');
    resetForm();
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    message.success('Bookmark deleted successfully!');
  };

  const toggleFavorite = (id: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === id ? { ...bookmark, isFavorite: !bookmark.isFavorite } : bookmark
    ));
  };

  const resetForm = () => {
    setBookmarkForm({
      title: '',
      url: '',
      description: '',
      category: 'Personal',
      tags: []
    });
    setEditingBookmark(null);
    setBookmarkModalVisible(false);
  };

  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkForm({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      category: bookmark.category,
      tags: bookmark.tags
    });
    setBookmarkModalVisible(true);
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setBookmarkForm(prev => ({ ...prev, tags }));
  };

  const navigateToBookmark = (bookmark: Bookmark) => {
    message.info(`Navigating to: ${bookmark.title}`);
    // Navigate using React Router
    navigate(bookmark.url);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Bookmarks</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
          >
            {categories.map(category => (
              <Option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </Option>
            ))}
          </Select>

          <Button
            type={filterFavorites ? 'primary' : 'default'}
            icon={<StarOutlined />}
            onClick={() => setFilterFavorites(!filterFavorites)}
          >
            Favorites Only
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setBookmarkModalVisible(true)}
          >
            Add Bookmark
          </Button>
        </Space>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filteredBookmarks.map(bookmark => (
          <Card
            key={bookmark.id}
            size="small"
            hoverable
            actions={[
              <Tooltip title="Toggle Favorite">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  style={{ color: bookmark.isFavorite ? '#faad14' : undefined }}
                  onClick={() => toggleFavorite(bookmark.id)}
                />
              </Tooltip>,
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(bookmark)}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteBookmark(bookmark.id)}
                />
              </Tooltip>
            ]}
          >
            <div style={{ cursor: 'pointer' }} onClick={() => navigateToBookmark(bookmark)}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {bookmark.isFavorite && <StarOutlined style={{ color: '#faad14' }} />}
                  <Text strong>{bookmark.title}</Text>
                </div>
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <LinkOutlined /> {bookmark.url}
                </Text>
                
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {bookmark.description}
                </Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="blue">{bookmark.category}</Tag>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {bookmark.createdAt}
                  </Text>
                </div>
                
                {bookmark.tags.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {bookmark.tags.map(tag => (
                      <Tag key={tag} style={{ marginBottom: 4 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </Space>
            </div>
          </Card>
        ))}
      </div>

      {filteredBookmarks.length === 0 && (
        <Card style={{ textAlign: 'center', marginTop: 24 }}>
          <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} type="secondary" style={{ marginTop: 16 }}>
            No bookmarks found
          </Title>
          <Text type="secondary">
            {searchTerm || selectedCategory !== 'all' || filterFavorites
              ? 'Try adjusting your filters or search terms'
              : 'Start by adding your first bookmark'
            }
          </Text>
        </Card>
      )}

      <Modal
        title={editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
        open={bookmarkModalVisible}
        onOk={editingBookmark ? updateBookmark : createBookmark}
        onCancel={resetForm}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Title</Text>
            <Input
              value={bookmarkForm.title}
              onChange={(e) => setBookmarkForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter bookmark title"
            />
          </div>

          <div>
            <Text strong>URL</Text>
            <Input
              value={bookmarkForm.url}
              onChange={(e) => setBookmarkForm(prev => ({ ...prev, url: e.target.value }))}
              placeholder="Enter URL or path"
            />
          </div>

          <div>
            <Text strong>Description</Text>
            <Input.TextArea
              value={bookmarkForm.description}
              onChange={(e) => setBookmarkForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <Text strong>Category</Text>
            <Select
              value={bookmarkForm.category}
              onChange={(value) => setBookmarkForm(prev => ({ ...prev, category: value }))}
              style={{ width: '100%' }}
            >
              {categories.filter(cat => cat !== 'all').map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Tags (comma-separated)</Text>
            <Input
              value={bookmarkForm.tags.join(', ')}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Bookmarks;
