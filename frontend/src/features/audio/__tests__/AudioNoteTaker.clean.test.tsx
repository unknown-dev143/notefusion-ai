import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioNoteTaker } from '../components/AudioNoteTaker';
import '@testing-library/jest-dom/vitest';

// Import mock implementations
import {
  MockMediaStreamTrack,
  MockHTMLMediaElement,
  MockMediaRecorder,
  MockAudioContext,
  MockBlobEvent
} from '../../../test-utils/mocks/mediaMocks';

// Mock the global MediaStream
class MockMediaStream implements MediaStream {
  private _tracks: MediaStreamTrack[] = [new MockMediaStreamTrack()];
  
  getTracks(): MediaStreamTrack[] {
    return [...this._tracks];
  }
  
  getAudioTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'audio');
  }
  
  getVideoTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'video');
  }
  
  getTrackById(trackId: string): MediaStreamTrack | null {
    return this._tracks.find(track => track.id === trackId) || null;
  }
  
  addTrack(track: MediaStreamTrack): void {
    if (!this._tracks.some(t => t === track)) {
      this._tracks.push(track);
    }
  }
  
  removeTrack(track: MediaStreamTrack): void {
    const index = this._tracks.indexOf(track);
    if (index !== -1) {
      this._tracks.splice(index, 1);
    }
  }
  
  clone(): MediaStream {
    const stream = new MockMediaStream();
    this._tracks.forEach(track => stream.addTrack(track.clone()));
    return stream;
  }
  
  // Required properties for MediaStream
  active = true;
  id = 'mock-stream-id';
  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  
  // EventTarget implementation
  private _listeners: Record<string, EventListener[]> = {};
  
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!listener) return;
    
    const wrappedListener = (e: Event) => {
      if (typeof listener === 'function') {
        listener(e);
      } else if ('handleEvent' in listener) {
        listener.handleEvent(e);
      }
    };

    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(wrappedListener);
  }
  
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    if (!listener || !this._listeners[type]) return;
    
    this._listeners[type] = this._listeners[type].filter(l => 
      l !== listener && 
      (typeof listener !== 'function' ? l !== (listener as EventListenerObject).handleEvent : true)
    );
  }
  
  dispatchEvent(event: Event): boolean {
    const type = event.type;
    const listeners = this._listeners[type] || [];
    
    for (const listener of [...listeners]) {
      try {
        listener.call(this, event);
      } catch (e) {
        console.error('Error in event listener', e);
      }
    }

    // Call the corresponding on* handler if it exists
    const handler = this[`on${type}` as keyof this];
    if (typeof handler === 'function') {
      try {
        (handler as Function).call(this, event);
      } catch (e) {
        console.error('Error in event handler', e);
      }
    }

    return !event.defaultPrevented;
  }
  
  // Required for TypeScript
  [Symbol.iterator](): IterableIterator<MediaStreamTrack> {
    return this._tracks[Symbol.iterator]();
  }
  
  toJSON(): any {
    return {};
  }
}

// Mock the global URL
class MockURL {
  static createObjectURL(blob: Blob): string {
    return `blob:${URL.createObjectURL(blob)}`;
  }
  
  static revokeObjectURL(url: string): void {
    // No-op for testing
  }
}

describe('AudioNoteTaker', () => {
  const mockOnSave = vi.fn();
  
  // Mock globals
  beforeAll(() => {
    // Mock HTMLMediaElement
    global.HTMLMediaElement = MockHTMLMediaElement as any;
    
    // Mock MediaRecorder
    global.MediaRecorder = MockMediaRecorder as any;
    
    // Mock AudioContext
    global.AudioContext = MockAudioContext as any;
    (global as any).webkitAudioContext = MockAudioContext as any;
    
    // Mock BlobEvent
    global.BlobEvent = MockBlobEvent as any;
    
    // Mock URL
    global.URL = MockURL as any;
    
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
        enumerateDevices: vi.fn().mockResolvedValue([
          {
            deviceId: 'default',
            kind: 'audioinput',
            label: 'Default Microphone',
            groupId: 'default-group',
            toJSON: () => ({})
          }
        ])
      },
      writable: true
    });
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the component', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    expect(screen.getByText(/audio note taker/i)).toBeInTheDocument();
  });
  
  it('starts and stops recording', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    expect(screen.getByText(/recording.../i)).toBeInTheDocument();
    
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    expect(screen.queryByText(/recording.../i)).not.toBeInTheDocument();
  });
  
  it('adds a note with timestamp', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    const noteInput = screen.getByPlaceholderText(/type your note here.../i);
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    expect(screen.getByText(/test note/i)).toBeInTheDocument();
    expect(screen.getByText(/\d+:\d+/i)).toBeInTheDocument(); // Matches timestamp format
  });
  
  it('saves notes when clicking save', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Add a note
    const noteInput = screen.getByPlaceholderText(/type your note here.../i);
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /save notes/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        text: 'Test note',
        timestamp: expect.any(Number)
      })
    ]));
  });
  
  it('clears notes when clicking clear', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Add a note
    const noteInput = screen.getByPlaceholderText(/type your note here.../i);
    const addButton = screen.getByRole('button', { name: /add note/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    // Click clear
    const clearButton = screen.getByRole('button', { name: /clear notes/i });
    await act(async () => {
      fireEvent.click(clearButton);
    });
    
    expect(screen.queryByText(/test note/i)).not.toBeInTheDocument();
  });
  
  it('handles recording errors', async () => {
    // Mock getUserMedia to reject
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    (navigator.mediaDevices.getUserMedia as any) = vi.fn().mockRejectedValue(new Error('Microphone access denied'));
    
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    expect(consoleError).toHaveBeenCalledWith('Error accessing microphone:', expect.any(Error));
    
    // Restore mock
    (navigator.mediaDevices.getUserMedia as any) = originalGetUserMedia;
    consoleError.mockRestore();
  });
});
