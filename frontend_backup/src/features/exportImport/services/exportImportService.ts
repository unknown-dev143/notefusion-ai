// @ts-ignore - JSZip types are available but might not be detected
import JSZip from 'jszip';
// @ts-ignore - file-saver types are available but might not be detected
import { saveAs } from 'file-saver';
import { Note } from '../../../types/note';
import { noteService } from '../../notes/services/noteService';

export interface ExportOptions {
  format: 'pdf' | 'md' | 'txt' | 'json';
  includeMetadata?: boolean;
  includeAttachments?: boolean;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  importedNotes: Partial<Note>[];
}

class ExportImportService {
  private apiBaseUrl = '/api/export-import';

  // Single note export
  async exportNote(note: Note, options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note,
          format: options.format,
          includeMetadata: options.includeMetadata ?? true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export note');
      }

      return await response.blob();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Bulk export multiple notes
  async bulkExport(notes: Note[], format: 'zip' | 'json' = 'zip'): Promise<Blob> {
    if (format === 'json') {
      const data = JSON.stringify(notes, null, 2);
      return new Blob([data], { type: 'application/json' });
    }

    // For ZIP format, create individual files
    const zip = new JSZip();
    const notesFolder = zip.folder('notes');

    await Promise.all(
      notes.map(async (note) => {
        const content = JSON.stringify(note, null, 2);
        notesFolder?.file(`${note.title.replace(/[^\w\d]/g, '_')}.json`, content);
      })
    );

    const content = await zip.generateAsync({ type: 'blob' });
    return content;
  }

  // Import notes from files
  async importNotes(files: File[], userId: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      errors: [],
      importedNotes: [],
    };

    if (!userId) {
      result.success = false;
      result.errors.push('User ID is required for importing notes');
      return result;
    }

    for (const file of files) {
      try {
        const content = await this.readFileContent(file);
        const notes = this.parseImportFile(content, file.type);
        
        // Process each note sequentially to avoid overwhelming the server
        for (const note of notes) {
          try {
            const savedNote = await this.saveImportedNote(note, userId);
            result.importedCount++;
            result.importedNotes.push(savedNote);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`Failed to import note from ${file.name}: ${errorMessage}`);
            result.success = false;
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to process file ${file.name}: ${errorMessage}`);
        result.success = false;
      }
    }

    return result;
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file: No content'));
          return;
        }
        resolve(event.target.result as string);
      };
      reader.onerror = (event) => {
        reject(new Error(`Failed to read file: ${event.target?.error?.message || 'Unknown error'}`));
      };
      reader.readAsText(file);
    });
  }

  private parseImportFile(content: string, type: string): Partial<Note>[] {
    try {
      if (type === 'application/json') {
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [data];
      }
      
      // Handle other formats (TXT, MD) as new notes
      return [{
        title: 'Imported Note',
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    } catch (error) {
      throw new Error('Invalid file format');
    }
  }

  private async saveImportedNote(noteData: Partial<Note>, userId: string): Promise<Note> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Create a new note with the imported data
      const newNote = await noteService.createNote({
        title: noteData.title || 'Imported Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        folderId: noteData.folderId || null,
        isPinned: noteData.isPinned || false,
        isArchived: noteData.isArchived || false,
        userId: userId,
        // Note: createdAt/updatedAt are handled by the server
      });
      
      return newNote;
    } catch (error) {
      console.error('Failed to save imported note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save imported note: ${errorMessage}`);
    }
  }
}

export const exportImportService = new ExportImportService();
