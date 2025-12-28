import React from 'react';
import { Result } from 'antd';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorBoundary from '../../../components/ErrorBoundary';
import NotesManager from '../components/NotesManager';
import { QuickActions } from '../../../components/QuickActions';

export const NotesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Result
        status="403"
        title="Unauthorized"
        subTitle="Please log in to view your notes"
      />
    );
  }

  return (
    <ErrorBoundary
      componentName="NotesPage"
      title="Error in Notes"
      subtitle="We encountered an error in the notes page. Please try refreshing the page."
    >
      <div style={{ padding: '1rem' }}>
        <QuickActions />
        <NotesManager />
      </div>
    </ErrorBoundary>
  );
};

export default NotesPage;
