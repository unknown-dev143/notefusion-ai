import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, waitFor, render } from '../../../__test__/test-utils';
import NotesPage from '../NotesPage';
import { Note } from '../../../features/notes/types/note';

// Mock the API
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../../../services/api', () => ({ default: mockApi }));

// Mock the NoteContext
const mockNote: Note = {
  id: '1',
  title: 'Test Note 1',
  content: 'This is a test note',
  tags: ['test'],
  isPinned: false,
  isArchived: false,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  userId: 'user1',
};

// Mock the searchNotes function
const mockSearchNotes = vi.fn((query: string) => {
  const notes = [mockNote];
  return Promise.resolve(
    notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(query.toLowerCase()))
    )
  );
});

// Mock the NoteContext
vi.mock('../../../features/notes/context/NoteContext', () => ({
  useNotes: () => ({
    notes: [mockNote],
    currentNote: null,
    loading: false,
    error: null,
    fetchNotes: vi.fn().mockResolvedValue(undefined),
    getNote: vi.fn((id: string) => 
      Promise.resolve(id === '1' ? mockNote : null)
    ),
    createNote: vi.fn((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => 
      Promise.resolve({ 
        ...note, 
        id: 'new-note-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user1'
      })
    ),
    updateNote: vi.fn((id: string, updates: Partial<Note>) => 
      Promise.resolve({ ...mockNote, ...updates, id })
    ),
    deleteNote: vi.fn().mockResolvedValue(undefined),
    pinNote: vi.fn().mockResolvedValue(undefined),
    archiveNote: vi.fn().mockResolvedValue(undefined),
    searchNotes: mockSearchNotes,
  }),
}));

describe('NotesPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the notes page with a list of notes', async () => {
    render(<NotesPage />);

    // Check if the page title is rendered
    const pageTitle = await screen.findByRole('heading', { name: /my notes/i });
    expect(pageTitle).toBeTruthy();
    
    // Check if the new note button is rendered
    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    expect(newNoteButton).toBeTruthy();
    
    // Check if the note list is rendered
    const testNote = await screen.findByText(/test note 1/i);
    expect(testNote).toBeTruthy();
  });

  it('allows creating a new note', async () => {
    const { getByRole, findByPlaceholderText } = render(<NotesPage />);

    // Click the "New Note" button
    const newNoteButton = getByRole('button', { name: /new note/i });
    fireEvent.click(newNoteButton);

    // Check if the note editor is shown
    const titleInput = await findByPlaceholderText(/title/i);
    expect(titleInput).toBeTruthy();
  });

  it('allows searching notes', async () => {
    const { findByPlaceholderText } = render(<NotesPage />);

    // Type in the search input
    const searchInput = await findByPlaceholderText(/search notes/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Check if the search was triggered
    expect((searchInput as HTMLInputElement).value).toBe('test');
  });

  it('allows selecting a note to view', async () => {
    const { findByText } = render(<NotesPage />);

    // Click on a note in the list
    const noteItem = await findByText(/test note 1/i);
    fireEvent.click(noteItem);

    // Check if the note content is displayed
    const noteContent = await screen.findByText(/this is a test note/i);
    expect(noteContent).toBeTruthy();
  });

  it('handles note deletion', async () => {
    const { queryByText } = render(<NotesPage />);

    // Click on a note's delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Check if the confirmation dialog is shown
    const confirmDialog = await screen.findByText(/are you sure you want to delete this note?/i);
    expect(confirmDialog).toBeTruthy();
    
    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);
    
    // Check if the note is removed from the list
    await waitFor(() => {
      const deletedNote = queryByText(/test note 1/i);
      expect(deletedNote).toBeNull();
    });
  });
});
