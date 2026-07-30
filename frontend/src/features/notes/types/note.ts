export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface NoteAnnotation {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  blockId?: string;
  position?: { x: number; y: number };
}

export type NoteObjectType = 'Meeting' | 'Person' | 'Project' | 'Concept' | 'Task' | 'Literature' | 'Generic';

export interface Note extends BaseEntity {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted?: boolean;
  color?: string;
  folderId?: string | null;
  reminder?: string | null;
  lastExportedAt?: string;
  exportFormats?: string[];
  version: number;
  lastEditedBy?: string;
  type?: 'text' | 'video' | 'whiteboard';
  objectType?: NoteObjectType;
  attributes?: Record<string, any>;
  annotations?: NoteAnnotation[];
  metadata?: Record<string, any>;
  is_public?: boolean;
  share_token?: string;
  price?: number;
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
  type?: 'text' | 'video' | 'whiteboard';
  metadata?: Record<string, any>;
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
