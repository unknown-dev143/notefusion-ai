import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { AudioDemo } from '../AudioDemo';
import * as audioService from '../../services/audioService';

// Mock the audio service
jest.mock('../../services/audioService');

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
  const mockGetNotes = jest.spyOn(audioService, 'getNotes');
  const mockSaveNote = jest.spyOn(audioService, 'saveNote');
  const mockDeleteNote = jest.spyOn(audioService, 'deleteNote');
  const mockSearchNotes = jest.spyOn(audioService, 'searchNotes');

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockGetNotes.mockResolvedValue({ notes: [...mockAudioNotes] });
    mockSaveNote.mockImplementation(async (audioBlob: Blob, title: string) => ({
      id: 'new-id',
      url: 'http://example.com/new-audio.wav',
    }));
    mockDeleteNote.mockResolvedValue(undefined);
    mockSearchNotes.mockResolvedValue({
      notes: [mockAudioNotes[0]],
      total: 1,
      page: 1,
      totalPages: 1,
    });
    
    // Mock the Audio constructor
    window.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
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
    
    // Switch to search tab
    const searchTab = screen.getByRole('tab', { name: /search notes/i });
    fireEvent.click(searchTab);
    
    // Should show search interface
    expect(await screen.findByPlaceholderText('Search transcriptions...')).toBeInTheDocument();
  });

  it('searches for notes', async () => {
    renderComponent();
    
    // Go to search tab
    const searchTab = screen.getByRole('tab', { name: /search notes/i });
    fireEvent.click(searchTab);
    
    // Enter search query
    const searchInput = await screen.findByPlaceholderText('Search transcriptions...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search to complete
    await waitFor(() => {
      expect(mockSearchNotes).toHaveBeenCalledWith(
        'test',
        expect.any(Object),
        expect.any(Number),
        expect.any(Number)
      );
    });
    
    // Should show search results
    expect(await screen.findByText('Test Note 1')).toBeInTheDocument();
  });

  it('deletes a note', async () => {
    renderComponent();
    
    // Wait for notes to load
    await screen.findByText('Test Note 1');
    
    // Click delete button on first note
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Should call delete API
    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalledWith('1');
    });
    
    // Should refetch notes
    expect(mockGetNotes).toHaveBeenCalledTimes(2);
  });

  it('plays a note', async () => {
    renderComponent();
    
    // Wait for notes to load
    await screen.findByText('Test Note 1');
    
    // Click play button on first note
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    fireEvent.click(playButtons[0]);
    
    // Should set active note
    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API call
    mockGetNotes.mockRejectedValueOnce(new Error('API Error'));
    
    // Mock console.error to avoid error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderComponent();
    
    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load audio notes/i)).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });

  it('paginates through notes', async () => {
    // Mock paginated response
    mockGetNotes.mockResolvedValueOnce({
      notes: mockAudioNotes,
      total: 15,
      page: 1,
      totalPages: 2,
    });
    
    renderComponent();
    
    // Wait for notes to load
    await screen.findByText('Test Note 1');
    
    // Should show pagination
    const pagination = await screen.findByRole('navigation', { name: /pagination/i });
    expect(pagination).toBeInTheDocument();
    
    // Mock next page response
    mockGetNotes.mockResolvedValueOnce({
      notes: [
        {
          id: '3',
          title: 'Test Note 3',
          url: 'http://example.com/audio3.wav',
          transcription: 'Third test note',
          duration: 60,
          createdAt: '2023-01-03T00:00:00Z',
          updatedAt: '2023-01-03T00:00:00Z',
        },
      ],
      total: 15,
      page: 2,
      totalPages: 2,
    });
    
    // Click next page
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Should load next page
    await waitFor(() => {
      expect(mockGetNotes).toHaveBeenCalledWith(2, 10); // page 2, default page size 10
    });
  });
});
