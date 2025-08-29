import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioNoteTaker } from '../components/AudioNoteTaker';
import '@testing-library/jest-dom/vitest';

// Constants for mock data
const MOCK_TRACK_ID = 'mock-track-id';
const MOCK_STREAM_ID = 'mock-stream-id';
const MOCK_GROUP_ID = 'mock-group-id';
const MOCK_AUDIO_URL = 'blob:mock-audio-url';

// Extend the global Window interface to include our mocks
declare global {
  interface Window {
    MediaRecorder: typeof MediaRecorder;
    webkitAudioContext: typeof AudioContext;
  }
}

// Mock the MediaStreamTrack with proper type safety
class MockMediaStreamTrack implements MediaStreamTrack {
  id = MOCK_TRACK_ID;
  kind: 'audio' | 'video' = 'audio';
  label = 'Mock Microphone';
  enabled = true;
  muted = false;
  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  readyState: MediaStreamTrackState = 'live';
  onended: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  contentHint = '';
  
  getCapabilities(): MediaTrackCapabilities {
    return {};
  }
  
  getConstraints(): MediaTrackConstraints {
    return {} as MediaTrackConstraints;
  }
  
  getSettings(): MediaTrackSettings {
    return {} as MediaTrackSettings;
  }
  
  applyConstraints(constraints?: MediaTrackConstraints): Promise<void> {
    return Promise.resolve();
  }
  
  clone(): MediaStreamTrack {
    return new MockMediaStreamTrack();
  }
  
  stop(): void {
    this.readyState = 'ended';
    if (this.onended) {
      this.onended(new Event('ended'));
    }
  }
  
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    // Simplified implementation for testing
    if (type === 'ended' && listener && typeof listener === 'function') {
      this.onended = listener as (evt: Event) => void;
    }
  }
  
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    if (type === 'ended' && this.onended === listener) {
      this.onended = null;
    }
  }
  
  dispatchEvent(event: Event): boolean {
    if (event.type === 'ended' && this.onended) {
      this.onended(event);
    }
    return true;
  }
}

// Create a consistent MediaStream mock
const createMockMediaStream = (): MediaStream => {
  const track = new MockMediaStreamTrack();
  
  return {
    getTracks: vi.fn(() => [track]),
    getAudioTracks: vi.fn(() => [track]),
    getVideoTracks: vi.fn(() => []),
    getTrackById: vi.fn(() => track),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    clone: vi.fn(() => createMockMediaStream()),
    onaddtrack: null,
    onremovetrack: null,
    active: true,
    id: MOCK_STREAM_ID,
    onactive: null,
    oninactive: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  } as unknown as MediaStream;
};

// Mock the HTMLMediaElement
class MockHTMLMediaElement {
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  currentTime = 0;
  duration = 100;
  ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onended: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onerror: OnErrorEventHandler | null = null;
  
  addEventListener = vi.fn((event: string, callback: EventListenerOrEventListenerObject | null) => {
    if (event === 'timeupdate' && this.ontimeupdate && typeof this.ontimeupdate === 'function') {
      this.ontimeupdate(new Event('timeupdate'));
    }
  });
  
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

// Mock the BlobEvent class
class MockBlobEvent extends Event {
  data: Blob;
  
  constructor(type: string, eventInit: { data: Blob }) {
    super(type, eventInit);
    this.data = eventInit.data;
  }
}

// Mock requestAnimationFrame with proper cleanup
const setupRequestAnimationFrameMocks = () => {
  const timeouts = new Map<number, NodeJS.Timeout>();
  let nextId = 0;

  global.requestAnimationFrame = vi.fn((callback) => {
    const id = nextId++;
    const timeoutId = setTimeout(() => {
      timeouts.delete(id);
      callback(performance.now());
    }, 0);
    timeouts.set(id, timeoutId);
    return id;
  });

  global.cancelAnimationFrame = vi.fn((id) => {
    const timeoutId = timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeouts.delete(id);
    }
  });

  return () => {
    timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    timeouts.clear();
  };
};

