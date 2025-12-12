import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Folder } from '../types/folder';
import { folderService } from '../services/folderService';
import { useAuth } from '../../../contexts/AuthContext';

interface UpdateFolderDto {
  name?: string;
}

interface FolderContextType {
  folders: Folder[];
  selectedFolderId: string | null;
  loading: boolean;
  error: Error | null;
  createFolder: (folder: { name: string; parentId: string | null }) => Promise<void>;
  updateFolder: (id: string, updates: UpdateFolderDto) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveFolder: (id: string, targetFolderId: string | null) => Promise<void>;
  selectFolder: (folderId: string | null) => void;
  refreshFolders: () => Promise<void>;
  getFolderPath: (folderId: string) => string[] | null;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadFolders = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      setError(null);
      const data = await folderService.getFolders(user.id);
      setFolders(data || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([]);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [user, selectedFolderId]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = async ({ name, parentId }: { name: string; parentId: string | null }): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await folderService.createFolder({
        name,
        parentId,
        userId: user.id
      });
      
      await loadFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const updateFolder = async (folderId: string, updates: { name?: string }): Promise<void> => {
    try {
      setError(null);
      await folderService.updateFolder(folderId, updates);
      await loadFolders();
    } catch (error) {
      console.error('Failed to update folder:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      setError(null);
      await folderService.deleteFolder(folderId);
      
      // If the deleted folder was selected, clear the selection
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      
      await loadFolders();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const moveFolder = async (folderId: string, targetFolderId: string | null): Promise<void> => {
    try {
      setError(null);
      // Prevent moving a folder into itself or its own subfolder
      if (targetFolderId) {
        const isDescendant = (folderId: string, targetId: string | null): boolean => {
          if (!targetId) return false;
          const folder = folderService.findFolderById(folders, targetId);
          if (!folder) return false;
          if (folder.id === folderId) return true;
          return isDescendant(folderId, folder.parentId);
        };

        if (isDescendant(folderId, targetFolderId)) {
          throw new Error('Cannot move a folder into its own subfolder');
        }
      }

      // Move the folder
      await folderService.moveFolder(folderId, { targetFolderId });
      await loadFolders();
    } catch (error) {
      console.error('Failed to move folder:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const selectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  const getFolderPath = (folderId: string): string[] | null => {
    return folderService.getFolderPath(folders, folderId);
  };
  return (
    <FolderContext.Provider
      value={{
        folders,
        selectedFolderId,
        loading,
        error,
        createFolder,
        updateFolder,
        deleteFolder,
        moveFolder,
        selectFolder,
        refreshFolders: loadFolders,
        getFolderPath,
      }}
    >
      {!loading ? children : <div>Loading folders...</div>}
    </FolderContext.Provider>
  );
};

export const useFolders = (): FolderContextType => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};
