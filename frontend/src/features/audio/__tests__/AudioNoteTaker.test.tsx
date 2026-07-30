import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AudioNoteTaker } from '../components/AudioNoteTaker';
import { message } from 'antd';
import { act } from 'react-dom/test-utils';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'audio.audioNotes': 'Audio Notes',
        'common.save': 'Save',
        'audio.startRecording': 'Start Recording',
        'audio.stopRecording': 'Stop Recording',
        'audio.pause': 'Pause',
        'audio.play': 'Play',
        'audio.addNotePlaceholder': 'Add a note...',
        'common.add': 'Add',
        'audio.notes': 'Notes',
        'common.delete': 'Delete',
        'audio.noteAdded': 'Note added',
        'audio.notesSaved': 'Notes saved',
        'audio.microphoneAccessDenied': 'Microphone access denied'
      };
      return translations[key] || key;
    }
  })
}));

describe('AudioNoteTaker', () => {
  const mockOnSave = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock media API
    const mockMediaStream = { getTracks: () => [{ stop: vi.fn() }] };
    
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
      },
      writable: true
    });
    
    window.AudioContext = vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      state: 'running'
    })) as any;
    
    window.webkitAudioContext = window.AudioContext;
    
    window.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      state: 'inactive',
      ondataavailable: null,
      onstop: null
    })) as any;
    
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
  });

  it('renders correctly', () => {
    render(<AudioNoteTaker onSave={mockOnSave} />);
    expect(screen.getByText('Audio Notes')).toBeInTheDocument();
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('starts and stops recording', async () => {
    // Spy on console.error to catch any hidden issues
    const consoleSpy = vi.spyOn(console, 'error');
    
    render(<AudioNoteTaker onSave={mockOnSave} />);
    
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);
    
    // Wait for async getUserMedia to resolve and state to update
    const stopButton = await screen.findByText('Stop Recording');
    expect(stopButton).toBeInTheDocument();
    expect(consoleSpy).not.toHaveBeenCalled();
    
    // Now input should be enabled
    const input = screen.getByPlaceholderText('Add a note...');
    expect(input).not.toBeDisabled();
    
    // Add a note
    fireEvent.change(input, { target: { value: 'This is a test note' } });
    fireEvent.click(screen.getByText('Add'));
    
    expect(await screen.findByText('This is a test note')).toBeInTheDocument();
    
    // Delete note
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(screen.queryByText('This is a test note')).not.toBeInTheDocument();
    });
    
    // Stop recording
    fireEvent.click(stopButton);
    expect(await screen.findByText('Start Recording')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('saves notes', async () => {
    const initialNotes = [
      { id: '1', timestamp: 123, content: 'Existing note', audioTime: 10 }
    ];
    
    render(<AudioNoteTaker onSave={mockOnSave} initialNotes={initialNotes} />);
    
    expect(screen.getByText('Existing note')).toBeInTheDocument();
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(initialNotes);
    expect(message.success).toHaveBeenCalledWith('Notes saved');
  });
});
