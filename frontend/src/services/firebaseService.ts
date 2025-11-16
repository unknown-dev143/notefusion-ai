import { ref, set, onValue, push, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { realtimeDb, storage } from '../config/firebase';

// Whiteboard service
export const whiteboardService = {
  // Save whiteboard data
  async saveWhiteboard(whiteboardId: string, data: any) {
    const whiteboardRef = ref(realtimeDb, `whiteboards/${whiteboardId}`);
    await set(whiteboardRef, {
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
      version: Date.now()
    });
  },

  // Load whiteboard data
  async loadWhiteboard(whiteboardId: string, callback: (data: any) => void) {
    const whiteboardRef = ref(realtimeDb, `whiteboards/${whiteboardId}`);
    onValue(whiteboardRef, (snapshot) => {
      const value = snapshot.val();
      if (value && value.data) {
        callback(JSON.parse(value.data));
      }
    });
  },

  // Real-time collaboration
  subscribeToWhiteboard(whiteboardId: string, callback: (data: any) => void) {
    const whiteboardRef = ref(realtimeDb, `whiteboards/${whiteboardId}`);
    return onValue(whiteboardRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        callback(value);
      }
    });
  },

  // Upload image to storage
  async uploadImage(file: File, path: string): Promise<string> {
    const imageRef = storageRef(storage, path);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  },

  // List all whiteboards
  async listWhiteboards(userId: string): Promise<any[]> {
    const whiteboardsRef = ref(realtimeDb, `users/${userId}/whiteboards`);
    return new Promise((resolve) => {
      onValue(whiteboardsRef, (snapshot) => {
        const value = snapshot.val();
        resolve(value ? Object.values(value) : []);
      });
    });
  }
};

// Notes service
export const notesService = {
  async saveNote(noteId: string, data: any) {
    const noteRef = ref(realtimeDb, `notes/${noteId}`);
    await set(noteRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  async loadNote(noteId: string, callback: (data: any) => void) {
    const noteRef = ref(realtimeDb, `notes/${noteId}`);
    onValue(noteRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        callback(value);
      }
    });
  }
};

// Storage service
export const storageService = {
  async uploadFile(file: File, path: string): Promise<string> {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  },

  async deleteFile(path: string) {
    const fileRef = storageRef(storage, path);
    await deleteObject(fileRef);
  },

  async listFiles(folder: string): Promise<string[]> {
    const folderRef = storageRef(storage, folder);
    const result = await listAll(folderRef);
    return result.items.map(item => item.fullPath);
  }
};

