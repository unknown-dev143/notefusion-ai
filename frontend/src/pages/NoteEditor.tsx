import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Maximize, 
  Minimize, 
  Clock, 
  Sparkles, 
  Brain, 
  Wand2, 
  CheckCircle2, 
  Presentation,
  Shield,
  Zap,
  Activity,
  Layers,
  Search,
  ChevronRight,
  Monitor,
  Command,
  MessageSquare,
  Link,
  User,
  Projector,
  Calendar,
  FileText,
  Target,
  Plus,
  Trash2 as TrashIcon,
  Tag,
  BookOpen,
  FolderOpen,
  Share2,
  Copy
} from 'lucide-react';
import AssetGallery from '../components/AssetGallery';
import { NoteObjectType, NoteAnnotation } from '../features/notes/types/note';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNotes } from '../features/notes/context/NoteContext';
import { useProgression } from '../contexts/ProgressionContext';
import RichTextEditor from '../components/RichTextEditor';
import AIService from '../features/ai/services/AIService';

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, getNote, createNote, updateNote } = useNotes();
  const { addXP } = useProgression();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isZenMode, setIsZenMode] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [showAssetGallery, setShowAssetGallery] = useState(false);
  const [lastSaved, setLastSaved] = useState('Just now');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [objectType, setObjectType] = useState<NoteObjectType>('Generic');
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [annotations, setAnnotations] = useState<NoteAnnotation[]>([]);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [price, setPrice] = useState(0);

  // Fetch note — only re-run when the id changes, NOT on every notes array update
  useEffect(() => {
    if (id && id !== 'new') {
       loadNote(id);
       fetchBacklinks(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Debounced Auto-save hook
  useEffect(() => {
    if (id === 'new' || !id || loading) return;

    const delayDebounce = setTimeout(() => {
      if (title.trim()) {
        updateNote(id, { 
          title, 
          content,
          objectType,
          attributes,
          annotations,
          is_public: isPublic,
          price: price
        } as any)
        .then(() => {
          setLastSaved(new Date().toLocaleTimeString());
        })
        .catch(() => {
          // Silent catch for auto-save network drops
        });
      }
    }, 3000);

    return () => clearTimeout(delayDebounce);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, objectType, attributes, annotations, isPublic, price]);



  const fetchBacklinks = (noteId: string) => {
    const linked = notes.filter(n => n.id !== noteId && n.content.includes(noteId));
    setBacklinks(linked);
  };

  const loadNote = async (noteId: string) => {
      setLoading(true);
      const note = await getNote(noteId);
      if (note) {
          setTitle(note.title);
          setContent(note.content);
          setObjectType(note.objectType || 'Generic');
          setAttributes(note.attributes || {});
          setAnnotations(note.annotations || []);
          setIsPublic(note.is_public || false);
          setShareToken(note.share_token || '');
          setPrice(note.price || 0);
          setLastSaved(new Date(note.updatedAt).toLocaleTimeString());
          updateWordCount(note.content);
      }
      setLoading(false);
  };

  const handleSuggestBridges = async () => {
    toast.success('Analyzing cross-disciplinary bridges...');
    const bridgeResults = await AIService.suggestKnowledgeBridges({ id, content }, notes);
    if (bridgeResults.length > 0) {
       toast.success(`Found connections to: ${bridgeResults.map(b => b.note.title).join(', ')}`, { duration: 5000 });
    } else {
       toast.error('No strong bridges found in local archive.');
    }
  };

  const addAnnotation = () => {
     if (!selectedText) return;
     const newAnnotation: NoteAnnotation = {
        id: Math.random().toString(36).substr(2, 9),
        authorId: 'user-1',
        authorName: 'Scholar',
        content: selectedText,
        createdAt: new Date().toISOString(),
        blockId: `block-${Math.random().toString(36).substr(2, 5)}`
     };
     setAnnotations([newAnnotation, ...annotations]);
     toast.success('Thought Captured & Linked');
     setSelectedText('');
  };

  const handleTextSelection = () => {
     const selection = window.getSelection();
     const text = selection?.toString().trim();
     if (text) {
        setSelectedText(text);
     } else {
        setSelectedText('');
     }
  };

  const updateWordCount = (text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const calculateDensity = () => {
    if (!content || wordCount === 0) return 0;
    // Heuristic: Density = (Semantic Markers / Words) * 100
    const bullets = (content.match(/^[*-]\s/gm) || []).length;
    const items = (content.match(/<li>|<\s*li\s*>/g) || []).length;
    const bolds = (content.match(/<strong\s*>/g) || []).length;
    const headers = (content.match(/<h[1-6]\s*>/g) || []).length;
    
    const semanticMarkers = bullets + items + bolds + headers;
    const density = Math.min(100, Math.round((semanticMarkers / (wordCount / 50)) * 10));
    return density || 15; // Baseline density
  };

  const handleSave = async () => {
    try {
        if (!title.trim()) {
            toast.error('Neural uplink requires a Title');
            return;
        }

        if (id === 'new') {
            const newNote = await createNote({
                title,
                content,
                tags: [] as string[],
                color: 'bg-white',
                isPinned: false,
                isArchived: false,
                objectType,
                attributes,
                annotations,
                is_public: isPublic,
                price: price
            } as any);
            toast.success('Node Synchronized');
            addXP(100);
            navigate(`/notes/${newNote.id}`, { replace: true });
        } else if (id) {
            await updateNote(id, { 
                title, 
                content,
                objectType,
                attributes,
                annotations,
                is_public: isPublic,
                price: price
            } as any);
            setLastSaved('Just now');
            toast.success('Archive Updated');
            addXP(50);
        }
    } catch (err) {
        toast.error('Uplink failed');
    }
  };

  const handleSynthesize = async () => {
    if (!content) return toast.error('Empty archive detected');
    toast.success('Cognitive Synthesis Initiated...');
    const summary = await AIService.summarizeNote(content);
    const glossary = await AIService.generateGlossary(content);
    
    // Create a synthesis report
    const glossaryText = Object.entries(glossary)
       .map(([term, def]) => `**${term}**: ${def}`)
       .join('\n');
       
    const finalContent = `${content}\n\n--- AI Synthesis Report ---\n\n### Executive Summary\n${summary}\n\n### Neural Glossary\n${glossaryText}`;
    setContent(finalContent);
    toast.success('Thought Hierarchy Synthesized');
  };

  const handleMapConnections = async () => {
     toast.success('Mapping Neural Nodes...');
     navigate('/graph');
  };

  const handleGenerateFlashcards = async () => {
     if (!content) return toast.error('No data for learning');
     toast.success('Generating Active Learning Nodes...');
     const flashcards = await AIService.generateFlashcards(content);
     // Simulate showing or navigation to spaced repetition
     toast.success(`Generated ${flashcards.length} flashcards for review.`);
     navigate('/spaced-repetition');
  };

  const embedAsset = (asset: any) => {
    const embed = asset.type === 'image'
      ? `\n![${asset.name}](${asset.url})\n`
      : `\n[📎 ${asset.name}](${asset.url})\n`;
    setContent(prev => prev + embed);
    setShowAssetGallery(false);
    toast.success(`${asset.name} embedded into note`);
  };

  return (
    <div className={`transition-all duration-700 bg-slate-950 min-h-screen flex text-slate-100 ${isZenMode ? 'fixed inset-0 z-[200] overflow-auto' : 'animate-slide-up'}`}>
      
      {/* Neural AI Sidebar */}
      {!isZenMode && (
         <div className={`w-96 border-r border-white/5 bg-slate-900 flex flex-col transition-all duration-500 relative overflow-hidden ${showAISidebar ? 'translate-x-0' : '-translate-x-full absolute z-[-1]'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="p-10 border-b border-white/5 relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Brain size={24}/>
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white tracking-tighter italic">AI Architect</h3>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Protocol Active</p>
                     </div>
                  </div>
                  <Zap size={18} className="text-blue-400 animate-pulse" />
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Synthesize', icon: <Sparkles size={16}/>, color: 'text-blue-400', bg: 'bg-blue-600/10', action: handleSynthesize },
                    { label: 'Study Cards', icon: <BookOpen size={16}/>, color: 'text-amber-400', bg: 'bg-amber-600/10', action: handleGenerateFlashcards },
                    { label: 'Map Connections', icon: <Layers size={16}/>, color: 'text-purple-400', bg: 'bg-purple-600/10', action: handleMapConnections },
                    { label: 'Suggest Bridges', icon: <Link size={16}/>, color: 'text-emerald-400', bg: 'bg-emerald-600/10', action: handleSuggestBridges },
                    { label: 'Convert to Slides', icon: <Presentation size={16}/>, color: 'text-rose-400', bg: 'bg-rose-600/10', path: '/slide-maker' },
                  ].map(tool => (
                    <button 
                      key={tool.label} 
                      onClick={() => tool.path ? navigate(tool.path) : (tool.action ? tool.action() : toast.success(`Initiating ${tool.label}...`))}
                      className="w-full p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 hover:bg-white/10 transition-all"
                    >
                       <div className="flex items-center gap-4">
                          <span className={`${tool.bg} ${tool.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>{tool.icon}</span>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{tool.label}</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
               </div>

               {/* Object DNA Configurator */}
               <div className="mt-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <Target size={14} /> Object DNA
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {(['Generic', 'Meeting', 'Person', 'Project', 'Concept', 'Task'] as NoteObjectType[]).map(type => (
                        <button
                           key={type}
                           onClick={() => setObjectType(type)}
                           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${objectType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        >
                           {type}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="p-10 flex-1 overflow-auto relative z-10">
               <AnimatePresence>
                  {selectedText && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 p-2 rounded-2xl shadow-2xl flex items-center gap-2"
                     >
                        <span className="text-[10px] font-black text-blue-400 px-3 border-r border-white/10 uppercase tracking-widest">Selected Context</span>
                        <button 
                           onClick={addAnnotation}
                           className="flex items-center gap-2 px-4 py-2 hover:bg-blue-600/20 rounded-xl transition-colors text-[10px] font-black text-white uppercase"
                        >
                           <MessageSquare size={14} className="text-blue-400"/> Annotate
                        </button>
                        <button 
                           onClick={() => {
                              navigate(`/advanced-search?q=${selectedText}`);
                              setSelectedText('');
                           }}
                           className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-600/20 rounded-xl transition-colors text-[10px] font-black text-white uppercase"
                        >
                           <Brain size={14} className="text-emerald-400"/> Research
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
               
               <div className="max-w-4xl mx-auto">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                       <Monitor size={14} /> Neural Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-white/5 border border-white/5 rounded-3xl">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Density %</p>
                          <p className="text-2xl font-black text-white italic lining-nums">{calculateDensity()}%</p>
                       </div>
                       <div className={`p-5 bg-white/5 border border-white/5 rounded-3xl ${wordCount > 500 ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Type Hash</p>
                          <p className="text-2xl font-black text-white italic lining-nums">#{objectType.substring(0, 3)}</p>
                       </div>
                    </div>
                  </div>

                  {/* Neural Attributes (Supertags) */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                       <Tag size={14} /> Neural Attributes
                    </h4>
                    <div className="space-y-3">
                       {objectType === 'Project' && (
                          <>
                             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <label className="text-[8px] font-black text-slate-500 uppercase mb-2 block">Priority Protocol</label>
                                <select 
                                   value={attributes.priority || 'Medium'} 
                                   onChange={(e) => setAttributes({...attributes, priority: e.target.value})}
                                   className="w-full bg-transparent text-xs font-bold text-white outline-none"
                                >
                                   <option className="bg-slate-900" value="Critical">Critical</option>
                                   <option className="bg-slate-900" value="High">High</option>
                                   <option className="bg-slate-900" value="Medium">Medium</option>
                                   <option className="bg-slate-900" value="Low">Low</option>
                                </select>
                             </div>
                             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <label className="text-[8px] font-black text-slate-500 uppercase mb-2 block">Deadline Target</label>
                                <input 
                                   type="date" 
                                   value={attributes.deadline || ''} 
                                   onChange={(e) => setAttributes({...attributes, deadline: e.target.value})}
                                   className="w-full bg-transparent text-xs font-bold text-white outline-none"
                                />
                             </div>
                          </>
                       )}
                       {objectType === 'Person' && (
                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                             <label className="text-[8px] font-black text-slate-500 uppercase mb-2 block">Primary Uplink (Email)</label>
                             <input 
                                type="email" 
                                value={attributes.email || ''} 
                                onChange={(e) => setAttributes({...attributes, email: e.target.value})}
                                placeholder="neural@link.io"
                                className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-slate-700"
                             />
                          </div>
                       )}
                       {objectType === 'Generic' && (
                          <p className="text-[10px] text-slate-600 italic">No specialized attributes for Generic objects.</p>
                       )}
                    </div>
                  </div>

                  {/* Collaborative Annotations */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                       <span className="flex items-center gap-2"><MessageSquare size={14} /> Annotations</span>
                       <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full text-[8px]">{annotations.length}</span>
                    </h4>
                    <div className="space-y-4">
                       {annotations.map(ann => (
                          <div key={ann.id} className="p-4 bg-white/5 border-l-2 border-blue-500 rounded-r-2xl">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[8px] font-black text-blue-400 uppercase">{ann.authorName}</span>
                                <span className="text-[8px] text-slate-600">{new Date(ann.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-[10px] text-slate-300 leading-relaxed">{ann.content}</p>
                          </div>
                       ))}
                       {annotations.length === 0 && (
                          <div className="p-10 border-2 border-dashed border-white/5 rounded-[40px] text-center">
                             <MessageSquare size={24} className="mx-auto text-slate-700 mb-4 opacity-20" />
                             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No active discussion</p>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Bi-directional Backlinks */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                       <span className="flex items-center gap-2"><Link size={14} /> Backlinks</span>
                       <span className="bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full text-[8px]">{backlinks.length}</span>
                    </h4>
                    <div className="space-y-3">
                       {backlinks.map(link => (
                          <button 
                            key={link.id}
                            onClick={() => navigate(`/notes/${link.id}`)}
                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-left group hover:border-emerald-500/30 hover:bg-white/10 transition-all"
                          >
                             <p className="text-[10px] font-black text-slate-300 uppercase truncate group-hover:text-emerald-400 transition-colors">{link.title}</p>
                             <p className="text-[8px] text-slate-600 mt-1 line-clamp-1">{link.content.replace(/[#*]/g, '').substring(0, 50)}...</p>
                          </button>
                       ))}
                       {backlinks.length === 0 && (
                         <p className="text-[10px] text-slate-600 italic">No incoming neural links detected.</p>
                       )}
                    </div>
                  </div>

                  {/* Share & Monetize */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                       <span className="flex items-center gap-2"><Share2 size={14} /> Neural Broadcast</span>
                       <span className={`px-2 py-0.5 rounded-full text-[8px] ${isPublic ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                         {isPublic ? 'PUBLIC' : 'PRIVATE'}
                       </span>
                    </h4>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">Public Access</span>
                          <button 
                            onClick={() => setIsPublic(!isPublic)}
                            className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-blue-600' : 'bg-slate-800'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'right-1' : 'left-1'}`} />
                          </button>
                       </div>

                       {isPublic && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="space-y-3 overflow-hidden"
                         >
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                               <label className="text-[8px] font-black text-slate-500 uppercase mb-2 block">Token Price (0 = Free)</label>
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="number" 
                                    value={price}
                                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                    className="flex-1 bg-transparent text-xs font-bold text-white outline-none"
                                  />
                                  <span className="text-[10px] text-blue-400 font-black">TOKENS</span>
                               </div>
                            </div>
                            
                            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                               <label className="text-[8px] font-black text-blue-400 uppercase mb-2 block">Share Link</label>
                               <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    readOnly
                                    value={shareToken ? `${window.location.origin}/shared/${shareToken}` : 'Save to generate link'}
                                    className="flex-1 bg-transparent text-[9px] font-bold text-white outline-none truncate"
                                  />
                                  <button 
                                    onClick={() => {
                                      if (shareToken) {
                                        navigator.clipboard.writeText(`${window.location.origin}/shared/${shareToken}`);
                                        toast.success('Link Copied');
                                      }
                                    }}
                                    className="p-1 hover:text-white text-blue-400 transition-colors"
                                  >
                                     <Copy size={12} />
                                  </button>
                               </div>
                            </div>
                         </motion.div>
                       )}
                    </div>
                  </div>

                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[40px] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                     <MessageSquare size={32} className="text-white/40 mb-6" />
                     <h5 className="text-xl font-black text-white mb-2 leading-none">Synergy Note</h5>
                     <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-6 opacity-80">
                        This archive is linked with your <strong>Neuroscience Cluster V2</strong>.
                     </p>
                     <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                        View Map →
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Main Core Editor Stage */}
      <div className={`flex-1 flex flex-col relative bg-slate-950 overflow-hidden ${isZenMode ? 'w-full' : ''}`}>
        
        {/* Superior HUD */}
        <div className="sticky top-0 bg-slate-900/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-10 py-6 z-[100] transition-all">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/notes')}
              className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="h-8 w-px bg-white/5"></div>
            <button 
               onClick={() => setShowAISidebar(!showAISidebar)}
               className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${showAISidebar ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
               <Brain size={20} />
            </button>
            <div className="h-8 w-px bg-white/5"></div>
            <div className="flex items-center gap-3">
               <Activity size={16} className="text-blue-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{lastSaved}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowAssetGallery(!showAssetGallery)}
               className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showAssetGallery ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
             >
               <FolderOpen size={15}/> Assets
             </button>
             <button 
               onClick={() => setIsZenMode(!isZenMode)}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isZenMode ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
             >
               <Monitor size={16}/> {isZenMode ? 'Exit Focus' : 'Focus Mode'}
             </button>
              <button 
                onClick={async () => {
                   await handleSave();
                   navigate('/version-history');
                }}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5`}
              >
                <Clock size={16}/> Snapshot
              </button>
             <button 
               onClick={handleSave}
               className="px-10 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-white/5"
             >
               <Save size={16} className="inline mr-2" /> Sync Archive
             </button>
          </div>
        </div>

        {/* Global Floating Action Bar (Mocked) */}
        {!isZenMode && (
          <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl px-8 py-4 rounded-[32px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100]">
             <div className="flex items-center gap-6">
                <button className="p-3 text-slate-400 hover:text-white transition-all group relative">
                   <Command size={20} />
                   <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Commands</span>
                </button>
                <div className="h-6 w-px bg-white/5"></div>
                <button className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-all font-black text-[10px] uppercase tracking-widest">
                   <Sparkles size={18} /> Ask Architect
                </button>
                <div className="h-6 w-px bg-white/5"></div>
                <div className="flex gap-2">
                   {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all" />)}
                </div>
             </div>
          </div>
        )}

        {loading ? (
            <div className="flex justify-center items-center flex-1">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
        /* Experimental Editor Area */
        <div className={`flex-1 overflow-auto bg-slate-950 transition-all duration-700 ${isZenMode ? 'max-w-4xl mx-auto py-48' : 'max-w-5xl mx-auto py-24 px-16'}`} onMouseUp={handleTextSelection}>
          <div className="mb-20">
            <input 
              type="text"
              placeholder="Protocol Title..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); updateWordCount(content); }}
              className="w-full text-7xl font-black text-white placeholder:text-white/5 outline-none bg-transparent mb-6 leading-tight tracking-tighter italic"
            />
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
                  <Activity size={12} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Synergy Protocol V4.2</span>
               </div>
               <div className="flex items-center gap-3">
                  <Search size={14} className="text-slate-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata Indexed</span>
               </div>
            </div>
          </div>

          <div className="prose prose-invert prose-2xl max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:text-slate-400 prose-p:leading-relaxed selection:bg-blue-600 selection:text-white">
            <RichTextEditor 
              content={content}
              onChange={(val) => { setContent(val); updateWordCount(val); }}
              placeholder="Initiate cognitive data stream..."
              className="border-none p-0 !bg-transparent min-h-[800px] text-slate-100"
            />
          </div>
        </div>
        )}
      </div>

      {/* Asset Gallery Panel */}
      {showAssetGallery && (
        <AssetGallery
          isPanel
          onEmbed={embedAsset}
          onClose={() => setShowAssetGallery(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;
