import React from 'react';
import { NoteProvider } from '../../contexts/NoteContext';
import NotesList from '../../components/NotesList';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd';

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
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '24px', 
          borderRadius: '8px',
          height: '100%',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}>
          <NotesList />
        </div>
      </PageContainer>
    </NoteProvider>
  );
};

export default NotesPage;
