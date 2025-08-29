import React from 'react';
import { NoteProvider } from '../../contexts/NoteContext';
import NotesList from '../../components/NotesList';
<<<<<<< HEAD
// TODO: Install @ant-design/pro-layout or replace with alternative component
import { PageContainer } from '@ant-design/pro-layout';
import styles from './NotesPage.module.css';
=======
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
        className={styles['notesPage']}
      >
        <div className={styles['notesContainer']}>
=======
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '24px', 
          borderRadius: '8px',
          height: '100%',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <NotesList />
        </div>
      </PageContainer>
    </NoteProvider>
  );
};

export default NotesPage;
