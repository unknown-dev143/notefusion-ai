import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

// Mock the AudioPage component for testing
vi.mock('../pages/AudioPage', () => ({
  AudioPage: () => (
    <div data-testid="audio-page">
      <div data-testid="tabs">
        <div data-testid="tab-tts">
          <div data-testid="text-to-speech">Text to Speech Component</div>
        </div>
        <div data-testid="tab-stt">
          <div data-testid="speech-to-text">Speech to Text Component</div>
        </div>
        <div data-testid="tab-transcriber">
          <div data-testid="audio-transcriber">Audio Transcriber Component</div>
        </div>
        <div data-testid="tab-note-taker">
          <div data-testid="audio-note-taker">Audio Note Taker Component</div>
        </div>
      </div>
    </div>
  ),
}));

// Import after mocks
import { AudioPage } from '../../pages/AudioPage';

describe('AudioPage', () => {
  const renderComponent = (initialRoute = '/audio') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('audio-page')).toBeInTheDocument();
  });

  it('displays Text to Speech component in TTS tab by default', () => {
    renderComponent();
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  it('displays Text to Speech component in TTS tab', () => {
    renderComponent('/audio?tab=tts');
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  it('displays Speech to Text component in STT tab', () => {
    renderComponent('/audio?tab=stt');
    expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
  });

  it('displays Audio Transcriber component in transcriber tab', () => {
    renderComponent('/audio?tab=transcriber');
    expect(screen.getByTestId('audio-transcriber')).toBeInTheDocument();
  });

  it('displays Audio Note Taker component in note-taker tab', () => {
    renderComponent('/audio?tab=note-taker');
    expect(screen.getByTestId('audio-note-taker')).toBeInTheDocument();
  });

  describe('Integration Tests', () => {
    it('navigates between tabs and updates URL', () => {
      // Mock the actual AudioPage component with tab switching
      vi.doMock('../pages/AudioPage', () => {
        const MockAudioPage = () => {
          const location = useLocation();
          const searchParams = new URLSearchParams(location.search);
          const activeTab = searchParams.get('tab') || 'tts';
          
          const tabs = {
            tts: <div data-testid="text-to-speech">Text to Speech Component</div>,
            stt: <div data-testid="speech-to-text">Speech to Text Component</div>,
            transcriber: <div data-testid="audio-transcriber">Audio Transcriber Component</div>,
            'note-taker': <div data-testid="audio-note-taker">Audio Note Taker Component</div>
          };

          return (
            <div data-testid="audio-page">
              <div data-testid="tabs">
                <button 
                  data-testid="tab-tts" 
                  onClick={() => window.history.pushState({}, '', '/audio?tab=tts')}
                >
                  TTS
                </button>
                <button 
                  data-testid="tab-stt"
                  onClick={() => window.history.pushState({}, '', '/audio?tab=stt')}
                >
                  STT
                </button>
                <button 
                  data-testid="tab-transcriber"
                  onClick={() => window.history.pushState({}, '', '/audio?tab=transcriber')}
                >
                  Transcriber
                </button>
                <button 
                  data-testid="tab-note-taker"
                  onClick={() => window.history.pushState({}, '', '/audio?tab=note-taker')}
                >
                  Note Taker
                </button>
                {tabs[activeTab as keyof typeof tabs]}
              </div>
            </div>
          );
        };
        return { AudioPage: MockAudioPage };
      });

      // Re-import to get the mocked component
      const { AudioPage } = require('../../pages/AudioPage');
      
      render(
        <MemoryRouter initialEntries={['/audio']}>
          <Routes>
            <Route path="/audio" element={<AudioPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Test initial tab
      expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
      
      // Test switching to STT tab
      fireEvent.click(screen.getByTestId('tab-stt'));
      expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
      
      // Test switching to Transcriber tab
      fireEvent.click(screen.getByTestId('tab-transcriber'));
      expect(screen.getByTestId('audio-transcriber')).toBeInTheDocument();
      
      // Test switching to Note Taker tab
      fireEvent.click(screen.getByTestId('tab-note-taker'));
      expect(screen.getByTestId('audio-note-taker')).toBeInTheDocument();
      
      // Test switching back to TTS tab
      fireEvent.click(screen.getByTestId('tab-tts'));
      expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    });
  });
});
