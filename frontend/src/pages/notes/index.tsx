import React from 'react';
import { NoteProvider } from '../../contexts/NoteContext';
import NotesList from '../../components/NotesList';
// TODO: Install @ant-design/pro-layout or replace with alternative component
import { PageContainer } from '@ant-design/pro-layout';
import styles from './NotesPage.module.css';

const NotesPage: React.FC = () => {
  return (
    <NoteProvider>
      <PageContainer 
        title="My Notes"
        content="Create and manage your notes"
        header={{
          title: 'Notes',
          breadcrumb: {
            items: [
              { title: 'Home', path: '/' },
              { title: 'Notes' },
            ],
          },
        }}
        className={styles['notesPage']}
      >
        <div className={styles['notesContainer']}>
          <NotesList />
        </div>
      </PageContainer>
    </NoteProvider>
  );
};

export default NotesPage;
