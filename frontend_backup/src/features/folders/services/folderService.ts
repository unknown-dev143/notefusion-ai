import { api } from '../../../lib/api';
import { Folder, CreateFolderDto, UpdateFolderDto, MoveFolderDto } from '../types/folder';

class FolderService {
  private static instance: FolderService;

  private constructor() {}

  public static getInstance(): FolderService {
    if (!FolderService.instance) {
      FolderService.instance = new FolderService();
    }
    return FolderService.instance;
  }

  // Get all folders for the current user
  public async getFolders(userId: string): Promise<Folder[]> {
    try {
      const response = await api.get<Folder[]>('/folders', {
        params: { userId }
      });
      return this.buildFolderTree(response.data || []);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      throw error;
    }
  }

  // Get a single folder by ID
  public async getFolder(id: string): Promise<Folder> {
    try {
      const response = await api.get<Folder>(`/folders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch folder:', error);
      throw error;
    }
  }

  // Create a new folder
  public async createFolder(folderData: CreateFolderDto): Promise<Folder> {
    try {
      const response = await api.post<Folder>('/folders', folderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  // Update a folder
  public async updateFolder(folderId: string, updates: UpdateFolderDto): Promise<Folder> {
    try {
      const response = await api.patch<Folder>(`/folders/${folderId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  }

  // Delete a folder
  public async deleteFolder(folderId: string): Promise<void> {
    try {
      await api.delete(`/folders/${folderId}`);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  // Move a folder to a new parent
  public async moveFolder(folderId: string, moveData: MoveFolderDto): Promise<Folder> {
    try {
      const response = await api.patch<Folder>(`/folders/${folderId}/move`, moveData);
      return response.data;
    } catch (error) {
      console.error('Failed to move folder:', error);
      throw error;
    }
  }

  // Build a tree structure from a flat list of folders
  private buildFolderTree(folders: Folder[], parentId: string | null = null): Folder[] {
    const children = folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        subfolders: this.buildFolderTree(folders, folder.id)
      }));

    return children;
  }

  // Flatten a folder tree to a list
  public flattenFolderTree(folders: Folder[]): Folder[] {
    let result: Folder[] = [];
    
    for (const folder of folders) {
      result.push(folder);
      if (folder.subfolders?.length) {
        result = [...result, ...this.flattenFolderTree(folder.subfolders)];
      }
    }
    
    return result;
  }

  // Find a folder by ID in a tree
  public findFolderById(folders: Folder[] = [], id: string): Folder | null {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.subfolders?.length) {
        const found = this.findFolderById(folder.subfolders, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Get the path to a folder
  public getFolderPath(folders: Folder[], folderId: string, path: string[] = []): string[] | null {
    for (const folder of folders) {
      if (folder.id === folderId) return [...path, folder.name];
      if (folder.subfolders?.length) {
        const foundPath = this.getFolderPath(folder.subfolders, folderId, [...path, folder.name]);
        if (foundPath) return foundPath;
      }
    }
    return null;
  }
}

export const folderService = FolderService.getInstance();
