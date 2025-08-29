import React, { useState, useEffect } from 'react';
import { Button, List, Input, Typography, Card, Empty, Skeleton } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
// TODO: Uncomment and implement auth context
// import { useAuth } from './features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './NotesPage.module.css';

const { Title } = Typography;
const { Search } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const NotesPage: React.FC = () => {
  // TODO: Replace with actual auth check
  const user = { id: 'demo-user' }; // Mock user for now
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // Replace with actual API call
        // const response = await notesApi.getNotes();
        // setNotes(response.data);
        
        // Mock data for now
        setTimeout(() => {
          setNotes([
            {
              id: '1',
              title: 'Welcome to NoteFusion AI',
              content: 'Start creating your first note by clicking the + button above.',
              updatedAt: new Date().toISOString(),
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchNotes();
    } else {
      navigate('/login', { state: { from: '/notes' } });
    }
  }, [user, navigate]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  if (loading) {
    return (
      <div className={styles['skeletonContainer']}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className={styles['pageContainer']}>
      <div className={styles['header']}>
        <Title level={2}>My Notes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNote}
          className={`${styles['newNoteButton']}`}
        >
          New Note
        </Button>
      </div>

      <div className={styles['searchContainer']}>
        <Search
          placeholder="Search notes..."
          allowClear
          enterButton={
            <Button type="primary">
              <SearchOutlined />
            </Button>
          }
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles['searchInput']}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <Empty
            className={`${styles['emptyState']}`}
            description={
              <span>No notes found. Create your first note to get started!</span>
            }
          >
            <Button 
              type="primary" 
              onClick={handleCreateNote}
              className={`${styles['emptyStateButton']}`}
            >
              Create Note
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={filteredNotes}
          renderItem={(note) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleNoteClick(note.id)}
                className={`${styles['noteCard']}`}
              >
                <Card.Meta
                  title={
                    <div className={styles['noteTitle']}>
                      {note.title || 'Untitled Note'}
                    </div>
                  }
                  description={
                    <div className={styles['noteContent']}>
                      {note.content || 'No content'}
                    </div>
                  }
                />
                <div className={styles['noteFooter']}>
                  Last updated: {new Date(note.updatedAt).toLocaleString()}
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default NotesPage;
