import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Types
export interface Note {
  id?: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

// Collection references
const notesCollection = collection(db, 'notes');

// Note Operations
export const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newNote = {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPinned: false,
      isArchived: false,
    };
    
    const docRef = await addDoc(notesCollection, newNote);
    return { id: docRef.id, ...newNote };
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const getNote = async (noteId: string): Promise<Note | null> => {
  try {
    const docRef = doc(db, 'notes', noteId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Note;
    }
    return null;
  } catch (error) {
    console.error('Error getting note:', error);
    throw error;
  }
};

export const getUserNotes = async (userId: string): Promise<Note[]> => {
  try {
    const q = query(
      notesCollection,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Note));
  } catch (error) {
    console.error('Error getting user notes:', error);
    throw error;
  }
};

export const updateNote = async (noteId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const searchNotes = async (userId: string, searchTerm: string): Promise<Note[]> => {
  try {
    // This is a simple search - for production, consider using a full-text search solution
    const q = query(
      notesCollection,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note))
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
};

// Batch operations
export const batchUpdateNotes = async (updates: Array<{id: string, updates: Partial<Note>}>) => {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, updates }) => {
    const noteRef = doc(db, 'notes', id);
    batch.update(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  });
  
  try {
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating notes:', error);
    throw error;
  }
};
