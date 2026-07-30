import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import { useNotes } from '../features/notes/context/NoteContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  MousePointer2, 
  Minus, 
  Undo2, 
  Redo2, 
  Download, 
  Trash2, 
  Layers, 
  ZoomIn,
  StickyNote,
  Wand2,
  LayoutTemplate,
  Users,
  X,
  Copy,
  Check
} from 'lucide-react';

type Tool = 'pen' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser' | 'select' | 'sticky';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const { sendMessage, joinRoom, leaveRoom, lastMessage, isConnected } = useWebSocket();
  
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(4);
  const [color, setColor] = useState('#2563eb');
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const { notes, createNote } = useNotes();
  
  // Collab state
  const [collabRoomId, setCollabRoomId] = useState('');
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomMembersCount, setRoomMembersCount] = useState(1);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const isApplyingRemotePatch = useRef(false);

  const importKnowledge = () => {
    if (!fabricCanvasRef.current || !notes.length) {
      toast.error('No notes found to import');
      return;
    }
    const canvas = fabricCanvasRef.current;
    
    // Import last 3 notes as sticky notes
    notes.slice(0, 3).forEach((note, i) => {
        const x = 100 + (i * 200);
        const y = 100 + (i * 50);
        
        const sticky = new fabric.Group([
            new fabric.Rect({ width: 180, height: 180, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1, shadow: { color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 5, offsetY: 5 } }),
            new fabric.IText(note.title, { fontSize: 14, fontWeight: 'bold', fontFamily: 'Inter', left: 15, top: 15, width: 150 }),
            new fabric.IText(note.content.substring(0, 100) + '...', { fontSize: 10, fontFamily: 'Inter', left: 15, top: 45, width: 150 })
        ], { left: x, top: y });
        
        canvas.add(sticky);
    });
    
    canvas.renderAll();
    toast.success('Knowledge imported onto canvas');
  };

  // Collab: receive patches from peers
  useEffect(() => {
    if (!lastMessage || !fabricCanvasRef.current) return;
    if (lastMessage.type === 'whiteboard_update' && lastMessage.roomId === collabRoomId && lastMessage.patch) {
      isApplyingRemotePatch.current = true;
      fabricCanvasRef.current.loadFromJSON(lastMessage.patch, () => {
        fabricCanvasRef.current.renderAll();
        isApplyingRemotePatch.current = false;
      });
    }
    if (lastMessage.type === 'room_joined') {
      setRoomMembersCount(lastMessage.membersCount || 1);
      toast.success(`Joined collab room. ${lastMessage.membersCount} member(s) online.`);
    }
    if (lastMessage.type === 'collab_joined') {
      setRoomMembersCount(prev => prev + 1);
      toast(`A new collaborator joined your whiteboard!`, { icon: '👥' });
    }
    if (lastMessage.type === 'collab_left') {
      setRoomMembersCount(prev => Math.max(1, prev - 1));
    }
  }, [lastMessage, collabRoomId]);

  const startCollab = () => {
    const roomId = collabRoomId || `wb-${Math.random().toString(36).substring(2, 8)}`;
    setCollabRoomId(roomId);
    joinRoom(roomId);
    setIsInRoom(true);
    setShowCollabModal(false);
    toast.success('Collab session started! Share the room ID.');
  };

  const stopCollab = () => {
    if (collabRoomId) leaveRoom(collabRoomId);
    setIsInRoom(false);
    setRoomMembersCount(1);
    (window as any).__wbCollabRoomId = '';
    toast('Left collab session', { icon: '👋' });
  };

  // Keep window ref in sync so canvas broadcast closure can read it
  useEffect(() => {
    (window as any).__wbCollabRoomId = isInRoom ? collabRoomId : '';
  }, [collabRoomId, isInRoom]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const fb = fabric as any;
    const canvas = new fb.Canvas(canvasRef.current, {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
      stopContextMenu: true,
      fireRightClick: true
    });

    fabricCanvasRef.current = canvas;

    // Default Brush
    canvas.freeDrawingBrush = new fb.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = lineWidth;
    canvas.freeDrawingBrush.color = color;

    // History Logic + Collab broadcast
    const saveState = () => {
      const json = JSON.stringify(canvas.toJSON());
      setHistory(prev => {
        const newHistory = prev.slice(0, historyStep + 1);
        return [...newHistory, json];
      });
      setHistoryStep(prev => prev + 1);
      // Broadcast to collab room if active
      if (!isApplyingRemotePatch.current) {
        // We use a ref-safe approach: read from fabricCanvasRef
        const roomId = (window as any).__wbCollabRoomId;
        if (roomId) {
          sendMessage({ type: 'whiteboard_update', roomId, patch: json });
        }
      }
    };

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    // Selection handlers
    canvas.on('selection:created', (e: any) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e: any) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    // Zooming
    canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      if (newZoom > 20) newZoom = 20;
      if (newZoom < 0.01) newZoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    const handleResize = () => {
      if (containerRef.current && fabricCanvasRef.current) {
        const c = fabricCanvasRef.current;
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        if (c.setDimensions) {
            c.setDimensions({ width: w, height: h });
        } else {
            c.setWidth(w);
            c.setHeight(h);
        }
        c.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync tool and brush state
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'pen' || activeTool === 'eraser';
    
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = activeTool === 'eraser' ? 50 : lineWidth;
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : color;
    }

    if (canvas.off) {
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
    }

    if (!canvas.isDrawingMode && activeTool !== 'select') {
      let isDrawing = false;
      let shape: any = null;
      let startX = 0, startY = 0;

      canvas.on('mouse:down', (options: any) => {
        isDrawing = true;
        const pointer = canvas.getPointer(options.e);
        startX = pointer.x;
        startY = pointer.y;

        if (activeTool === 'rectangle') {
          shape = new fabric.Rect({
            left: startX, top: startY, width: 0, height: 0,
            fill: 'transparent', stroke: color, strokeWidth: lineWidth, rx: 8, ry: 8
          });
        } else if (activeTool === 'circle') {
          shape = new fabric.Circle({
            left: startX, top: startY, radius: 0,
            fill: 'transparent', stroke: color, strokeWidth: lineWidth
          });
        } else if (activeTool === 'line') {
          shape = new fabric.Line([startX, startY, startX, startY], { stroke: color, strokeWidth: lineWidth });
        } else if (activeTool === 'sticky') {
            shape = new fabric.Group([
                new fabric.Rect({ width: 150, height: 150, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1 }),
                new fabric.IText('New Note', { fontSize: 16, fontFamily: 'Inter', left: 20, top: 20 })
            ], { left: startX, top: startY });
            canvas.add(shape);
            setActiveTool('select');
            isDrawing = false;
            return;
        } else if (activeTool === 'text') {
           const text = new fabric.IText('Writing...', { left: startX, top: startY, fontSize: 24, fontFamily: 'Plus Jakarta Sans', fill: color });
          canvas.add(text);
          canvas.setActiveObject(text);
          if ((text as any).enterEditing) (text as any).enterEditing();
          setActiveTool('select');
          isDrawing = false;
          return;
        }

        if (shape) canvas.add(shape);
      });

      canvas.on('mouse:move', (options: any) => {
        if (!isDrawing || !shape) return;
        const pointer = canvas.getPointer(options.e);

        if (activeTool === 'rectangle') {
          shape.set({ width: Math.abs(startX - pointer.x), height: Math.abs(startY - pointer.y), left: Math.min(startX, pointer.x), top: Math.min(startY, pointer.y) });
        } else if (activeTool === 'circle') {
          const radius = Math.sqrt(Math.pow(startX - pointer.x, 2) + Math.pow(startY - pointer.y, 2)) / 2;
          shape.set({ radius: radius, left: Math.min(startX, pointer.x), top: Math.min(startY, pointer.y) });
        } else if (activeTool === 'line') {
          shape.set({ x2: pointer.x, y2: pointer.y });
        }
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => { isDrawing = false; shape = null; });
    }

    canvas.renderAll();
  }, [activeTool, color, lineWidth]);

  const undo = () => {
    if (historyStep > 0 && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const prev = history[historyStep - 1];
      canvas.loadFromJSON(prev, () => {
        canvas.renderAll();
        setHistoryStep(historyStep - 1);
      });
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1 && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const next = history[historyStep + 1];
      canvas.loadFromJSON(next, () => {
        canvas.renderAll();
        setHistoryStep(historyStep + 1);
      });
    }
  };

  const downloadCanvas = () => {
    if (!fabricCanvasRef.current) return;
    const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'whiteboard-synthesis.png';
    link.href = dataURL;
    link.click();
    toast.success("Design Exported");
  };

  const saveToCloud = async () => {
    if (!fabricCanvasRef.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    
    try {
        await createNote({
            title: `Whiteboard Synthesis - ${new Date().toLocaleDateString()}`,
            content: `Whiteboard drawing data saved.`,
            tags: ['whiteboard', 'visual'],
            isPinned: false,
            isArchived: false,
            color: '#f8fafc',
            attributes: { fabricData: json }
        } as any);
        toast.success('Whiteboard synced to your library!');
    } catch (err) {
        toast.error('Failed to sync whiteboard');
    }
  };

  const loadFromCloud = () => {
    if (!fabricCanvasRef.current || !notes.length) return;
    const whiteboardNotes = notes.filter((n: any) => n.tags?.includes('whiteboard') && n.attributes?.fabricData);
    if (whiteboardNotes.length === 0) {
        toast.error('No saved whiteboards found in your library.');
        return;
    }
    // Load the most recent one
    const latest = whiteboardNotes[0];
    const canvas = fabricCanvasRef.current;
    canvas.loadFromJSON((latest as any).attributes.fabricData, () => {
        canvas.renderAll();
        toast.success(`Loaded: ${latest.title}`);
        
        // Reset history
        setHistory([JSON.stringify(canvas.toJSON())]);
        setHistoryStep(0);
    });
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
        const c = fabricCanvasRef.current;
        c.clear();
        if (c.setBackgroundColor) {
            c.setBackgroundColor('#ffffff', () => c.renderAll());
        } else {
            c.backgroundColor = '#ffffff';
            c.renderAll();
        }
        toast.success("Canvas Purged");
    }
  };

  const applyMagicLayout = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const objs = canvas.getObjects();
    
    // Simple grid alignment
    objs.forEach((obj: any, i: number) => {
        if (obj.left) obj.left = Math.round(obj.left / 50) * 50;
        if (obj.top) obj.top = Math.round(obj.top / 50) * 50;
    });
    
    canvas.renderAll();
    toast.success("Magic Layout Applied: Objects Aligned to Grid");
  };

  const addTemplate = (type: 'mindmap' | 'kanban') => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;
      const center = canvas.getCenter();

      if (type === 'mindmap') {
            const root = new fabric.Rect({ left: center.left - 50, top: center.top - 150, width: 150, height: 60, fill: '#3b82f6', rx: 10, ry: 10 });
            const rootText = new fabric.IText('Main Idea', { left: center.left - 30, top: center.top - 130, fill: 'white', fontSize: 16, fontFamily: 'Inter' });
            
            const branch1 = new fabric.Rect({ left: center.left - 200, top: center.top, width: 120, height: 50, fill: '#e2e8f0', rx: 8, ry: 8 });
            const branch2 = new fabric.Rect({ left: center.left + 150, top: center.top, width: 120, height: 50, fill: '#e2e8f0', rx: 8, ry: 8 });
            
            const line1 = new fabric.Line([center.left + 25, center.top - 90, center.left - 140, center.top], { stroke: '#94a3b8', strokeWidth: 2 });
            const line2 = new fabric.Line([center.left + 25, center.top - 90, center.left + 210, center.top], { stroke: '#94a3b8', strokeWidth: 2 });

            canvas.add(line1, line2, root, rootText, branch1, branch2);
            toast.success("Mind Map Template Added");
      } else if (type === 'kanban') {
          const col1 = new fabric.Rect({ left: center.left - 200, top: center.top - 200, width: 200, height: 400, fill: '#f1f5f9', rx: 10, ry: 10 });
          const col2 = new fabric.Rect({ left: center.left + 20, top: center.top - 200, width: 200, height: 400, fill: '#f1f5f9', rx: 10, ry: 10 });
          
          const head1 = new fabric.IText('To Do', { left: center.left - 180, top: center.top - 180, fontSize: 20, fontFamily: 'Inter', fontWeight: 'bold' });
          const head2 = new fabric.IText('Doing', { left: center.left + 40, top: center.top - 180, fontSize: 20, fontFamily: 'Inter', fontWeight: 'bold' });

          canvas.add(col1, col2, head1, head2);
          toast.success("Kanban Board Added");
      }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-200 rounded-[48px] shadow-2xl overflow-hidden animate-slide-up relative">
      
      {/* Floating Toolbar (Left) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 p-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl">
         {[
            { id: 'select', icon: <MousePointer2 size={24} />, label: 'Select' },
            { id: 'pen', icon: <Pencil size={24} />, label: 'Pen' },
            { id: 'rectangle', icon: <Square size={24} />, label: 'Box' },
            { id: 'circle', icon: <Circle size={24} />, label: 'Circle' },
            { id: 'line', icon: <Minus size={24} />, label: 'Line' },
            { id: 'text', icon: <Type size={24} />, label: 'Text' },
            { id: 'sticky', icon: <StickyNote size={24} />, label: 'Sticky' },
            { id: 'eraser', icon: <Eraser size={24} />, label: 'Eraser' },
         ].map(t => (
            <button
               key={t.id}
               onClick={() => setActiveTool(t.id as Tool)}
               className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${activeTool === t.id ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-500 hover:bg-slate-100 hover:scale-105'}`}
               title={t.label}
            >
               {t.icon}
            </button>
         ))}
      </div>

      {/* Styles & Settings (Right) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-6 p-6 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[40px] shadow-2xl w-24 items-center">
         <div className="flex flex-col gap-3">
            {['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#0f172a'].map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-4 border-white transition-all shadow-md ${color === c ? 'scale-125 shadow-blue-200 ring-2 ring-blue-500' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
            ))}
         </div>
         <div className="w-full h-px bg-slate-100"></div>
         <div className="flex flex-col gap-2">
            {[2, 4, 8, 16].map(size => (
               <button key={size} onClick={() => setLineWidth(size)} className={`w-12 h-12 flex items-center justify-center rounded-xl text-xs font-black ${lineWidth === size ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{size}</button>
            ))}
         </div>
      </div>

      {/* Top Controls (Undo/Redo/Zoom) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 p-4 bg-slate-900/95 backdrop-blur-md rounded-[32px] shadow-2xl text-white">
         <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <button onClick={undo} disabled={historyStep <= 0} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"><Undo2 size={20}/></button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"><Redo2 size={20}/></button>
         </div>
         
         <div className="flex items-center gap-3 px-2">
            <ZoomIn size={16} className="text-slate-500"/>
            <span className="text-xs font-black min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
         </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
            <button onClick={importKnowledge} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2">
                🧠 Neural Import
            </button>
            <button onClick={saveToCloud} className="px-6 py-2.5 bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2">
                ☁️ Save
            </button>
            <button onClick={loadFromCloud} className="px-6 py-2.5 bg-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2">
                📂 Load
            </button>
            <button onClick={downloadCanvas} className="px-6 py-2.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2">
                <Download size={14}/> Export
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button onClick={applyMagicLayout} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-500/20 text-purple-400 transition-all" title="Magic Layout"><Wand2 size={20}/></button>
            <button onClick={() => addTemplate('mindmap')} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-blue-400 transition-all" title="Add Mind Map"><LayoutTemplate size={20}/></button>
            <button onClick={clearCanvas} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-rose-500/20 text-rose-400 transition-all"><Trash2 size={20}/></button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button
              onClick={() => {
                if (isInRoom) stopCollab();
                else setShowCollabModal(true);
              }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                isInRoom ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/30 animate-pulse' : 'bg-white/10 text-slate-300 hover:bg-violet-600 hover:text-white'
              }`}
              title={isInRoom ? `Collab: ${roomMembersCount} online` : 'Start Live Collab'}
            >
              <Users size={14}/> {isInRoom ? `${roomMembersCount} Online` : 'Collab'}
            </button>
          </div>
      </div>

      {/* Object Selection Widget */}
      {selectedObject && (
        <div className="absolute top-32 right-32 z-30 animate-dropdown">
            <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl flex items-center gap-1">
                <button onClick={() => { if (selectedObject.bringToFront) selectedObject.bringToFront(); fabricCanvasRef.current?.renderAll(); }} className="p-2 hover:bg-slate-100 rounded-lg" title="Bring to Front"><Layers size={18} className="text-slate-600"/></button>
                <button onClick={() => { fabricCanvasRef.current?.remove(selectedObject); if (fabricCanvasRef.current?.discardActiveObject) fabricCanvasRef.current?.discardActiveObject(); fabricCanvasRef.current?.renderAll(); }} className="p-2 hover:bg-rose-50 rounded-lg text-rose-500" title="Delete"><Trash2 size={18}/></button>
            </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden" ref={containerRef}>
         <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <canvas ref={canvasRef} />
      </div>

      {/* Neural Link Info */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 px-8 py-4 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-full shadow-xl flex items-center gap-4">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isInRoom ? 'bg-violet-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              {isInRoom ? `Collab Room: ${collabRoomId}` : 'Neural Sync Alpha'}
            </span>
         </div>
         <div className="w-px h-4 bg-slate-200"></div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Nodes: {history.length}</p>
      </div>

      {/* Collab Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-6" onClick={() => setShowCollabModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-[40px] p-10 max-w-lg w-full shadow-3xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Live Collab</h2>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Real-Time Whiteboard Sync</p>
              </div>
              <button onClick={() => setShowCollabModal(false)} className="ml-auto p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                <X size={20}/>
              </button>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Room ID (leave blank for new session)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={collabRoomId}
                  onChange={e => setCollabRoomId(e.target.value)}
                  placeholder="e.g. wb-abc123"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 outline-none focus:border-violet-500 transition-colors"
                />
                {collabRoomId && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(collabRoomId);
                      setCopiedRoom(true);
                      setTimeout(() => setCopiedRoom(false), 2000);
                    }}
                    className="px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    {copiedRoom ? <Check size={14}/> : <Copy size={14}/>}
                    {copiedRoom ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-violet-900/30 border border-violet-500/30 rounded-2xl p-5 mb-8">
              <p className="text-xs font-medium text-violet-200">
                Share the <strong>Room ID</strong> with collaborators. When they open the Whiteboard and enter the same ID, your drawings will sync in real time.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startCollab}
                className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-500 transition-all"
              >
                {!isConnected ? 'Connect & Start' : (collabRoomId ? 'Join Room' : 'Create Room')}
              </button>
              <button onClick={() => setShowCollabModal(false)} className="px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;
