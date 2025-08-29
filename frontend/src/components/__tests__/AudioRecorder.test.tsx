import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioRecorder from '../AudioRecorder';

// Mock the MediaRecorder API
class MediaRecorderMock {
  stream: MediaStream;
  ondataavailable: (event: { data: Blob }) => void;
  onstop: () => void;
  state: string;

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.state = 'inactive';
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  requestData() {
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob() });
    }
  }
}

// Mock the global MediaRecorder
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation((stream) => new MediaRecorderMock(stream)),
});

// Mock the mediaDevices API
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue('mockStream'),
  },
});

// Mock URL.createObjectURL
window.URL.createObjectURL = jest.fn(() => 'mock-audio-url');

describe('AudioRecorder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the record button initially', () => {
    render(<AudioRecorder />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('starts recording when record button is clicked', async () => {
    render(<AudioRecorder />);
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  it('shows pause button when recording', async () => {
    render(<AudioRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  it('pauses and resumes recording', async () => {
    render(<AudioRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    
    // Pause recording
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    
    // Resume recording
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('stops recording and shows audio player', async () => {
    const onRecordingComplete = jest.fn();
    render(<AudioRecorder onRecordingComplete={onRecordingComplete} />);
    
    // Start and stop recording
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(onRecordingComplete).toHaveBeenCalled();
    });
  });

  it('shows progress bar when recording', async () => {
    render(<AudioRecorder maxDuration={60} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    
    // Fast-forward time
    jest.advanceTimersByTime(10000); // 10 seconds
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // Should be ~16.67% after 10 seconds of 60 second max duration
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '16.666666666666664');
    });
  });
});
