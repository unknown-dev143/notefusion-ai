export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  folderId?: string;
  color?: string;
  lastEditedBy?: string;
  version?: number;
  type?: 'text' | 'video' | 'whiteboard';
  metadata?: Record<string, any>;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
  folderId?: string;
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: 'text' | 'video' | 'whiteboard';
  metadata?: Record<string, any>;
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  updatedAt?: string;
  lastEditedBy?: string;
  version?: number;
}

export interface NoteFilters {
  search?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  folderId?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Allow additional properties
}

export interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  filters: NoteFilters;
  setFilters: (filters: Partial<NoteFilters>) => void;
  resetFilters: () => void;
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<Note>;
  createNote: (noteData: CreateNoteDto) => Promise<Note>;
  updateNote: (id: string, updates: UpdateNoteDto) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<Note>;
  clearCurrentNote: () => void;
}
