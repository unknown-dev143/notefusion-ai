import React, { useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Move, Plus, Save, Share2, Layout, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { mindMapService, MindMap as MindMapType } from '../features/mindmaps/services/mindMapService';
import { api, handleApiError } from '../lib/api';

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  children: string[];
}

const MindMap: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mindMapId, setMindMapId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false);
  
  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));

  // Initial nodes if new map
  const defaultNodes: Node[] = [
    { id: 'root', x: 800, y: 600, label: 'Central Idea', color: 'bg-slate-900 text-white', children: [] }
  ];

  useEffect(() => { loadMindMap(); }, []);

  const loadMindMap = async () => {
      try {
          const maps = await mindMapService.getMindMaps();
          if (maps.length > 0) {
              const map = maps[0];
              setMindMapId(map.id);
              setNodes(JSON.parse(map.data));
          } else {
              const newMap = await mindMapService.createMindMap({ title: 'Neural Map', data: JSON.stringify(defaultNodes) });
              setMindMapId(newMap.id);
              setNodes(defaultNodes);
          }
      } catch (err) {
          toast.error('Failed to load mind map');
          setNodes(defaultNodes);
      } finally { setLoading(false); }
  };

  const handleSave = async (updatedNodes?: Node[]) => {
      if (!mindMapId) return;
      try { await mindMapService.updateMindMap(mindMapId, { data: JSON.stringify(updatedNodes || nodes) }); } catch (err) {}
  };

  const addNode = () => {
    if (!selectedNodeId) return toast.error('Select a node to branch from');
    const parent = nodes.find(n => n.id === selectedNodeId);
    if (!parent) return;

    const newNodeId = `n${Date.now()}`;
    const newNode: Node = { id: newNodeId, x: parent.x + (Math.random() * 200 - 100), y: parent.y + 150, label: 'New Concept', color: 'bg-white text-slate-800 border-slate-200', children: [] };
    const nextNodes = [...nodes.map(n => n.id === parent.id ? { ...n, children: [...n.children, newNodeId] } : n), newNode];
    setNodes(nextNodes);
    handleSave(nextNodes);
  };

  const handleAIExpand = async () => {
    if (!selectedNodeId || expanding) return toast.error('Select a node to expand via Neural Agent');
    const parent = nodes.find(n => n.id === selectedNodeId);
    if (!parent) return;

    setExpanding(true);
    const toastId = toast.loading('Neural expansion in progress...');
    try {
        const response = await api.post('/ai/mindmap', { content: parent.label });
        const aiNodes = response.data.nodes || [];
        
        const newNodes: Node[] = [];
        const newChildIds: string[] = [];

        aiNodes.forEach((n: any, i: number) => {
            const id = `ai-${Date.now()}-${i}`;
            const angle = (i / aiNodes.length) * 2 * Math.PI;
            const dist = 250;
            newNodes.push({
                id,
                label: n.label,
                x: parent.x + Math.cos(angle) * dist,
                y: parent.y + Math.sin(angle) * dist,
                color: 'bg-blue-600 text-white border-blue-400',
                children: []
            });
            newChildIds.push(id);
        });

        const nextNodes = [...nodes.map(node => node.id === parent.id ? { ...node, children: [...node.children, ...newChildIds] } : node), ...newNodes];
        setNodes(nextNodes);
        handleSave(nextNodes);
        toast.success(`Generated ${aiNodes.length} neural branches!`, { icon: '🧠' });
    } catch (err) {
        toast.error(handleApiError(err, 'Neural loop failed'));
    } finally {
        setExpanding(false);
        toast.dismiss(toastId);
    }
  };

  const updateNodeLabel = (id: string, label: string) => setNodes(prev => prev.map(n => n.id === id ? { ...n, label } : n));
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseDown = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setSelectedNodeId(id); };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 animate-fade-in h-[calc(100vh-100px)] flex flex-col font-sans">
       <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-slate-100 pb-10">
         <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100"><Layout className="text-white" size={16} /></div>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Synaptic Mapper V1</span>
            </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Neural <span className="text-blue-600">Map</span></h1>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">Synthesize conceptual architectures via AI expansion</p>
         </div>
         <div className="flex gap-3">
            <button onClick={() => handleSave()} className="bg-white border border-slate-100 text-slate-400 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all shadow-sm flex items-center gap-3">
               <Save size={16}/> Commit
            </button>
            <button onClick={addNode} className="bg-white border border-slate-100 text-slate-400 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all shadow-sm flex items-center gap-3">
               <Plus size={16}/> Branch
            </button>
            <button onClick={handleAIExpand} disabled={expanding} className="bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3 group">
               <Sparkles size={16} className="group-hover:animate-spin" /> Neural Expand
            </button>
         </div>
       </div>

       {loading ? <div>Loading...</div> : (
       /* Canvas Area */
       <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[48px] overflow-hidden relative shadow-inner">
          
          {/* Controls */}
          <div className="absolute top-8 left-8 flex flex-col gap-2 bg-white p-2 rounded-2xl shadow-xl z-10">
             <button onClick={handleZoomIn} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"><ZoomIn size={20}/></button>
             <button onClick={handleZoomOut} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600"><ZoomOut size={20}/></button>
          </div>

          {/* Canvas */}
          <div 
             className="w-full h-full transform origin-center transition-transform duration-300"
             style={{ transform: `scale(${scale})` }}
          >
             <svg className="w-full h-full pointer-events-none absolute top-0 left-0">
                {/* Connections */}
                {nodes.map(node => (
                   node.children.map(childId => {
                      const child = nodes.find(n => n.id === childId);
                      if (!child) return null;
                      return (
                         <line 
                           key={`${node.id}-${childId}`}
                           x1={node.x} y1={node.y}
                           x2={child.x} y2={child.y}
                           stroke="#cbd5e1"
                           strokeWidth="2"
                         />
                      );
                   })
                ))}
             </svg>
             
             {/* Nodes */}
             {nodes.map(node => (
                <div
                   key={node.id}
                   onMouseDown={(e) => handleMouseDown(e, node.id)}
                   className={`absolute px-6 py-3 rounded-2xl font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 cursor-pointer border-2 bg-white ${
                      selectedNodeId === node.id ? 'ring-4 ring-blue-200 border-blue-500 scale-110 z-20' : 'border-transparent z-10'
                   } ${node.color}`}
                   style={{ left: node.x, top: node.y }}
                >
                   {selectedNodeId === node.id ? (
                       <input 
                           autoFocus
                           className="bg-transparent outline-none text-center w-full min-w-[80px]"
                           value={node.label}
                           onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                           onBlur={() => handleSave()} // Auto save on edit finish
                       />
                   ) : node.label}
                </div>
             ))}
          </div>
       </div>
       )}
    </div>
  );
};

export default MindMap;
