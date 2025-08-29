import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
<<<<<<< HEAD
import styles from './styles/ErrorBoundary.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import './index.css';
import App from './App';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Hide the initial loading indicator when the app mounts
const hideLoading = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
};

// Hide loading when the app starts
hideLoading();

// Render the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary 
      fallback={
<<<<<<< HEAD
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorMessage}>
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
=======
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          >
            Reload Page
          </button>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 4,
              colorBgContainer: '#ffffff',
            },
          }}
        >
          <Router>
            <App />
            <Toaster position="top-right" />
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
