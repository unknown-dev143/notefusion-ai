import { useCallback, useMemo } from 'react';
import { Button, Typography, Empty, Skeleton, Pagination } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { AudioNote } from '../../services/audioService';
import styles from './AudioNoteList.module.css';
import './AudioNoteList.css';

// Extend CSSProperties to include CSS custom properties
declare module 'react' {
  interface CSSProperties {
    '--transform'?: string;
    '--height'?: string;
    '--width'?: string;
    '--position'?: string;
    '--top'?: string;
    '--left'?: string;
  }
}

const { Text, Title } = Typography;

interface AudioNoteListProps {
  notes: AudioNote[];
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
  const rowHeight = 120; // Height of each note item in pixels

  // Define the row renderer props type
  interface RowProps {
    index: number;
    style: {
      transform?: string;
      height: number | string;
    };
  }

  // Memoized row component for better performance
  const NoteCard = useCallback(({ index, style }: RowProps) => {
    const note = notes[index];
    if (!note) {
      console.warn(`No note found at index ${index}`);
      return null;
    }
    
    const isPlaying = activeNote === note.id;
    const formattedDate = new Date(note.createdAt).toLocaleString();
    const formattedDuration = note.duration > 0 
      ? `${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')}`
      : null;

    // Get dynamic styles as CSS class names
    const rowClassNames = [
      styles.virtualizedRow,
      styles.dynamic,
      style?.transform ? styles.dynamicTransform : '',
      isPlaying ? styles.playing : ''
    ].filter(Boolean).join(' ');
    
    // Calculate dynamic styles for the row using CSS custom properties
    const rowStyle: React.CSSProperties & {
      '--transform'?: string;
      '--height'?: string;
    } = {
      '--transform': typeof style?.transform === 'string' ? style.transform : 'none',
      '--height': typeof style?.height === 'number' ? `${style.height}px` : (style?.height as string) || 'auto'
    };
    
    return (
      <div 
        className={rowClassNames}
        style={rowStyle}
        data-testid="virtualized-row"
      >
        <div className={`${styles['noteCard']} ${isPlaying ? styles['playing'] : ''}`}>
          <div className={styles['noteHeader']}>
            <div className={styles['noteContent']}>
              <Title 
                level={5} 
                ellipsis={{ rows: 1, tooltip: note.title }}
                className={styles['noteTitle']}
              >
                {note.title || 'Untitled Note'}
              </Title>
              <div className={styles['noteMeta']}>
                <span>{formattedDate}</span>
                {formattedDuration && <span>• {formattedDuration}</span>}
              </div>
              {note.transcription && (
                <div className={styles['transcription']}>
                  <Text 
                    type="secondary" 
                    ellipsis={{
                      tooltip: note.transcription,
                    }}
                    className={styles['transcriptionText']}
                  >
                    {note.transcription}
                  </Text>
                </div>
              )}
            </div>
            <div className={styles['noteActions']}>
              <Button
                type="text"
                icon={isPlaying ? <LoadingOutlined spin /> : <PlayCircleOutlined />}
                onClick={() => onPlay(note.id)}
                className={`${styles['playButton']} ${isPlaying ? styles['playing'] : ''}`}
                disabled={isPlaying}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(note.id)}
                className={styles['deleteButton']}
                danger
              />
            </div>
          </div>
        </div>
      </div>
    );
  }, [activeNote, notes, onPlay, onDelete]);

  // Memoize the list container to prevent unnecessary re-renders
  const listContainer = useMemo(() => {
    if (!Array.isArray(notes)) {
      console.error('Invalid notes prop: expected an array');
      return <Empty description="Invalid notes data" />;
    }

    if (isLoading && notes.length === 0) {
      return (
        <div className="loading-container">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} active className="loading-skeleton" />
          ))}
        </div>
      );
    }

    if (!isLoading && notes.length === 0) {
      return <Empty description="No notes found" />;
    }

    return (
      <div className="virtualized-list">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <FixedSizeList
              className="virtualized-list-container"
              height={height}
              width={width}
              itemCount={notes.length}
              itemSize={rowHeight}
              itemKey={(index: number) => {
                const note = notes[index];
                if (!note || typeof note !== 'object') {
                  console.warn(`Invalid note at index ${index}`);
                  return `invalid-${index}`;
                }
                return note.id || `note-${index}`;
              }}
            >
              {NoteCard}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    );
  }, [isLoading, notes, NoteCard, page, pageSize, total, onPageChange]);

  return (
    <div className="audio-note-list">
      {listContainer}
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
          />
        </div>
      )}
    </div>
  );
};

export default AudioNoteList;
