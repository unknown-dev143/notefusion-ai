import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { NoteProvider } from '../features/notes/context/NoteContext';
import { AuthProvider } from '../features/auth/context/AuthContext';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

// Custom render function that includes all necessary providers

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { queryClient: QueryClient } => {
  const queryClient = createTestQueryClient();
  
  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NoteProvider>
              {children}
            </NoteProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    ),
    ...options,
  });
  
  return {
    ...result,
    queryClient,
  };
};

// Re-export everything
export * from '@testing-library/react';
// Override render method
export { customRender as render };
// Export custom utilities
export { default as userEvent } from '@testing-library/user-event';
