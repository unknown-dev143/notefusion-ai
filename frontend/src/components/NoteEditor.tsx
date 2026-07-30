import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  LuSave, 
  LuPin, 
  LuPinOff, 
  LuBot, 
  LuFileText, 
  LuTag, 
  LuX, 
  LuLightbulb, 
  LuShare2 as LuShare, 
  LuUsers, 
  LuMail, 
  LuFileDown, 
  LuFile, 
  LuLoader as LuLoader2, 
  LuTrash2 as LuTrash, 
  LuChevronLeft 
} from 'react-icons/lu';
import { useForm, SubmitHandler } from "react-hook-form"

import { useNotes } from '../features/notes/context/NoteContext';
import AIToolbar from './ai/AIToolbar';
import AISuggestions from './ai/AISuggestions';
import ImportExportMenu from './ImportExportMenu';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';

type SharePermission = 'view' | 'edit';

interface NoteEditorProps {
  noteId?: string;
  onClose?: () => void;
}

interface NoteEditorState {
  title: string;
  content: string;
  tags: string[];
  newTag: string;
  isPinned: boolean;
  isNewNote: boolean;
  showAITools: boolean;
  showTemplateManager: boolean;
  showAISuggestions: boolean;
  isSharing: boolean;
  shareEmail: string;
  sharePermission: string;
  isLoading: boolean;
}

