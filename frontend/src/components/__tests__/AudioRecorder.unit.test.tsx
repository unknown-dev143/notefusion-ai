import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioRecorder from '../AudioRecorder';
import { message } from 'antd';
import { vi } from 'vitest';

// Mock the MediaRecorder API
class MockMediaRecorder {
  static instances: MockMediaRecorder[] = [];
  ondataavailable: (event: { data: Blob }) => void;
  onstop: () => void;
  state: string;
  mimeType: string;
  stream: MediaStream;

  constructor(stream: MediaStream, options?: { mimeType: string }) {
    MockMediaRecorder.instances.push(this);
    this.state = 'inactive';
    this.mimeType = options?.mimeType || 'audio/wav';
    this.stream = stream;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test'], { type: this.mimeType }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  static clearInstances() {
    this.instances = [];
  }
}

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}

globalThis.MediaRecorder = MockMediaRecorder as any;

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

// Configure mediaDevices mock on both window.navigator and global.navigator
try {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  });
} catch (e) {
  (globalThis.navigator as any).mediaDevices = { getUserMedia: mockGetUserMedia };
}

if (globalThis.window && globalThis.window.navigator) {
  try {
    Object.defineProperty(globalThis.window.navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
      configurable: true,
    });
  } catch (e) {
    (globalThis.window.navigator as any).mediaDevices = { getUserMedia: mockGetUserMedia };
  }
}

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn().mockReturnValue('mock-audio-url');
if (typeof globalThis.URL.createObjectURL === 'undefined') {
  (globalThis.URL as any).createObjectURL = mockCreateObjectURL;
}
if (globalThis.window && typeof globalThis.window.URL.createObjectURL === 'undefined') {
  (globalThis.window.URL as any).createObjectURL = mockCreateObjectURL;
}

describe('AudioRecorder', () => {
  const mockOnRecordingComplete = jest.fn();
  const defaultProps = {
    onRecordingComplete: mockOnRecordingComplete,
    maxDuration: 300,
    autoTranscribe: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockMediaRecorder.clearInstances();
  });

  it('renders the record button', () => {
    render(<AudioRecorder {...defaultProps} />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('starts recording when the record button is clicked', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop/ })).toBeInTheDocument();
    });
  });

  it('stops recording and calls onRecordingComplete with audio data', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Stop recording
    const stopButton = await screen.findByRole('button', { name: /Stop/ });
    fireEvent.click(stopButton);
    
    // Wait for recording to complete
    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.any(String)
      );
    });
  });

  it('shows a timer when recording', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Check if timer is visible
    expect(await screen.findByText(/00:00/)).toBeInTheDocument();
  });

  it('stops recording when max duration is reached', async () => {
    let mockTime = 1000000;
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => mockTime);

    jest.useFakeTimers();
    render(<AudioRecorder {...defaultProps} maxDuration={1} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Wait for recording to be active and stop button visible
    await screen.findByRole('button', { name: /Stop/ });
    
    // Exceed max duration
    mockTime += 2000;
    await vi.advanceTimersByTimeAsync(2000);
    
    // Restore real timers so waitFor can run its polling loop correctly
    jest.useRealTimers();
    dateSpy.mockRestore();
    
    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalled();
    });
  });

  it('shows error when microphone access is denied', async () => {
    // Mock rejected getUserMedia
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
      new Error('Permission denied')
    );
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AudioRecorder {...defaultProps} />);
    
    // Try to start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Check for error message trigger
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        expect.stringContaining('Could not access microphone')
      );
    });
    
    consoleError.mockRestore();
  });

  it('pauses and resumes recording when the pause/resume button is clicked', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Pause recording
    const pauseButton = await screen.findByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    
    // UI should show Resume
    expect(await screen.findByRole('button', { name: /resume/i })).toBeInTheDocument();
    
    // Resume recording
    const resumeButton = screen.getByRole('button', { name: /resume/i });
    fireEvent.click(resumeButton);
    
    // Should show Pause again
    expect(await screen.findByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
});
