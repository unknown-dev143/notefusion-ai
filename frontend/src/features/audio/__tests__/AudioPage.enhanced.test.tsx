import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AudioPage } from '../pages/AudioPage';
import '@testing-library/jest-dom';

// Mock child components with error states
vi.mock('../components/TextToSpeech', () => ({
  TextToSpeech: ({ onError }: { onError?: (error: Error) => void }) => {
    React.useEffect(() => {
      if (onError) {
        onError(new Error('TextToSpeech error'));
      }
    }, [onError]);
    return <div data-testid="text-to-speech">Text to Speech Component</div>;
  },
}));

vi.mock('../components/SpeechToText', () => ({
  SpeechToText: () => <div data-testid="speech-to-text">Speech to Text Component</div>,
}));

vi.mock('../components/AudioTranscriber', () => ({
  AudioTranscriber: () => <div data-testid="audio-transcriber">Audio Transcriber Component</div>,
}));

vi.mock('../components/AudioNoteTaker', () => ({
  AudioNoteTaker: () => <div data-testid="audio-note-taker">Audio Note Taker Component</div>,
}));

// Mock Ant Design components with proper TypeScript types
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Tabs: {
      ...actual.Tabs,
      TabPane: (props: any) => <div data-testid={`tab-${props.key}`}>{props.children}</div>,
    },
    message: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// Mock Ant Design Icons
vi.mock('@ant-design/icons', () => ({
  AudioOutlined: () => <span data-testid="audio-icon">AudioIcon</span>,
  SoundOutlined: () => <span data-testid="sound-icon">SoundIcon</span>,
  FileTextOutlined: () => <span data-testid="file-text-icon">FileTextIcon</span>,
  FileAddOutlined: () => <span data-testid="file-add-icon">FileAddIcon</span>,
}));

// Helper component to track navigation
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.search}</div>;
};

const renderAudioPage = (initialRoute = '/audio') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/audio" element={<AudioPage />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
};

// Mock Web Audio API
beforeAll(() => {
  // Mock AudioContext
  (window as any).AudioContext = vi.fn().mockImplementation(() => ({
    createMediaStreamSource: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createAnalyser: vi.fn().mockReturnValue({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
    }),
    close: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
  }));

  // Mock SpeechRecognition
  (window as any).SpeechRecognition = class {
    start = vi.fn();
    stop = vi.fn();
    onresult = vi.fn();
    onerror = vi.fn();
    onend = vi.fn();
    onstart = vi.fn();
    onaudiostart = vi.fn();
    onsoundstart = vi.fn();
    onspeechstart = vi.fn();
    onspeechend = vi.fn();
    onsoundend = vi.fn();
    onaudioend = vi.fn();
    onnomatch = vi.fn();
    continuous = false;
    interimResults = false;
    lang = '';
  };
});

describe('AudioPage - Enhanced Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('handles error states in child components', async () => {
    // Mock console.error to track error logging
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderAudioPage();
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error in TextToSpeech component:',
        expect.any(Error)
      );
    });
    
    consoleError.mockRestore();
  });

  it('handles tab changes with keyboard navigation (Home/End keys)', async () => {
    renderAudioPage();
    
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    
    // Test Home key (should go to first tab)
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Home' });
    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Text to Speech');
    });
    
    // Test End key (should go to last tab)
    fireEvent.keyDown(document.activeElement || document.body, { key: 'End' });
    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Audio Note Taker');
    });
  });

  it('updates URL when tab changes', async () => {
    renderAudioPage();
    
    // Click on Speech to Text tab
    fireEvent.click(screen.getByText('Speech to Text'));
    
    // Check if URL was updated
    expect(screen.getByTestId('location-display')).toHaveTextContent('?tab=stt');
    
    // Click on Audio Transcriber tab
    fireEvent.click(screen.getByText('Audio Transcriber'));
    
    // Check if URL was updated
    expect(screen.getByTestId('location-display')).toHaveTextContent('?tab=transcriber');
  });

  it('handles invalid tab parameter in URL', () => {
    // Render with invalid tab parameter
    renderAudioPage('/audio?tab=invalid');
    
    // Should default to first tab (Text to Speech)
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  it('maintains tab state when remounting', () => {
    // Initial render with Audio Transcriber tab active
    const { rerender } = render(
      <MemoryRouter initialEntries={['/audio?tab=transcriber']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should show Audio Transcriber content
    expect(screen.getByTestId('audio-transcriber')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <MemoryRouter initialEntries={['/audio?tab=transcriber']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should still show Audio Transcriber content
    expect(screen.getByTestId('audio-transcriber')).toBeInTheDocument();
  });

  it('applies proper ARIA attributes for accessibility', () => {
    renderAudioPage();
    
    const tabs = screen.getAllByRole('tab');
    const tabPanels = screen.getAllByRole('tabpanel', { hidden: true });
    
    // First tab should be selected by default
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'panel-tts');
    expect(tabPanels[0]).toHaveAttribute('aria-labelledby', 'tab-tts');
    
    // Other tabs should not be selected
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('handles tab changes with keyboard arrow keys', async () => {
    renderAudioPage();
    
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    
    // Test right arrow key
    fireEvent.keyDown(document.activeElement || document.body, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
    });
    
    // Test left arrow key
    fireEvent.keyDown(document.activeElement || document.body, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    });
  });

  it('handles tab changes with keyboard Home/End keys', async () => {
    renderAudioPage();
    
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    
    // Test End key (should go to last tab)
    fireEvent.keyDown(document.activeElement || document.body, { key: 'End' });
    await waitFor(() => {
      expect(screen.getByTestId('audio-note-taker')).toBeInTheDocument();
    });
    
    // Test Home key (should go to first tab)
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Home' });
    await waitFor(() => {
      expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    });
  });
});
