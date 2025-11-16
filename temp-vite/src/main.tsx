import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import App from './App';
import './index.css';

// Create a single instance of QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Theme configuration
const appTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      primaryColor: '#fff',
    },
    Layout: {
      headerBg: '#fff',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColor: 'rgba(0, 0, 0, 0.88)',
    },
    Menu: {
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
      itemHoverColor: '#1890ff',
      itemHoverBg: '#e6f7ff',
      itemActiveBg: '#e6f7ff',
    },
  },
};

// Root component
const Root = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={appTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
