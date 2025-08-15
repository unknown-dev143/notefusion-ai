import React, { useState, useEffect } from 'react';
import { List, Input, Button, Card, Tag, Space, Empty, Skeleton, Divider, Dropdown, MenuProps } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  FolderOutlined, 
  StarFilled, 
  StarOutlined, 
  MoreOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNotes } from '../contexts/NoteContext';
import NoteEditor from './NoteEditor';

const { Search } = Input;

const NotesList: React.FC = () => {
  const { 
    notes, 
    loading, 
    searchNotes, 
    deleteNote, 
    updateNote,
    createNote,
    currentNote
  } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Filter notes based on search query and folder
  useEffect(() => {
    if (searchQuery) {
      searchNotes(searchQuery).then(results => {
        setFilteredResults(results);
      });
    } else {
      setFilteredResults(notes);
    }
  }, [searchQuery, notes, searchNotes]);

  const setFilteredResults = (results: any[]) => {
    if (selectedFolder === 'all') {
      setFilteredNotes(results);
    } else if (selectedFolder === 'pinned') {
      setFilteredNotes(results.filter(note => note.isPinned));
    } else {
      setFilteredNotes(results.filter(note => note.folderId === selectedFolder));
    }
  };

  // Get unique folders from notes
  const folders = [
    { id: 'all', name: 'All Notes' },
    { id: 'pinned', name: 'Pinned' },
    ...Array.from(new Set(notes
      .filter(note => note.folderId)
      .map(note => ({
        id: note.folderId!,
        name: note.folderId!.split('/').pop() || 'Uncategorized'
      })))
    ];

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreatingNew(true);
  };

  const handleNoteSaved = () => {
    setIsCreatingNew(false);
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    try {
      await deleteNote(noteId);
      if (selectedNote === noteId) {
        setSelectedNote(null);
      }
      message.success('Note deleted');
    } catch (error) {
      message.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, noteId: string, isPinned: boolean) => {
    e.stopPropagation();
    try {
      await updateNote(noteId, { isPinned: !isPinned });
      message.success(isPinned ? 'Note unpinned' : 'Note pinned');
    } catch (error) {
      message.error('Failed to update note');
    }
  };

  const renderNoteItem = (note: any) => {
    const isSelected = selectedNote === note.id || currentNote?.id === note.id;
    const isPinned = note.isPinned;
    
    const items: MenuProps['items'] = [
      {
        key: 'pin',
        label: isPinned ? 'Unpin' : 'Pin',
        icon: isPinned ? <StarOutlined /> : <StarFilled />,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          handleTogglePin(e.domEvent, note.id, isPinned);
        }
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          handleNoteClick(note.id);
        }
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        danger: true,
        icon: <DeleteOutlined />,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          handleDeleteNote(e.domEvent, note.id);
        }
      }
    ];

    return (
      <List.Item
        key={note.id}
        onClick={() => handleNoteClick(note.id)}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          transition: 'all 0.3s',
        }}
        className="note-list-item"
      >
        <div style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <h4 style={{ 
              margin: 0, 
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {note.title || 'Untitled Note'}
            </h4>
            <Space>
              {isPinned && (
                <span style={{ color: '#faad14' }}>
                  <StarFilled />
                </span>
              )}
              <Dropdown menu={{ items }} trigger={['click']}>
                <Button 
                  type="text" 
                  icon={<MoreOutlined />} 
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </Space>
          </div>
          
          <div style={{ 
            color: '#666',
            fontSize: '0.85rem',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {note.content?.replace(/<[^>]*>?/gm, '').substring(0, 150)}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {note.tags?.slice(0, 2).map((tag: string) => (
                <Tag key={tag} color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                  {tag}
                </Tag>
              ))}
              {note.tags?.length > 2 && <Tag>+{note.tags.length - 2}</Tag>}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#999' }}>
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: '0 0 16px 0' }}>Notes</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            block 
            onClick={handleCreateNew}
            style={{ marginBottom: '16px' }}
          >
            New Note
          </Button>
          
          <Search
            placeholder="Search notes..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ marginBottom: '16px' }}
          />
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: selectedFolder === folder.id ? '#e6f7ff' : 'transparent',
                  transition: 'all 0.3s',
                }}
              >
                <FolderOutlined style={{ marginRight: '8px' }} />
                <span>{folder.name}</span>
                {folder.id !== 'all' && folder.id !== 'pinned' && (
                  <span style={{ marginLeft: 'auto', color: '#999', fontSize: '0.8rem' }}>
                    {notes.filter(n => n.folderId === folder.id).length}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '16px' }}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : filteredNotes.length === 0 ? (
            <Empty 
              description={
                <span>
                  No notes found
                  {searchQuery && (
                    <>
                      <br />
                      <Button 
                        type="link" 
                        onClick={() => setSearchQuery('')}
                        style={{ marginTop: '8px' }}
                      >
                        Clear search
                      </Button>
                    </>
                  )}
                </span>
              }
              style={{ padding: '40px 0' }}
            />
          ) : (
            <List
              dataSource={filteredNotes}
              renderItem={renderNoteItem}
              style={{ padding: '8px 0' }}
            />
          )}
        </div>
      </div>
      
      {/* Note Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isCreatingNew ? (
          <NoteEditor onClose={() => setIsCreatingNew(false)} />
        ) : selectedNote || currentNote ? (
          <NoteEditor noteId={selectedNote || currentNote?.id} />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            padding: '40px',
            textAlign: 'center'
          }}>
            <h2>No Note Selected</h2>
            <p>Select a note from the list or create a new one</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateNew}
              style={{ marginTop: '16px' }}
            >
              New Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesList;
