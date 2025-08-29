import React, { useCallback, memo } from 'react';
import { Button, Typography, Space, Empty, Skeleton, Pagination, Card, Tag } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { AudioNote } from '../../services/audioService';
import './AudioNoteList.css';

const { Text, Title } = Typography;

interface AudioNoteListProps {
  notes: Array<{
    id: string;
    title: string;
    url: string;
    createdAt: string | Date;
    duration: number;
    transcription?: string;
    tags?: string[];
  }>;
  isLoading: boolean;
  activeNote?: string;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const AudioNoteList: React.FC<AudioNoteListProps> = ({
  notes,
  isLoading,
  activeNote,
  onPlay,
  onDelete,
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const rowHeight = 120; // Approximate height of each note item

  // Memoized row component for better performance
  const renderNoteCard = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = notes[index];
    if (!note) return null;
    
    const isPlaying = activeNote === note.id;
    const formattedDate = new Date(note.createdAt).toLocaleString();
    const formattedDuration = note.duration > 0 
      ? `${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')}`
      : null;

    return (
      <div className="note-item" style={style}>
        <div className={`note-card ${isPlaying ? 'playing' : ''}`}>
          <div className="note-header">
            <div className="note-content">
              <Title 
                level={5} 
                ellipsis={{ tooltip: note.title }}
                className="note-title"
              >
                {note.title}
              </Title>
              <Space size="middle" className="note-meta">
                <Text type="secondary" className="note-date">
                  {formattedDate}
                </Text>
                {formattedDuration && (
                  <Tag color="blue" className="tag">
                    {formattedDuration}
                  </Tag>
                )}
              </Space>
              {note.transcription && (
                <Text
                  ellipsis={{ 
                    tooltip: note.transcription,
                    expandable: true,
                    symbol: 'more'
                  }}
                  className="transcript-preview"
                >
                  {note.transcription}
                </Text>
              )}
            </div>
            <div className="note-actions">
              <Button
                type={isPlaying ? 'primary' : 'default'}
                icon={isPlaying ? <LoadingOutlined /> : <PlayCircleOutlined />}
                onClick={() => onPlay(note.id)}
                loading={isPlaying && isLoading}
                className="play-button"
              >
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(note.id)}
                loading={isLoading}
                className="delete-button"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [notes, activeNote, isLoading, onPlay, onDelete]);

  // Loading state
  if (isLoading && notes.length === 0) {
    return (
      <Card className="loading-container">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 2 }}
            className="loading-skeleton"
          />
        ))}
      </Card>
    );
  }

  // Empty state
  if (!isLoading && notes.length === 0) {
    return (
      <div className="empty-state">
        <Empty description="No audio notes found" />
      </div>
    );
  }

  return (
    <div className="audio-note-list">
      <AutoSizer>
        {({ width, height }) => (
          <FixedSizeList
            width={width}
            height={height - 64} // Account for pagination height
            itemCount={notes.length}
            itemSize={rowHeight}
            itemData={notes}
          >
            {renderNoteCard}
          </FixedSizeList>
        )}
      </AutoSizer>
      {total > 0 && (
        <div className="pagination-container">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            onShowSizeChange={(_, size) => onPageChange(1, size)}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} items`}
            size="small"
            style={{ margin: 0 }}
          />
        </div>
      )}
    </div>
  );
};

export default AudioNoteList;
