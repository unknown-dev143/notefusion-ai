import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioPage } from '../features/audio/pages/AudioPage';

// Mock child components to isolate AudioPage testing
vi.mock('../features/audio/components/TextToSpeech', () => ({
  TextToSpeech: () => <div data-testid="text-to-speech-mock">TextToSpeech Mock</div>
}));
vi.mock('../features/audio/components/SpeechToText', () => ({
  SpeechToText: () => <div data-testid="speech-to-text-mock">SpeechToText Mock</div>
}));
vi.mock('../features/audio/components/AudioTranscriber', () => ({
  AudioTranscriber: () => <div data-testid="audio-transcriber-mock">AudioTranscriber Mock</div>
}));
vi.mock('../features/audio/components/AudioNoteTaker', () => ({
  AudioNoteTaker: () => <div data-testid="audio-note-taker-mock">AudioNoteTaker Mock</div>
}));

// Mock window.matchMedia for Ant Design Tabs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AudioPage', () => {
  it('renders the AudioPage component with title', () => {
    render(<AudioPage />);
    expect(screen.getByText('Audio Tools')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<AudioPage />);
    expect(screen.getByText('Text to Speech')).toBeInTheDocument();
    expect(screen.getByText('Speech to Text')).toBeInTheDocument();
    expect(screen.getByText('Audio Transcriber')).toBeInTheDocument();
    expect(screen.getByText('Audio Notes')).toBeInTheDocument();
  });
});
