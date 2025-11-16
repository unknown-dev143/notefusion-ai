import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  NoteFilters, 
  Folder, 
  NoteExportOptions, 
  NoteImportOptions, 
  Reminder
} from '../types/note';

// Mock data for development
const MOCK_NOTES: Note[] = [];
const MOCK_FOLDERS: Folder[] = [
  {
    id: 'folder_root',
    name: 'My Notes',
    parentId: null,
    notes: [],
    subfolders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'system',
    isExpanded: true
  }
];
const MOCK_REMINDERS: Reminder[] = [];

class NoteService {
  private notes: Note[] = [...MOCK_NOTES];
  private folders: Folder[] = JSON.parse(JSON.stringify(MOCK_FOLDERS));
  private reminders: Reminder[] = [...MOCK_REMINDERS];

  // Note Methods
  async getAllNotes(filters?: Partial<NoteFilters>): Promise<Note[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...this.notes];
        
        // Apply filters
        if (filters) {
          if (filters.folderId !== undefined) {
            result = result.filter(note => note.folderId === filters.folderId);
          }
          if (filters.isPinned !== undefined) {
            result = result.filter(note => note.isPinned === filters.isPinned);
          }
          if (filters.isArchived !== undefined) {
            result = result.filter(note => note.isArchived === filters.isArchived);
          }
          if (filters.isDeleted !== undefined) {
            result = result.filter(note => note.isDeleted === filters.isDeleted);
          }
          if (filters.tags?.length) {
            result = result.filter(note => 
              filters.tags?.some(tag => note.tags?.includes(tag))
            );
          }
          if (filters.reminder) {
            const now = new Date();
            result = result.filter(note => {
              if (!note.reminder) return false;
              const reminderDate = new Date(note.reminder);
              return filters.reminder === 'upcoming' 
                ? reminderDate > now 
                : reminderDate <= now;
            });
          }
        }
        
