import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AudioPage } from '../pages/AudioPage';

// Extend the global Window interface
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  // Define the SpeechRecognition interface if not already defined
  interface SpeechRecognition extends EventTarget {
    start: () => void;
    stop: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    onstart: () => void;
    onaudiostart: () => void;
    onsoundstart: () => void;
    onspeechstart: () => void;
    onspeechend: () => void;
    onsoundend: () => void;
    onaudioend: () => void;
    onnomatch: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  }
}

// Type definitions for mocks
interface MockAudioContext {
  createMediaStreamSource: () => MediaStreamAudioSourceNode;
  createAnalyser: () => AnalyserNode;
  close: () => void;
  suspend: () => Promise<void>;
  resume: () => Promise<void>;
}

interface MockSpeechRecognition extends EventTarget {
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart: () => void;
  onaudiostart: () => void;
  onsoundstart: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onsoundend: () => void;
  onaudioend: () => void;
  onnomatch: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    SpeechRecognition: new () => MockSpeechRecognition;
    webkitSpeechRecognition: new () => MockSpeechRecognition;
  }
}

// Mock child components
vi.mock('../components/TextToSpeech', () => ({
  TextToSpeech: () => <div data-testid="text-to-speech">Text to Speech Component</div>
}));

vi.mock('../components/SpeechToText', () => ({
  SpeechToText: () => <div data-testid="speech-to-text">Speech to Text Component</div>
}));

vi.mock('../components/AudioTranscriber', () => ({
  AudioTranscriber: () => <div data-testid="audio-transcriber">Audio Transcriber Component</div>
}));

vi.mock('../components/AudioNoteTaker', () => ({
  AudioNoteTaker: () => <div data-testid="audio-note-taker">Audio Note Taker Component</div>
}));

// Mock Ant Design components
vi.mock('antd', () => ({
  Tabs: ({ items }: { items: Array<{ key: string; children: React.ReactNode }> }) => (
    <div data-testid="mock-tabs">
      {items?.map((item) => (
        <div key={item.key} data-testid={`tab-${item.key}`}>
          {item.children}
        </div>
      ))}
    </div>
  ),
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <button data-testid="mock-button" {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div data-testid="mock-card" {...props}>
      {children}
    </div>
  )
}));

// Mock Ant Design Icons
vi.mock('@ant-design/icons', () => ({
  AudioOutlined: () => <span>AudioIcon</span>,
  SoundOutlined: () => <span>SoundIcon</span>,
  FileTextOutlined: () => <span>FileTextIcon</span>,
  FileAddOutlined: () => <span>FileAddIcon</span>
}));

// Mock Web Audio API
class MockAudioContextImpl implements MockAudioContext {
  createMediaStreamSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn()
  });
  createAnalyser = vi.fn().mockReturnValue({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn()
  });
  close = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  resume = vi.fn().mockResolvedValue(undefined);
}

// Mock SpeechRecognition
class MockSpeechRecognitionImpl extends EventTarget implements MockSpeechRecognition {
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
}

describe('AudioPage', () => {
  beforeAll(() => {
    // Set up global mocks
    global.AudioContext = MockAudioContextImpl as unknown as typeof AudioContext;
    global.SpeechRecognition = MockSpeechRecognitionImpl as any;
    global.webkitSpeechRecognition = MockSpeechRecognitionImpl as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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
    expect(screen.getByTestId('mock-tabs')).toBeInTheDocument();
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
});
