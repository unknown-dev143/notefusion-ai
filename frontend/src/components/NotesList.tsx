import React, { useState, useEffect } from 'react';
import { 
  LuSearch, 
  LuPlus, 
  LuFolder, 
  LuStar, 
  LuEllipsisVertical as LuMoreVertical, 
  LuTrash2 as LuTrash, 
  LuPencil as LuEdit 
} from 'react-icons/lu';
import { useNotes } from '../features/notes/context/NoteContext';
import NoteEditor from './NoteEditor';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import { useToast } from '../components/ui/use-toast';
import { cn } from '../lib/utils';

const NotesList: React.FC = () => {
  const { 
    notes, 
    loading, 
    searchNotes, 
    deleteNote, 
    updateNote,
    createNote,
    currentNote
  } = useNotes();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Filter notes based on search query and folder
  useEffect(() => {
    if (searchQuery) {
      searchNotes(searchQuery).then(results => {
        setFilteredResults(results);
      });
    } else {
      setFilteredResults(notes);
    }
  }, [searchQuery, notes, searchNotes]);

  const setFilteredResults = (results: any[]) => {
    if (selectedFolder === 'all') {
      setFilteredNotes(results);
    } else if (selectedFolder === 'pinned') {
      setFilteredNotes(results.filter(note => note.isPinned));
    } else {
      setFilteredNotes(results.filter(note => note.folderId === selectedFolder));
    }
  };

  // Get unique folders from notes
  const uniqueFolders = notes
    .filter(note => note.folderId)
    .reduce((acc, note) => {
      if (!acc.find(f => f.id === note.folderId)) {
        acc.push({
          id: note.folderId!,
          name: note.folderId!.split('/').pop() || 'Uncategorized'
        });
      }
      return acc;
    }, [] as { id: string; name: string }[]);

  const folders = [
    { id: 'all', name: 'All Notes' },
    { id: 'pinned', name: 'Pinned' },
    ...uniqueFolders
  ];

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreatingNew(true);
  };

  const handleDeleteNote = async (e: React.SyntheticEvent, noteId: string) => {
    e.stopPropagation();
    try {
      await deleteNote(noteId);
      if (selectedNote === noteId) {
        setSelectedNote(null);
      }
      toast({ title: 'Note deleted', variant: 'default' });
    } catch (error) {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  };

  const handleTogglePin = async (e: React.SyntheticEvent, noteId: string, isPinned: boolean) => {
    e.stopPropagation();
    try {
      await updateNote(noteId, { isPinned: !isPinned });
      toast({ title: isPinned ? 'Note unpinned' : 'Note pinned' });
    } catch (error) {
      toast({ title: 'Failed to update note', variant: 'destructive' });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-[300px] border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4 tracking-tight">Notes</h2>
          <Button 
            className="w-full mb-4" 
            onClick={handleCreateNew}
          >
            <LuPlus className="mr-2 h-4 w-4" /> New Note
          </Button>
          
          <div className="relative mb-4">
            <LuSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {folders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "flex items-center px-4 py-2 cursor-pointer rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    selectedFolder === folder.id ? "bg-accent text-accent-foreground" : "transparent"
                  )}
                >
                  <LuFolder className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  {folder.id !== 'all' && folder.id !== 'pinned' && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {notes.filter(n => n.folderId === folder.id).length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-4">
               {/* Skeleton for loading */}
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex flex-col space-y-2">
                   <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-3 w-full" />
                   <Skeleton className="h-3 w-1/2" />
                 </div>
               ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <span className="text-muted-foreground mb-4">No notes found</span>
               {searchQuery && (
                  <Button variant="link" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
               )}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredNotes.map((note: any) => {
                   const isSelected = selectedNote === note.id || currentNote?.id === note.id;
                   const isPinned = note.isPinned;

                   return (
                     <div
                        key={note.id}
                        onClick={() => handleNoteClick(note.id)}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-accent/50 transition-colors group relative",
                          isSelected && "bg-accent"
                        )}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-semibold text-sm truncate flex-1 pr-2">
                             {note.title || 'Untitled Note'}
                           </h4>
                           <div className="flex items-center space-x-1">
                             {isPinned && <LuStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <LuMoreVertical className="h-4 w-4" />
                                   </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={(e) => handleTogglePin(e, note.id, isPinned)}>
                                      <LuStar className="mr-2 h-4 w-4" /> {isPinned ? 'Unpin' : 'Pin'}
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleNoteClick(note.id); }}>
                                     <LuEdit className="mr-2 h-4 w-4" /> Edit
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem onClick={(e) => handleDeleteNote(e, note.id)} className="text-destructive focus:text-destructive">
                                      <LuTrash className="mr-2 h-4 w-4" /> Delete
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                           </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                           {note.content?.replace(/<[^>]*>?/gm, '').substring(0, 150)}
                        </p>
                        <div className="flex justify-between items-center">
                           <div className="flex gap-1 flex-wrap">
                             {note.tags?.slice(0, 2).map((tag: string) => (
                               <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                 {tag}
                               </Badge>
                             ))}
                             {note.tags?.length > 2 && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">+{note.tags.length - 2}</Badge>}
                           </div>
                           <span className="text-[10px] text-muted-foreground">
                             {new Date(note.updatedAt).toLocaleDateString()}
                           </span>
                        </div>
                     </div>
                   );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      
      {/* Note Editor Area */}
      <div className="flex-1 flex flex-col bg-background">
        {isCreatingNew ? (
          <NoteEditor onClose={() => setIsCreatingNew(false)} />
        ) : selectedNote || currentNote ? (
          <NoteEditor noteId={selectedNote || currentNote?.id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">No Note Selected</h2>
            <p className="mb-6">Select a note from the list or create a new one</p>
            <Button onClick={handleCreateNew}>
              <LuPlus className="mr-2 h-4 w-4" /> New Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesList;