        resolve(result);
      }, 300);
    });
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.find(note => note.id === id);
  }

  async createNote(data: CreateNoteDto): Promise<Note> {
    if (!data.userId) {
      throw new Error('User ID is required to create a note');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newNote: Note = {
          ...data,
          id: `note_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          isPinned: data.isPinned || false,
          isArchived: data.isArchived || false,
          isDeleted: false,
          tags: data.tags || [],
          userId: data.userId,
          reminder: data.reminder || null,
          folderId: data.folderId || null,
          title: data.title || 'Untitled Note',
          content: data.content || ''
        };
        
        this.notes.unshift(newNote);
        resolve(newNote);
      }, 300);
    });
  }

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.notes.findIndex(note => note.id === id);
        
        if (index === -1) {
          return reject(new Error('Note not found'));
        }
        
        const currentNote = this.notes[index];
        if (!currentNote) {
          return reject(new Error('Note not found'));
        }

        const updatedNote: Note = {
          ...currentNote,
          ...data,
          // Ensure required fields are always present
          id: currentNote.id,
          userId: currentNote.userId,
          title: data.title ?? currentNote.title,
          content: data.content ?? currentNote.content,
          tags: data.tags ?? currentNote.tags,
          updatedAt: new Date().toISOString(),
          version: (currentNote.version || 1) + 1,
        };
        
        this.notes[index] = updatedNote;
        resolve(updatedNote);
      }, 300);
    });
  }

  async deleteNote(id: string): Promise<Note> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.notes.findIndex(note => note.id === id);
        
        if (index === -1) {
          return reject(new Error('Note not found'));
        }
        
        const currentNote = this.notes[index];
        if (!currentNote) {
          return reject(new Error('Note not found'));
        }
        
        // Soft delete
        const updatedNote: Note = {
          ...currentNote,
          isDeleted: true,
          updatedAt: new Date().toISOString(),
        };
        
        this.notes[index] = updatedNote;
        resolve(updatedNote);
      }, 300);
    });
  }

  async togglePinNote(id: string): Promise<Note> {
    const note = await this.getNoteById(id);
    if (!note) {
      throw new Error('Note not found');
    }
    
    return this.updateNote(id, { isPinned: !note.isPinned });
  }

  // Folder Methods
  async getFolders(parentId: string | null = null): Promise<Folder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.folders.filter(folder => folder.parentId === parentId);
        resolve(JSON.parse(JSON.stringify(result)));
      }, 300);
    });
  }

  async createFolder(name: string, parentId: string | null = null): Promise<Folder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFolder: Folder = {
          id: `folder_${Date.now()}`,
          name,
          parentId,
          notes: [],
          subfolders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'current-user-id', // This should come from auth context
          isExpanded: true
        };

        if (parentId) {
          const parent = this.findFolderById(parentId);
          if (parent) {
            parent.subfolders.push(newFolder);
          }
        } else {
          this.folders.push(newFolder);
        }

        resolve(JSON.parse(JSON.stringify(newFolder)));
      }, 300);
    });
  }

  async moveNoteToFolder(noteId: string, folderId: string | null): Promise<Note> {
    // In a real app, you might want to validate the folder exists
    if (folderId) {
      const folder = this.folders.find(f => f.id === folderId);
      if (!folder) {
        throw new Error('Folder not found');
      }
    }
    return this.updateNote(noteId, { folderId });
  }

  // Export/Import Methods
  async exportNote(noteId: string, options: NoteExportOptions): Promise<Blob> {
    const note = await this.getNoteById(noteId);
    if (!note) throw new Error('Note not found');

    let content = '';
    const metadata: string[] = [];
    
    // Add metadata if requested
    if (options.includeMetadata) {
      metadata.push(`Title: ${note.title}`);
      metadata.push(`Created: ${new Date(note.createdAt).toLocaleString()}`);
      metadata.push(`Updated: ${new Date(note.updatedAt).toLocaleString()}`);
      
      if (options.includeTags && note.tags?.length) {
        metadata.push(`Tags: ${note.tags.join(', ')}`);
      }
    }

    // Format content based on export type
    switch (options.format) {
      case 'markdown':
        content = [
          `# ${note.title}`,
          ...(metadata.length ? ['', ...metadata, ''] : []),
          note.content
        ].join('\n');
        break;
        
      case 'html':
        content = [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          `  <title>${this.escapeHtml(note.title)}</title>`, 
          '  <meta charset="UTF-8">',
          '  <style>body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }</style>',
          '</head>',
          '<body>',
          `  <h1>${this.escapeHtml(note.title)}</h1>`,
          ...(metadata.length ? [
            '  <div class="metadata">',
            ...metadata.map(m => `    <div>${this.escapeHtml(m)}</div>`),
            '  </div>',
            '  <hr/>'
          ] : []),
          `  <div>${note.content.replace(/\n/g, '<br>')}</div>`,
          '</body>',
          '</html>'
        ].join('\n');
        break;
        
      case 'txt':
        content = [
          note.title,
          '='.repeat(note.title.length),
          ...(metadata.length ? ['', ...metadata, ''] : []),
          note.content
        ].join('\n\n');
        break;
        
      case 'pdf':
        // In a real app, this would generate a PDF using a library like jsPDF or html2pdf
        content = [
          `PDF Export: ${note.title}`,
          '='.repeat(20),
          ...(metadata.length ? ['', ...metadata, ''] : []),
          note.content
        ].join('\n\n');
        break;
    }

    // Update last exported timestamp
    const updateData: UpdateNoteDto = {
      lastExportedAt: new Date().toISOString(),
      exportFormats: [...new Set([...(note.exportFormats || []), options.format])]
    };
    
    await this.updateNote(noteId, updateData);

    return new Blob([content], { type: this.getMimeType(options.format) });
  }

  async importNote(file: File, options: NoteImportOptions): Promise<Note> {
    if (!options?.userId) {
      throw new Error('User ID is required to import a note');
    }

    const content = await file.text();
    let title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
    
    // For markdown files, try to extract title from content
    if (options.format === 'markdown') {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch?.[1]) {
        title = titleMatch[1].trim();
      }
    }
    
    return this.createNote({
      title,
      content,
      folderId: options.folderId || null,
      tags: options.tags || [],
      isPinned: false,
      isArchived: false,
      userId: options.userId
    });
  }

  // Reminder Methods
  async setReminder(noteId: string, dueDate: string, userId: string, isRecurring: boolean = false, recurrencePattern?: string): Promise<Reminder> {
    const existingReminder = this.reminders.find(r => r.noteId === noteId);
    const now = new Date().toISOString();
    
    if (existingReminder) {
      existingReminder.dueDate = dueDate;
      existingReminder.isRecurring = isRecurring;
      existingReminder.updatedAt = now;
      existingReminder.userId = userId;
      existingReminder.recurrencePattern = recurrencePattern;
      return { ...existingReminder };
    }

    const newReminder: Reminder = {
      id: `reminder_${Date.now()}`,
      noteId,
      dueDate,
      userId,
      isRecurring,
      recurrencePattern,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.reminders.push(newReminder);
    
    // Update note with reminder
    const note = await this.getNoteById(noteId);
    if (note) {
      await this.updateNote(noteId, { reminder: dueDate });
    }

    return JSON.parse(JSON.stringify(newReminder));
  }

  async deleteReminder(noteId: string): Promise<void> {
    const index = this.reminders.findIndex(r => r.noteId === noteId);
    
    if (index !== -1) {
      const reminder = this.reminders[index];
      if (!reminder) return;
      
      this.reminders.splice(index, 1);
      
      // Remove reminder from note
      const note = await this.getNoteById(reminder.noteId);
      if (note) {
        await this.updateNote(reminder.noteId, { reminder: null } as UpdateNoteDto);
      }
    }
  }

  async getUpcomingReminders(userId: string): Promise<Array<{ note: Note; reminder: Reminder }>> {
    const now = new Date();
    const userReminders = this.reminders.filter(
      reminder => 
        reminder.userId === userId && 
        reminder.dueDate &&
        new Date(reminder.dueDate) > now &&
        !reminder.isCompleted
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const results: Array<{ note: Note; reminder: Reminder }> = [];
    for (const reminder of userReminders) {
      const note = await this.getNoteById(reminder.noteId);
      if (note) {
        results.push({ note, reminder });
      }
    }
    
    return results;
  }

  // Helper Methods
  private findFolderById(id: string): Folder | undefined {
    const findInFolders = (folders: Folder[]): Folder | undefined => {
      for (const folder of folders) {
        if (folder.id === id) return folder;
        const found = findInFolders(folder.subfolders || []);
        if (found) return found;
      }
      return undefined;
    };
    return findInFolders(this.folders);
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'markdown': 'text/markdown',
      'html': 'text/html',
      'txt': 'text/plain',
      'pdf': 'application/pdf'
    };
    return mimeTypes[format] || 'application/octet-stream';
  }
  
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const noteService = new NoteService();
