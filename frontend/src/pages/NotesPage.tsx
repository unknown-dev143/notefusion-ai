import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Button, List, Input, Typography, Card, Empty, Skeleton } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
// TODO: Uncomment and implement auth context
// import { useAuth } from './features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './NotesPage.module.css';
=======
import { Button, List, Input, Typography, Card, Space, Empty, Skeleton } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from './features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Title } = Typography;
const { Search } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const NotesPage: React.FC = () => {
<<<<<<< HEAD
  // TODO: Replace with actual auth check
  const user = { id: 'demo-user' }; // Mock user for now
=======
  const { user } = useAuth();
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      <div className={styles['skeletonContainer']}>
=======
      <div style={{ padding: '2rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className={styles['pageContainer']}>
      <div className={styles['header']}>
=======
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Title level={2}>My Notes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNote}
<<<<<<< HEAD
          className={`${styles['newNoteButton']}`}
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        >
          New Note
        </Button>
      </div>

<<<<<<< HEAD
      <div className={styles['searchContainer']}>
=======
      <div style={{ marginBottom: '1.5rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
          className={styles['searchInput']}
=======
          style={{ maxWidth: '500px' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        />
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <Empty
<<<<<<< HEAD
            className={`${styles['emptyState']}`}
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            description={
              <span>No notes found. Create your first note to get started!</span>
            }
          >
<<<<<<< HEAD
            <Button 
              type="primary" 
              onClick={handleCreateNote}
              className={`${styles['emptyStateButton']}`}
            >
=======
            <Button type="primary" onClick={handleCreateNote}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
                className={`${styles['noteCard']}`}
              >
                <Card.Meta
                  title={
                    <div className={styles['noteTitle']}>
=======
                style={{ height: '100%' }}
              >
                <Card.Meta
                  title={
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                      {note.title || 'Untitled Note'}
                    </div>
                  }
                  description={
<<<<<<< HEAD
                    <div className={styles['noteContent']}>
=======
                    <div style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '4.5em',
                    }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                      {note.content || 'No content'}
                    </div>
                  }
                />
<<<<<<< HEAD
                <div className={styles['noteFooter']}>
=======
                <div style={{ marginTop: '1rem', color: '#8c8c8c', fontSize: '0.8rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
