import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import AudioDemo from '../AudioDemo.new';
import { audioService } from '../../services/audioService';
import { message } from 'antd';

// Mock the audio service
vi.mock('../../services/audioService');

const mockAudioNotes = [
  {
    id: '1',
    title: 'Test Note 1',
    url: 'http://example.com/audio1.wav',
    transcription: 'This is a test transcription',
    duration: 45,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Note 2',
    url: 'http://example.com/audio2.wav',
    transcription: 'Another test transcription',
    duration: 30,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
];

describe('AudioDemo Integration', () => {
  const mockGetNotes = vi.spyOn(audioService, 'getNotes');
  const mockSaveNote = vi.spyOn(audioService, 'saveNote');
  const mockDeleteNote = vi.spyOn(audioService, 'deleteNote');

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockGetNotes.mockResolvedValue({ notes: [...mockAudioNotes], total: 2, hasMore: false });
    mockSaveNote.mockImplementation(async (audioBlob: Blob, title: string) => ({
      id: 'new-id',
      url: 'http://example.com/new-audio.wav',
    }));
    mockDeleteNote.mockResolvedValue(undefined);
    
    // Mock the Audio constructor
    window.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as any;
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AudioDemo />
      </BrowserRouter>
    );
  };

  it('loads and displays audio notes', async () => {
    renderComponent();
    
    // Wait for notes to load
    await waitFor(() => {
      expect(mockGetNotes).toHaveBeenCalledTimes(1);
    });
    
    // Check if notes are displayed
    expect(await screen.findByText('Test Note 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Note 2')).toBeInTheDocument();
  });

  it('switches between create and search tabs', async () => {
    renderComponent();
    
    // Initially on create tab
    expect(await screen.findByText('Record New Note')).toBeInTheDocument();
    
    // Switch to search tab using the Ant Design tab structure
    const searchTab = screen.getByText('Search Notes');
    fireEvent.click(searchTab);
    
    // Should show search interface - the Search Component has a Search Notes title
    expect(await screen.findByText('Search Audio Notes')).toBeInTheDocument();
  });

  it('deletes a note', async () => {
    renderComponent();
    
    // Wait for notes to load
    await screen.findByText('Test Note 1');
    
    // Find the first delete button (it has text "Delete")
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Should call delete API
    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalledWith('1');
    });
    
    // And message.success should be called
    expect(message.success).toHaveBeenCalledWith('Note deleted successfully');
  });

  it('plays a note', async () => {
    renderComponent();
    
    // Wait for notes to load
    await screen.findByText('Test Note 1');
    
    // Click play button on first note
    const playButtons = screen.getAllByText('Play');
    fireEvent.click(playButtons[0]);
    
    // Should set active note
    expect(await screen.findByText('Playing...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API call
    mockGetNotes.mockRejectedValueOnce(new Error('API Error'));
    
    // Mock console.error to avoid error logs in test output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderComponent();
    
    // Wait for message.error to be called because we mocked it in setupTests
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Failed to load audio notes');
    });
    
    consoleError.mockRestore();
  });
});
