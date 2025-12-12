import { BaseEntity } from '../../types/common';

// Define a minimal Note interface to avoid circular dependencies
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder extends BaseEntity {
  name: string;
  parentId: string | null;
  notes: Note[];
  subfolders: Folder[];
  isExpanded?: boolean;
  path?: string[];
}

export interface CreateFolderDto {
  name: string;
  parentId: string | null;
  userId: string;
}

export interface UpdateFolderDto {
  name?: string;
  parentId?: string | null;
  isExpanded?: boolean;
}

export interface MoveFolderDto {
  targetFolderId: string | null;
}
