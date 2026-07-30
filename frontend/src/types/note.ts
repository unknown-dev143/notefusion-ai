export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId?: string | null;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastEditedBy?: string;
  version?: number;
  metadata?: Record<string, any>;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  folderId?: string | null;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  folderId?: string | null;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  lastEditedBy?: string;
  version?: number;
}
export interface AICategory {
  id: string;
  name: string;
  confidence: number;
}

export interface AITag {
  id: string;
  name: string;
}

export interface AISummary {
  keyPoints: string[];
  actionItems?: string[];
}
