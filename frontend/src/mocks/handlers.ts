import { http, HttpResponse, delay } from 'msw';
import type { HttpHandler } from 'msw';
import { Note } from '../features/notes/types';

// In-memory storage for notes
let notes: Note[] = [
  {
    id: '1',
    title: 'Welcome to NoteFusion AI',
    content: 'This is your first note. Start writing!',
    tags: ['welcome', 'getting-started'],
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
  },
];

export const handlers: HttpHandler[] = [
  // Get all notes
  http.get('/api/notes', async ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const isArchived = url.searchParams.get('isArchived');
    const isDeleted = url.searchParams.get('isDeleted');
    const isPinned = url.searchParams.get('isPinned');

    let filteredNotes = [...notes];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(
        note =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (isArchived !== null) {
      filteredNotes = filteredNotes.filter(
        note => note.isArchived === (isArchived === 'true')
      );
    }

    if (isDeleted !== null) {
      filteredNotes = filteredNotes.filter(
        note => note.isDeleted === (isDeleted === 'true')
      );
    }

    if (isPinned !== null) {
      filteredNotes = filteredNotes.filter(
        note => note.isPinned === (isPinned === 'true')
      );
    }

    await delay(150);
    return HttpResponse.json(filteredNotes);
  }),

  // Get single note
  http.get('/api/notes/:id', async ({ params }) => {
    const { id } = params as { id: string };
    const note = notes.find(n => n.id === id);

    if (!note) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    await delay(150);
    return HttpResponse.json(note);
  }),

  // Create note
  http.post('/api/notes', async ({ request }) => {
    const newNote = (await request.json()) as Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isPinned' | 'isArchived' | 'isDeleted'>;
    
    // Ensure required fields are present
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: newNote.title || 'Untitled Note',
      content: newNote.content || '',
      tags: newNote.tags || [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1', // In a real app, this would come from auth context
    };

    notes = [note, ...notes];
    await delay(150);
    return HttpResponse.json(note);
  }),

  // Update note
  http.patch('/api/notes/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const updates = await request.json() as Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;
    
    // Find the note to update
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const existingNote = notes[noteIndex];
    if (!existingNote) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    // Create updated note with all required fields
    const updatedNote: Note = {
      id: existingNote.id,
      title: updates.title ?? existingNote.title,
      content: updates.content ?? existingNote.content,
      tags: updates.tags ?? existingNote.tags,
      isPinned: updates.isPinned ?? existingNote.isPinned,
      isArchived: updates.isArchived ?? existingNote.isArchived,
      isDeleted: updates.isDeleted ?? existingNote.isDeleted,
      userId: existingNote.userId,
      createdAt: existingNote.createdAt,
      updatedAt: new Date().toISOString(),
      version: existingNote.version ? existingNote.version + 1 : 1,
      lastEditedBy: 'current-user-id', // Add this field if it's required by the Note type
    };

    // Ensure required fields have defaults
    if (!updatedNote.title) updatedNote.title = 'Untitled Note';
    if (!updatedNote.content) updatedNote.content = '';
    if (!updatedNote.tags) updatedNote.tags = [];

    notes[noteIndex] = updatedNote;
    await delay(150);
    return HttpResponse.json(updatedNote);
  }),

  // Delete note
  http.delete('/api/notes/:id', async ({ params }) => {
    const { id } = params as { id: string };
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    notes = notes.filter(note => note.id !== id);
    await delay(150);
    return HttpResponse.json({ message: 'Note deleted' });
  }),

  // Toggle pin status
  http.patch('/api/notes/:id/toggle-pin', async ({ params }) => {
    const { id } = params as { id: string };
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const note = notes[noteIndex];
    if (!note) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const updatedNote: Note = {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      isPinned: !note.isPinned,
      isArchived: note.isArchived,
      isDeleted: note.isDeleted,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: new Date().toISOString(),
      version: note.version ? note.version + 1 : 1,
    };

    notes[noteIndex] = updatedNote;
    await delay(150);
    return HttpResponse.json(updatedNote);
  }),

  // Restore note
  http.patch('/api/notes/:id/restore', async ({ params }) => {
    const { id } = params as { id: string };
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const note = notes[noteIndex];
    if (!note) {
      await delay(150);
      return HttpResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const updatedNote: Note = {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      isDeleted: false,
      userId: note.userId,
      createdAt: note.createdAt,
      updatedAt: new Date().toISOString(),
      version: note.version ? note.version + 1 : 1,
    };

    notes[noteIndex] = updatedNote;
    await delay(150);
    return HttpResponse.json(updatedNote);
  }),
];
