export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted?: boolean;
  folderId?: string | null;
  reminder?: string | null;
  lastExportedAt?: string;
  exportFormats?: string[];
  version: number;
  lastEditedBy?: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  folderId?: string | null;
  userId: string;
  reminder?: string | null;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  folderId?: string | null;
  reminder?: string | null;
  lastExportedAt?: string;
  exportFormats?: string[];
  lastEditedBy?: string;
}

export interface NoteFilters {
  folderId?: string | null;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  tags?: string[];
  reminder?: 'upcoming' | 'past';
}

export interface Folder extends BaseEntity {
  name: string;
  parentId: string | null;
  notes: Note[];
  subfolders: Folder[];
  isExpanded?: boolean;
}

export interface NoteExportOptions {
  format: 'markdown' | 'pdf' | 'html' | 'txt';
  includeMetadata?: boolean;
  includeTags?: boolean;
}

export interface NoteImportOptions {
  format: 'markdown' | 'html' | 'text';
  folderId?: string | null;
  tags?: string[];
  userId: string;
}

export interface Reminder {
  id: string;
  noteId: string;
  dueDate: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