describe('AudioNoteTaker', () => {
  const mockOnSave = vi.fn();
  let cleanupRequestAnimationFrame: () => void;

  beforeAll(() => {
    // Setup global mocks
    global.HTMLMediaElement = MockHTMLMediaElement as any;
    global.BlobEvent = MockBlobEvent as any;
    
    // Setup MediaRecorder mock
    class MockMediaRecorder {
      static isTypeSupported = vi.fn().mockReturnValue(true);
      
      start = vi.fn(() => {
        this.state = 'recording';
        if (this.onstart) this.onstart(new Event('start'));
        return undefined;
      });
      
      stop = vi.fn(() => {
        this.state = 'inactive';
        if (this.onstop) this.onstop(new Event('stop'));
        if (this.ondataavailable) {
          this.ondataavailable(new BlobEvent('dataavailable', { data: new Blob() }));
        }
        return undefined;
      });
      
      state = 'inactive';
      stream = createMockMediaStream();
      mimeType = 'audio/webm';
      requestData = vi.fn();
      pause = vi.fn();
      resume = vi.fn();
      onstart: ((this: MediaRecorder, ev: Event) => any) | null = null;
      onstop: ((this: MediaRecorder, ev: Event) => any) | null = null;
      onpause: ((this: MediaRecorder, ev: Event) => any) | null = null;
      onresume: ((this: MediaRecorder, ev: Event) => any) | null = null;
      onerror: ((this: MediaRecorder, ev: Event) => any) | null = null;
      ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null = null;
      
      addEventListener = vi.fn((event: string, callback: EventListenerOrEventListenerObject | null) => {
        if (event === 'dataavailable' && callback) {
          this.ondataavailable = callback as (ev: BlobEvent) => void;
        } else if (event === 'start' && callback) {
          this.onstart = callback as (ev: Event) => void;
        } else if (event === 'stop' && callback) {
          this.onstop = callback as (ev: Event) => void;
        } else if (event === 'pause' && callback) {
          this.onpause = callback as (ev: Event) => void;
        } else if (event === 'resume' && callback) {
          this.onresume = callback as (ev: Event) => void;
        } else if (event === 'error' && callback) {
          this.onerror = callback as (ev: Event) => void;
        }
      });
      
      removeEventListener = vi.fn();
      dispatchEvent = vi.fn();
    }
    
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

    // Mock the AudioContext
    class MockAudioContext {
      createMediaStreamSource = vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        context: this,
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      
      createAnalyser = vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn(),
        getByteTimeDomainData: vi.fn(),
        fftSize: 2048,
        minDecibels: -100,
        maxDecibels: -30,
        smoothingTimeConstant: 0.8,
        context: this,
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));
      
      close = vi.fn().mockResolvedValue(undefined);
      suspend = vi.fn().mockResolvedValue(undefined);
      resume = vi.fn().mockResolvedValue(undefined);
      state = 'suspended';
      sampleRate = 44100;
      baseLatency = 0.01;
      outputLatency = 0.01;
      audioWorklet = {
        addModule: vi.fn().mockResolvedValue(undefined)
      };
      destination = {
        channelCount: 2,
        connect: vi.fn(),
        disconnect: vi.fn(),
        context: this,
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      };
      onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null = null;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      dispatchEvent = vi.fn();
    }

    global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    global.webkitAudioContext = AudioContext as typeof globalThis.AudioContext;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    cleanupRequestAnimationFrame = setupRequestAnimationFrameMocks();
    
    // Mock mediaDevices with proper error handling
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockImplementation((constraints) => {
          if (!constraints || !constraints.audio) {
            return Promise.reject(new TypeError('Audio is required'));
          }
          return Promise.resolve(createMockMediaStream());
        }),
        enumerateDevices: vi.fn().mockResolvedValue([{
          deviceId: 'default',
          kind: 'audioinput',
          label: 'Default Microphone',
          groupId: MOCK_GROUP_ID,
          toJSON: () => ({})
        }])
      },
      configurable: true,
      writable: true,
    });
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => MOCK_AUDIO_URL);
    
    // Mock the Audio constructor
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      duration: 100,
      ontimeupdate: null,
      onplay: null,
      onpause: null,
      onended: null,
      onerror: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanupRequestAnimationFrame?.();
    
    // Reset all HTMLMediaElement mocks
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach(el => {
      const htmlEl = el as HTMLMediaElement;
      htmlEl.pause();
      htmlEl.currentTime = 0;
    });
  });

  afterAll(() => {
    // Clean up any remaining mocks
    vi.restoreAllMocks();
  });

  // Standardized test naming: should [expected behavior] when [condition]
  it('should render the component with initial state when mounted', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    expect(screen.getByText(/audio notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add a note at the current time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('should start and stop recording when buttons are clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await user.click(startButton);
    
    // Verify recording started
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await user.click(stopButton);
    
    // Verify recording stopped
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });
  });

  it('should handle errors when starting recording fails', async () => {
    // Mock getUserMedia to reject with an error
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
      new Error('Permission denied')
    );

    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Try to start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await user.click(startButton);
    
    // Verify error is handled
    await waitFor(() => {
      expect(screen.getByText(/error starting recording/i)).toBeInTheDocument();
    });
  });

  it('should add a note when the form is submitted', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await user.click(startButton);
    
    // Add a note
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    await user.type(noteInput, 'Test note');
    await user.click(addButton);
    
    // Verify note was added
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('should save notes when save button is clicked', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await user.click(startButton);
    
    // Add a note
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    await user.type(noteInput, 'Test note');
    await user.click(addButton);
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await user.click(stopButton);
    
    // Save the recording
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Verify save was called with the correct data
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: MOCK_AUDIO_URL,
        notes: expect.arrayContaining([
          expect.objectContaining({
            text: 'Test note',
            timestamp: expect.any(Number)
          })
        ])
      })
    );
  });

  // Add more tests for edge cases and additional functionality
  it('should handle empty notes', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await user.click(startButton);
    
    // Try to add an empty note
    const addButton = screen.getByRole('button', { name: /add note/i });
    await user.click(addButton);
    
    // Verify no note was added
    expect(screen.queryByTestId('note-item')).not.toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Test tab navigation
    await user.tab();
    expect(screen.getByRole('button', { name: /start recording/i })).toHaveFocus();
    
    // Test enter key on button
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
  });

  // Add more tests for other functionality as needed
});
