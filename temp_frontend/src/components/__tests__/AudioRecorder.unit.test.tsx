import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AudioRecorder } from '../AudioRecorder';

// Mock the MediaRecorder API
class MockMediaRecorder {
  static instances: MockMediaRecorder[] = [];
  ondataavailable: (event: { data: Blob }) => void;
  onstop: () => void;
  state: string;
  mimeType: string;

  constructor(stream: MediaStream, options?: { mimeType: string }) {
    MockMediaRecorder.instances.push(this);
    this.state = 'inactive';
    this.mimeType = options?.mimeType || 'audio/wav';
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

  requestData() {
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test'], { type: this.mimeType }) });
    }
  }

  static clearInstances() {
    this.instances = [];
  }
}

global.MediaRecorder = MockMediaRecorder as any;

// Mock the MediaDevices API
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
  writable: true,
});

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
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
  });

  it('stops recording and calls onRecordingComplete with audio data', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Stop recording
    const stopButton = await screen.findByRole('button', { name: /stop recording/i });
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
    jest.useFakeTimers();
    render(<AudioRecorder {...defaultProps} maxDuration={1} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Fast-forward time to exceed max duration
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  it('shows error when microphone access is denied', async () => {
    // Mock rejected getUserMedia
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
      new Error('Permission denied')
    );
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AudioRecorder {...defaultProps} />);
    
    // Try to start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });

  it('cancels recording when cancel button is clicked', async () => {
    render(<AudioRecorder {...defaultProps} />);
    
    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);
    
    // Click cancel
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Should not call onRecordingComplete
    expect(mockOnRecordingComplete).not.toHaveBeenCalled();
    
    // Should return to initial state
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });
});
