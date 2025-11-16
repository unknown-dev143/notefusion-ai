import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AudioPage } from '../pages/AudioPage';
import '@testing-library/jest-dom';

// Mock child components
vi.mock('../components/TextToSpeech', () => ({
  TextToSpeech: () => <div data-testid="text-to-speech">Text to Speech Component</div>,
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

// Mock Ant Design Icons
vi.mock('@ant-design/icons', () => ({
  AudioOutlined: () => <span data-testid="audio-icon">AudioIcon</span>,
  SoundOutlined: () => <span data-testid="sound-icon">SoundIcon</span>,
  FileTextOutlined: () => <span data-testid="file-text-icon">FileTextIcon</span>,
  FileAddOutlined: () => <span data-testid="file-add-icon">FileAddIcon</span>,
}));

// Mock Ant Design Tabs
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  const Tabs = {
    ...actual.Tabs,
    TabPane: (props: any) => <div data-testid={`tab-${props.key}`}>{props.children}</div>,
  };
  return { ...actual, Tabs };
});

// Test wrapper component
const renderAudioPage = () => {
  return render(
    <MemoryRouter initialEntries={['/audio']}>
      <Routes>
        <Route path="/audio" element={<AudioPage />} />
      </Routes>
    </MemoryRouter>
  );
};

// Mock Web Audio API
beforeAll(() => {
  // Mock AudioContext
  (window as any).AudioContext = vi.fn().mockImplementation(() => ({
    createMediaStreamSource: vi.fn(),
    createAnalyser: vi.fn(),
    close: vi.fn(),
    suspend: vi.fn(),
    resume: vi.fn(),
  }));

  // Mock MediaDevices
  Object.defineProperty(window.navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({} as MediaStream),
      enumerateDevices: vi.fn().mockResolvedValue([]),
    },
    configurable: true,
  });
});

describe('AudioPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderAudioPage();
    expect(screen.getByText('Audio Tools')).toBeInTheDocument();
  });

  it('renders all tabs with correct icons', () => {
    renderAudioPage();
    
    // Check if all tab labels are rendered with icons
    expect(screen.getByTestId('sound-icon')).toBeInTheDocument();
    expect(screen.getByText('Text to Speech')).toBeInTheDocument();
    
    expect(screen.getByTestId('audio-icon')).toBeInTheDocument();
    expect(screen.getByText('Speech to Text')).toBeInTheDocument();
    
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    expect(screen.getByText('Audio Transcriber')).toBeInTheDocument();
    
    expect(screen.getByTestId('file-add-icon')).toBeInTheDocument();
    expect(screen.getByText('Audio Note Taker')).toBeInTheDocument();
  });

  it('displays Text to Speech tab by default', () => {
    renderAudioPage();
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    renderAudioPage();
    
    // Click on Speech to Text tab
    fireEvent.click(screen.getByText('Speech to Text'));
    expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
    
    // Click on Audio Transcriber tab
    fireEvent.click(screen.getByText('Audio Transcriber'));
    expect(screen.getByTestId('audio-transcriber')).toBeInTheDocument();
    
    // Click on Audio Note Taker tab
    fireEvent.click(screen.getByText('Audio Note Taker'));
    expect(screen.getByTestId('audio-note-taker')).toBeInTheDocument();
    
    // Go back to Text to Speech tab
    fireEvent.click(screen.getByText('Text to Speech'));
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  it('handles tab changes with keyboard navigation', async () => {
    renderAudioPage();
    
    // Focus the tab list
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

  it('renders with proper accessibility attributes', () => {
    renderAudioPage();
    
    // Check if tabs have proper ARIA attributes
    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab, index) => {
      expect(tab).toHaveAttribute('aria-selected', index === 0 ? 'true' : 'false');
      expect(tab).toHaveAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    
    // Check if tab panels have proper ARIA attributes
    const tabPanels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(tabPanels[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('displays correct tab content when URL changes', () => {
    render(
      <MemoryRouter initialEntries={['/audio?tab=stt']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
  });

  it('changes active tab when tab is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/audio']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Click on Speech to Text tab
    const speechToTextTab = screen.getByText('Speech to Text').closest('div[role="tab"]');
    if (speechToTextTab) {
      fireEvent.click(speechToTextTab);
      // Check if the correct tab content is shown
      expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
    } else {
      throw new Error('Speech to Text tab not found');
    }
  });

  it('changes tab content when tab is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/audio']}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Verify initial tab content
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    
    // Click on Speech to Text tab
    const speechToTextTab = screen.getByText('Speech to Text').closest('div[role="tab"]');
    if (speechToTextTab) {
      fireEvent.click(speechToTextTab);
      
      // Verify new tab content is shown
      expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
    } else {
      throw new Error('Speech to Text tab not found');
    }
  });
});
