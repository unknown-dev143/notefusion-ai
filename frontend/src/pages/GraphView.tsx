import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../features/notes/context/NoteContext';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  Settings,
  Share2,
  Database,
  Clock,
  Brain,
  Search,
  Filter,
  Camera,
  Layers,
  ChevronRight,
  Sparkles,
  Download,
  FileJson,
  Copy,
  Check,
  Users
} from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const GraphView: React.FC = () => {
    const { notes } = useNotes();
    const navigate = useNavigate();
    const fgRef = useRef<any>();
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
    const [timeRange, setTimeRange] = useState(100);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLegend, setShowLegend] = useState(true);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 80 });
    const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'recent'>('all');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    // Visible Graph Data (Time Travel + Search + Filter)
    const visibleData = useMemo(() => {
        if (!graphData.nodes.length) return { nodes: [], links: [] };
        
        let filteredNodes = graphData.nodes;

        // Apply Time Range
        const nodeCount = Math.max(2, Math.floor((graphData.nodes.length * timeRange) / 100));
        filteredNodes = filteredNodes.slice(0, nodeCount);

        // Apply Search
        if (searchQuery) {
            filteredNodes = filteredNodes.filter((n: any) => 
                n.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply Filters
        if (activeFilter === 'pinned') {
            filteredNodes = filteredNodes.filter((n: any) => n.isPinned);
        }

        const nodeIds = new Set(filteredNodes.map((n: any) => n.id));
        
        const activeLinks = graphData.links.filter((l: any) => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });

        return { nodes: filteredNodes, links: activeLinks };
    }, [graphData, timeRange, searchQuery, activeFilter]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setDimensions({ 
            width: window.innerWidth, 
            height: window.innerHeight - 80 
        });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate graph data
    useEffect(() => {
        if (!notes || notes.length === 0) {
            // Generate mock data for preview
            const nodes = [...Array(40).keys()].map(i => ({ 
                id: `mock-${i}`, 
                name: `Concept ${i}`,
                val: Math.random() * 20 + 5,
                color: i % 5 === 0 ? '#3b82f6' : i % 3 === 0 ? '#8b5cf6' : '#94a3b8'
            }));
            const links = [...Array(60).keys()].map(i => ({
                source: `mock-${Math.floor(Math.random() * 40)}`,
                target: `mock-${Math.floor(Math.random() * 40)}`
            }));
            setGraphData({ nodes, links });
            return;
        }

        // Build from real notes
        const nodes = notes.map((n: any) => ({
            id: String(n.id || n._id || Math.random()),
            name: n.title || 'Untitled Note',
            val: n.isPinned ? 25 : 15,
            color: n.isPinned ? '#3b82f6' : n.tags?.length > 0 ? '#8b5cf6' : '#94a3b8',
            isPinned: n.isPinned,
            tags: n.tags || []
        }));

        // Link notes that share tags or have similar titles
        const links: any[] = [];
        notes.forEach((n1: any, i: number) => {
            notes.slice(i + 1).forEach((n2: any) => {
                const n1Tags = n1.tags || [];
                const n2Tags = n2.tags || [];
                const commonTags = n1Tags.filter((t: string) => n2Tags.includes(t));
                
                // Also link if titles share words
                const n1Words = (n1.title || '').toLowerCase().split(/\s+/);
                const n2Words = (n2.title || '').toLowerCase().split(/\s+/);
                const commonWords = n1Words.filter((w: string) => w.length > 3 && n2Words.includes(w));
                
                if (commonTags.length > 0 || commonWords.length > 0) {
                    links.push({ 
                        source: String(n1.id || n1._id), 
                        target: String(n2.id || n2._id) 
                    });
                }
            });
        });

        setGraphData({ nodes, links });
    }, [notes]);

    const handleNodeClick = useCallback((node: any) => {
        setSelectedNode(node);
        // Center on node
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.5, 800);
    }, []);

    const takeSnapshot = async () => {
        const container = document.getElementById('graph-container');
        if (!container) return;
        
        toast.promise(
            (async () => {
                const canvas = await html2canvas(container, {
                    backgroundColor: '#020617',
                    scale: 2
                });
                const link = document.createElement('a');
                link.download = `neural-map-${new Date().toISOString().slice(0,10)}.png`;
                link.href = canvas.toDataURL();
                link.click();
            })(),
            {
                loading: 'Generating Neural Snapshot...',
                success: 'Snapshot Saved to Archive!',
                error: 'Failed to capture neural state.'
            }
        );
    };

    // Export to JSON
    const exportToJSON = () => {
        const exportData = {
            metadata: {
                exported: new Date().toISOString(),
                nodeCount: visibleData.nodes.length,
                linkCount: visibleData.links.length
            },
            nodes: visibleData.nodes,
            links: visibleData.links
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `neural-graph-${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Graph exported to JSON');
    };

    // Export to SVG
    const exportToSVG = () => {
        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}">
                <rect width="100%" height="100%" fill="#020617"/>
                ${visibleData.links.map((link: any) => {
                    const source = typeof link.source === 'object' ? link.source : visibleData.nodes.find((n: any) => n.id === link.source);
                    const target = typeof link.target === 'object' ? link.target : visibleData.nodes.find((n: any) => n.id === link.target);
                    if (!source || !target) return '';
                    return `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#475569" stroke-width="1" opacity="0.3"/>`;
                }).join('')}
                ${visibleData.nodes.map((node: any) => `
                    <circle cx="${node.x}" cy="${node.y}" r="${node.val / 2}" fill="${node.color}" opacity="0.8"/>
                    <text x="${node.x}" y="${node.y + node.val + 10}" fill="white" font-size="10" text-anchor="middle">${node.name}</text>
                `).join('')}
            </svg>
        `;
        
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `neural-graph-${new Date().toISOString().slice(0,10)}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Graph exported to SVG');
    };

    // Generate share link
    const generateShareLink = () => {
        const baseUrl = window.location.origin;
        const shareId = Math.random().toString(36).substring(7);
        const link = `${baseUrl}/graph/shared/${shareId}`;
        setShareLink(link);
        setShowShareModal(true);
        toast.success('Share link generated!');
    };

    // Copy share link
    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id="graph-container" className="h-[calc(100vh-80px)] flex flex-col bg-slate-950 overflow-hidden relative" style={{ minHeight: '600px' }}>
            {/* Overlay Header */}
            <div className="absolute top-10 left-10 z-30 flex items-start gap-12 pointer-events-none transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
                    <div className="p-1 px-4 glass rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 ai-sparkle">Neural Subspace • Mapping Live</div>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4 italic">
                    Synaptic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">Map Pro</span>
                  </h1>
                </div>

                {/* Live Search Widget */}
                <div className="pointer-events-auto group">
                    <div className="glass px-6 py-4 rounded-[32px] border-white/10 flex items-center gap-4 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all shadow-2xl">
                        <Search size={20} className="text-slate-500 group-focus-within:text-blue-500 transition-colors"/>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Locate neural node..."
                            className="bg-transparent border-none text-white text-sm font-bold outline-none placeholder:text-slate-600 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Premium Controls */}
            <div className="absolute top-10 right-10 z-30 flex flex-col gap-6 pointer-events-auto items-end">
                <div className="glass rounded-[32px] p-3 flex flex-col gap-2 shadow-2xl border-white/5 backdrop-blur-3xl">
                    <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() * 1.5, 600)} className="p-3.5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-400 transition-all" title="Zoom In"><ZoomIn size={22}/></button>
                    <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() / 1.5, 600)} className="p-3.5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-400 transition-all" title="Zoom Out"><ZoomOut size={22}/></button>
                    <div className="h-px w-8 bg-white/10 mx-auto my-1"></div>
                    <button onClick={() => { fgRef.current.zoomToFit(600); setSelectedNode(null); }} className="p-3.5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-400 transition-all" title="Reset View"><RefreshCcw size={22}/></button>
                    <button onClick={takeSnapshot} className="p-3.5 hover:bg-emerald-600 hover:text-white rounded-2xl text-slate-400 transition-all" title="Capture Snapshot"><Camera size={22}/></button>
                    <div className="h-px w-8 bg-white/10 mx-auto my-1"></div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)} 
                            className="p-3.5 hover:bg-purple-600 hover:text-white rounded-2xl text-slate-400 transition-all" 
                            title="Export Graph"
                        >
                            <Download size={22}/>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-full mr-3 top-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 min-w-[180px]">
                                <button onClick={() => { takeSnapshot(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-800 rounded-xl flex items-center gap-3 text-xs font-bold text-white">
                                    <Camera size={16} className="text-emerald-400" /> PNG Image
                                </button>
                                <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-800 rounded-xl flex items-center gap-3 text-xs font-bold text-white">
                                    <FileJson size={16} className="text-blue-400" /> JSON Data
                                </button>
                                <button onClick={() => { exportToSVG(); setShowExportMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-800 rounded-xl flex items-center gap-3 text-xs font-bold text-white">
                                    <Layers size={16} className="text-purple-400" /> SVG Vector
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={generateShareLink} className="p-3.5 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-400 transition-all" title="Share Graph"><Share2 size={22}/></button>
                </div>

                {/* Filter Switcher */}
                <div className="glass px-2 py-2 rounded-2xl border-white/5 flex gap-1">
                    {['all', 'pinned'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setActiveFilter(f as any)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeFilter === f ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Side Panel (Contextual Insight) */}
            {selectedNode && (
                <div className="absolute bottom-12 right-12 z-40 w-80 glass rounded-[40px] p-8 shadow-2xl animate-slide-up border-white/10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                           <Brain size={24}/>
                        </div>
                        <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors hover:bg-white/10">✕</button>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 leading-tight tracking-tight">{selectedNode.name}</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Localized Discovery</p>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                           <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Neural Weight</p>
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, selectedNode.val * 2)}%` }}></div>
                              </div>
                              <span className="text-xs font-black text-white">{(selectedNode.val / 2).toFixed(1)}</span>
                           </div>
                        </div>

                        <button 
                            onClick={() => navigate(`/notes/${selectedNode.id}`)}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                           Open Research Sync →
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overlay (Bottom Left) */}
            <div className="absolute bottom-12 left-12 z-30 pointer-events-none">
                <div className="flex gap-10">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Active Nodes</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter">{graphData?.nodes?.length || 0}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10 self-center"></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Neural Entropy</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter">0.{(visibleData?.links?.length || 0) * 7}</p>
                    </div>
                </div>
            </div>

            {/* Time Travel Slider - Pro Glass */}
            <div className="absolute bottom-10 left-10 z-30 flex flex-col gap-6 items-start">
               {/* Legend Component */}
               <div className="glass p-6 rounded-[32px] border-white/10 shadow-2xl backdrop-blur-3xl animate-slide-right pointer-events-auto">
                   <div className="flex items-center gap-3 mb-6">
                      <Layers size={16} className="text-blue-500"/>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Map Legend</span>
                   </div>
                   <div className="space-y-4">
                       {[
                           { label: 'Pinned Core', color: '#3b82f6', desc: 'Central research hubs' },
                           { label: 'Tagged Cluster', color: '#8b5cf6', desc: 'Categorized concepts' },
                           { label: 'Standard Node', color: '#94a3b8', desc: 'Active research items' }
                       ].map(item => (
                           <div key={item.label} className="flex items-center gap-4 group">
                               <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }}></div>
                               <div>
                                   <p className="text-[10px] font-black text-white leading-none mb-1">{item.label}</p>
                                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{item.desc}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>

                <div className="glass px-8 py-5 rounded-[32px] border-white/10 w-[400px] pointer-events-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                            <Clock size={16} className="text-blue-500" /> Chronology
                        </div>
                        <span className="text-[10px] font-black text-blue-500">{timeRange}% Scale</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(59,130,246,1)] focus:outline-none"
                    />
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="flex-1 cursor-grab active:cursor-grabbing" style={{ width: '100%', height: '100%', minHeight: '600px' }}>
                {graphData && graphData.nodes && graphData.nodes.length > 0 ? (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={visibleData}
                        nodeLabel="name"
                        nodeRelSize={6}
                        nodeColor={node => (node as any).color || '#94a3b8'}
                        linkColor={() => '#1e293b'}
                        backgroundColor="transparent"
                        onNodeClick={handleNodeClick}
                        width={dimensions.width}
                        height={dimensions.height}
                        cooldownTicks={100}
                        onEngineStop={() => {
                            if (fgRef.current) {
                                fgRef.current.zoomToFit(400);
                            }
                        }}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                        // Focus Mode Logic
                        const isSelected = selectedNode && node.id === selectedNode.id;
                        let isDimmed = false;
                        if (selectedNode) {
                            // Check neighbors (assuming links are objects references after simulation)
                            const isNeighbor = visibleData.links.some((l: any) => {
                                const sId = l.source.id || l.source;
                                const tId = l.target.id || l.target;
                                return (sId === node.id && tId === selectedNode.id) || (tId === node.id && sId === selectedNode.id);
                            });
                             if (!isSelected && !isNeighbor) isDimmed = true;
                        }

                        // Safety check for node coordinates
                        if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) {
                            return;
                        }

                        const opacity = isDimmed ? 0.1 : 1;
                        ctx.globalAlpha = opacity;

                        const label = (node as any).name;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px "Plus Jakarta Sans", sans-serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        // Node Glow effect
                        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, (node as any).val * 0.5);
                        gradient.addColorStop(0, (node as any).color + '44');
                        gradient.addColorStop(1, 'transparent');
                        ctx.fillStyle = gradient;
                        ctx.beginPath(); 
                        ctx.arc(node.x, node.y, (node as any).val * 0.5, 0, 2 * Math.PI, false); 
                        ctx.fill();

                        // Main circle
                        ctx.fillStyle = (node as any).color;
                        ctx.beginPath(); 
                        ctx.arc(node.x, node.y, (node as any).val * 0.2, 0, 2 * Math.PI, false); 
                        ctx.fill();

                        // Label
                        if (globalScale > 1.5) {
                            ctx.fillStyle = 'white';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(label, node.x, node.y + (node as any).val * 0.4);
                        }
                    }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-2xl font-black text-white mb-2">Loading Graph...</h3>
                            <p className="text-slate-400">Preparing your knowledge network</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-[40px] p-10 max-w-2xl w-full shadow-3xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Share Neural Graph</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Collaboration Enabled</p>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Shareable Link</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white"
                                    />
                                    <button
                                        onClick={copyShareLink}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-900/30 border border-blue-700/30 rounded-2xl p-6">
                                <h3 className="text-sm font-black text-blue-300 mb-3 flex items-center gap-2">
                                    <Share2 size={16} />
                                    Collaboration Features
                                </h3>
                                <ul className="space-y-2 text-xs font-medium text-blue-200">
                                    <li className="flex items-center gap-2">✓ Real-time graph synchronization</li>
                                    <li className="flex items-center gap-2">✓ Collaborative node editing</li>
                                    <li className="flex items-center gap-2">✓ Team annotations and comments</li>
                                    <li className="flex items-center gap-2">✓ Version history and snapshots</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setShowShareModal(false)}
                                className="mt-6 w-full px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .force-graph-container canvas {
                    cursor: crosshair;
                }
            `}} />
        </div>
    );
};

export default GraphView;
