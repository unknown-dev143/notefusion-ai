import React from 'react';
import { Typography } from 'antd';
import { NoteProvider } from '../../contexts/NoteContext';
import NotesList from '../../components/NotesList';
import styles from './NotesPage.module.css';

const { Title, Paragraph } = Typography;

const NotesPage: React.FC = () => {
  return (
    <NoteProvider>
      <div className={styles['notesPage']}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>My Notes</Title>
          <Paragraph type="secondary">Create and manage your notes</Paragraph>
        </div>
        <div className={styles['notesContainer']}>
          <NotesList />
        </div>
      </div>
    </NoteProvider>
  );
};

export default NotesPage;