interface ShareFormData {
  email: string;
  permission: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onClose }) => {
  const [state, setState] = useState<NoteEditorState>({
    title: '',
    content: '',
    tags: [],
    newTag: '',
    isPinned: false,
    isNewNote: !noteId,
    showAITools: false,
    showTemplateManager: false,
    showAISuggestions: false,
    isSharing: false,
    shareEmail: '',
    sharePermission: 'view',
    isLoading: false,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShareFormData>();
  const { toast } = useToast();

  const { 
    getNote, 
    createNote, 
    updateNote, 
    deleteNote, 
    pinNote 
  } = useNotes();
  
  const toggleAITools = useCallback(() => {
    setState(prev => ({ ...prev, showAITools: !prev.showAITools }));
  }, []);

  const toggleAISuggestions = useCallback(() => {
    setState(prev => ({ ...prev, showAISuggestions: !prev.showAISuggestions }));
  }, []);

  const editorModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean'],
        ['code-block'],
        ['ai-tools']
      ],
      handlers: {
        'ai-tools': toggleAITools
      }
    },
  }), [toggleAITools]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const quill = document.querySelector('.ql-toolbar');
    if (!quill) return;
    
    if (quill.querySelector('.ql-ai-tools')) return;

    const aiButton = document.createElement('button');
    aiButton.className = 'ql-ai-tools';
    aiButton.innerHTML = '<span class="ql-ai-icon">AI</span>';
    aiButton.title = 'AI Tools';
    
    const handleClick = (e: Event) => {
      e.preventDefault();
      toggleAITools();
    };
    
    aiButton.addEventListener('click', handleClick);
    quill.appendChild(aiButton);
    
    return () => {
      aiButton.removeEventListener('click', handleClick);
      if (quill.contains(aiButton)) {
        quill.removeChild(aiButton);
      }
    };
  }, [toggleAITools]);

  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const note = await getNote(noteId);
        if (note) {
          setState(prev => ({
            ...prev,
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            isPinned: note.isPinned || false,
            isNewNote: false
          }));
        }
      }
    };
    
    loadNote();
  }, [noteId, getNote]);

  const handleContentChange = (value: string) => {
    setState(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleContentUpdate = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent
    }));
  }, []);

  const handleTogglePin = async () => {
    if (noteId) {
      await pinNote(noteId, !state.isPinned);
      setState(prev => ({ ...prev, isPinned: !prev.isPinned }));
    } else {
        setState(prev => ({ ...prev, isPinned: !prev.isPinned }));
    }
  };

  const handleAddTag = () => {
    if (!state.newTag.trim() || state.tags.includes(state.newTag.trim())) return;
    setState(prev => ({
      ...prev,
      tags: [...prev.tags, state.newTag.trim()],
      newTag: ''
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const onShareSubmit = async (data: ShareFormData) => {
    try {
      toast({ title: 'Sharing note...', description: `Sending invite to ${data.email}` });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: 'Note shared', 
        description: `Note shared with ${data.email} (${state.sharePermission} access)`
      });
      setState(prev => ({
        ...prev,
        shareEmail: '',
        isSharing: false
      }));
      reset();
    } catch (error) {
      console.error('Error sharing note:', error);
      toast({ title: 'Failed to share note', variant: 'destructive' });
    }
  };

  const exportAsPDF = () => {
    toast({ title: 'Exporting as PDF...' });
  };

  const exportAsMarkdown = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = state.content;
    let markdown = `# ${state.title}\n\n`;
    markdown += tempDiv.innerText;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTemplateManager = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTemplateManager: !prev.showTemplateManager
    }));
  }, []);

  const handleSave = async () => {
    try {
      if (!state.title.trim()) {
        toast({ title: 'Please enter a title', variant: 'destructive' });
        return;
      }

      const noteData = {
        title: state.title.trim(),
        content: state.content,
        tags: state.tags,
        isPinned: state.isPinned,
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      if (state.isNewNote) {
        await createNote({ ...noteData, isArchived: false, folderId: undefined });
        toast({ title: 'Note created successfully' });
      } else if (noteId) {
        await updateNote(noteId, noteData);
        toast({ title: 'Note updated successfully' });
      }

      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({ title: 'Failed to save note', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    
    try {
      await deleteNote(noteId);
      toast({ title: 'Note deleted successfully' });
      if (onClose) onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <Card className="flex-1 flex flex-col border-0 shadow-none rounded-none">
        <CardHeader className="border-b py-3">
            <div className="flex items-center gap-2">
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
                        <LuChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                <Input
                    placeholder="Note Title"
                    value={state.title}
                    onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                />
                
                <div className="flex items-center gap-1 ml-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleTogglePin}
                                >
                                    {state.isPinned ? <LuPin className="h-4 w-4 fill-foreground" /> : <LuPinOff className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{state.isPinned ? 'Unpin' : 'Pin'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={state.showAISuggestions ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={toggleAISuggestions}
                                >
                                    <LuLightbulb className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>AI Suggestions</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <LuShare className="h-4 w-4" /> Share
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isSharing: true }))}>
                                <LuMail className="mr-2 h-4 w-4" /> Share via Email
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <LuUsers className="mr-2 h-4 w-4" /> Invite Collaborators
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={exportAsPDF}>
                                <LuFileDown className="mr-2 h-4 w-4" /> Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportAsMarkdown}>
                                <LuFileText className="mr-2 h-4 w-4" /> Export as Markdown
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        loading={state.isLoading}
                        className="gap-2"
                    >
                        {state.isLoading ? <LuLoader2 className="h-4 w-4 animate-spin" /> : <LuSave className="h-4 w-4" />}
                        Save
                    </Button>

                    {!state.isNewNote && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDelete}
                            disabled={state.isLoading}
                        >
                            <LuTrash className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b flex flex-wrap gap-2 items-center bg-muted/20">
                {state.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive focus:outline-none">
                            <LuX className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <div className="flex items-center gap-2">
                    <LuTag className="h-4 w-4 text-muted-foreground" />
                    <Input
                        className="h-7 w-32 border-none shadow-none focus-visible:ring-0 bg-transparent"
                        placeholder="Add tag..."
                        value={state.newTag}
                        onChange={(e) => setState(prev => ({ ...prev, newTag: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        onBlur={handleAddTag}
                    />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                 <div className="flex-1 flex flex-col relative overflow-hidden">
                     <div className="p-2 border-b flex gap-1 flex-wrap bg-background z-10">
                        <TooltipProvider>
                            <Tooltip>
                             <TooltipTrigger asChild>
                                 <Button variant="ghost" size="sm" onClick={handleSave} disabled={!state.title.trim()}>
                                     <LuSave className="h-4 w-4" />
                                 </Button>
                             </TooltipTrigger>
                             <TooltipContent>Save</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                         <TooltipProvider>
                             <Tooltip>
                                 <TooltipTrigger asChild>
                                     <Button 
                                         variant={state.showAITools ? 'secondary' : 'ghost'} 
                                         size="sm" 
                                         onClick={toggleAITools}
                                     >
                                         <LuBot className="h-4 w-4" />
                                     </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>AI Tools</TooltipContent>
                             </Tooltip>
                         </TooltipProvider>
                         
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="sm" onClick={toggleTemplateManager}>
                                         <LuFile className="h-4 w-4" />
                                     </Button>
                                </TooltipTrigger>
                                <TooltipContent>Templates</TooltipContent>
                            </Tooltip>
                         </TooltipProvider>

                         <Separator orientation="vertical" className="h-6" />

                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="sm" onClick={handleTogglePin}>
                                         {state.isPinned ? <LuPin className="h-4 w-4" /> : <LuPinOff className="h-4 w-4" />}
                                     </Button>
                                </TooltipTrigger>
                                <TooltipContent>{state.isPinned ? 'Unpin' : 'Pin to top'}</TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                     </div>

                    <div className="flex-1 overflow-auto relative p-4">
                         {state.showAITools && (
                            <div className="mb-4 p-4 border rounded-md bg-muted/30">
                              <AIToolbar 
                                noteId={noteId || 'new'}
                                content={state.content}
                                onContentUpdate={handleContentUpdate}
                                onSaveTemplate={() => toggleTemplateManager()}
                              />
                            </div>
                          )}
                          <ReactQuill
                            theme="snow"
                            value={state.content}
                            onChange={handleContentChange}
                            modules={editorModules}
                            placeholder="Start writing your note here..."
                            className="h-[calc(100%-2rem)]"
                          />
                          <div className="mt-4">
                              <AISuggestions
                                noteId={noteId || 'new'}
                                content={state.content}
                                onApplySuggestion={handleContentUpdate}
                              />
                          </div>
                    </div>
                 </div>
            </div>
        </CardContent>
      </Card>

      <Dialog open={state.isSharing} onOpenChange={(open) => setState(prev => ({ ...prev, isSharing: open }))}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Share Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onShareSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input 
                        id="email" 
                        placeholder="Enter email address" 
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })} 
                    />
                    {errors.email && <span className="text-destructive text-sm">Please enter a valid email</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="permission">Permission</Label>
                    <select
                        id="permission"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={state.sharePermission}
                        onChange={(e) => setState(prev => ({ ...prev, sharePermission: e.target.value }))}
                    >
                        <option value="view">Can View</option>
                        <option value="edit">Can Edit</option>
                    </select>
                </div>
                <DialogFooter>
                    <Button type="submit">Share</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteEditor;
