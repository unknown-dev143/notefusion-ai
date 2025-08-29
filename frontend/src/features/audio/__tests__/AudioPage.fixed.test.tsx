import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock components and hooks
vi.mock('@/components/audio/AudioRecorder', () => ({
  __esModule: true,
  default: () => <div data-testid="audio-recorder">Audio Recorder</div>
}));

vi.mock('@/components/audio/AudioPlayer', () => ({
  __esModule: true,
  default: () => <div data-testid="audio-player">Audio Player</div>
}));

// Mock API calls
vi.mock('@/api/audio', () => ({
  useGetAudioSessions: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useCreateAudioSession: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
  })),
}));

// Import the actual component after setting up mocks
import AudioPage from '../AudioPage';

// Test wrapper component
const renderAudioPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/audio']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AudioPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    renderAudioPage();
    expect(screen.getByTestId('audio-page')).toBeInTheDocument();
  });

  it('displays the main sections', () => {
    renderAudioPage();
    
    // Check for main sections
    expect(screen.getByTestId('audio-recorder')).toBeInTheDocument();
    expect(screen.getByTestId('audio-player')).toBeInTheDocument();
  });

  it('shows loading state when fetching sessions', () => {
    // Mock loading state
    vi.mock('@/api/audio', async () => {
      const actual = await vi.importActual('@/api/audio');
      return {
        ...actual,
        useGetAudioSessions: vi.fn(() => ({
          data: [],
          isLoading: true,
          error: null,
        })),
      };
    });

    renderAudioPage();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error state
    vi.mock('@/api/audio', async () => {
      const actual = await vi.importActual('@/api/audio');
      return {
        ...actual,
        useGetAudioSessions: vi.fn(() => ({
          data: null,
          isLoading: false,
          error: { message: 'Failed to load sessions' },
        })),
      };
    });

    renderAudioPage();
    await waitFor(() => {
      expect(screen.getByText(/failed to load sessions/i)).toBeInTheDocument();
    });
  });

  it('displays audio sessions when loaded', async () => {
    const mockSessions = [
      { id: '1', title: 'Meeting Notes', duration: '02:30', date: '2023-05-01' },
      { id: '2', title: 'Interview', duration: '15:45', date: '2023-05-02' },
    ];

    // Mock successful data
    vi.mock('@/api/audio', async () => {
      const actual = await vi.importActual('@/api/audio');
      return {
        ...actual,
        useGetAudioSessions: vi.fn(() => ({
          data: mockSessions,
          isLoading: false,
          error: null,
        })),
      };
    });

    renderAudioPage();
    
    await waitFor(() => {
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
      expect(screen.getByText('Interview')).toBeInTheDocument();
    });
  });
});
