import React, { useState, useEffect, useRef } from 'react';
import { 
    Presentation, Plus, Sparkles, Trash2, Download, Type, Quote, 
    AlignLeft, Image as ImageIcon, ChevronRight, ChevronLeft, X,
    Maximize2, FileText, BarChart3, Palette, Layout, Wand2, Search,
    Send, ListOrdered, Layers, Settings, Share2, History, Monitor,
    Clock, Zap, CheckCircle2, ArrowRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../features/notes/context/NoteContext';
import toast from 'react-hot-toast';
import { api, handleApiError } from '../lib/api';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    BarController,
    LineController,
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    BarController,
    LineController,
    Title, 
    Tooltip, 
    Legend
);

// Workflow Types
type WorkflowMode = 'prompt' | 'outline' | 'editor';
type SlideTemplate = 'title' | 'content' | 'quote' | 'image' | 'chart' | 'timeline' | 'comparison';

interface SlideOutline {
    id: string;
    title: string;
    description: string;
    suggestedTemplate: SlideTemplate;
}

interface Slide {
    id: string;
    title: string;
    content: string;
    template: SlideTemplate;
    chartData?: any;
    meta?: any;
}

const THEMES = [
    { id: 'slate', style: 'bg-slate-900 text-white', accent: 'bg-blue-500', label: 'Obsidian' },
    { id: 'ocean', style: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white', accent: 'bg-cyan-400', label: 'Deep Ocean' },
    { id: 'emerald', style: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white', accent: 'bg-emerald-400', label: 'Emerald' },
    { id: 'ruby', style: 'bg-gradient-to-br from-rose-900 via-red-900 to-slate-900 text-white', accent: 'bg-rose-500', label: 'Ruby' },
    { id: 'amethyst', style: 'bg-gradient-to-br from-purple-900 via-fuchsia-900 to-slate-900 text-white', accent: 'bg-fuchsia-400', label: 'Amethyst' },
    { id: 'light', style: 'bg-white text-slate-900 border border-slate-200', accent: 'bg-blue-600', label: 'Minimal Light', isLight: true },
    { id: 'nordic', style: 'bg-[#2E3440] text-[#ECEFF4]', accent: 'bg-[#88C0D0]', label: 'Nordic Sky' },
];

const SlideMaker: React.FC = () => {
    const { notes } = useNotes();
    
    // Workflow State
    const [mode, setMode] = useState<WorkflowMode>('prompt');
    const [userPrompt, setUserPrompt] = useState('');
    const [outline, setOutline] = useState<SlideOutline[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    
    // Editor State
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeTheme, setActiveTheme] = useState(THEMES[1]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showNoteSelector, setShowNoteSelector] = useState(false);
    const [neuralCommand, setNeuralCommand] = useState('');

    // --- Smart keyword/topic extractor ---
    const extractKeyword = (prompt: string) => {
        // Remove common stop words to get the meaningful topic keyword
        const stopWords = ['the','of','a','an','in','for','and','or','to','into','with','from','on','by','at','as'];
        const words = prompt.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2);
        return words.slice(0, 4).join(' ') || prompt.split(' ').slice(0, 3).join(' ');
    };

    // --- Smart slide content engine (Gamma/Beautiful.ai style) ---
    const buildSlideContent = (template: SlideTemplate, topic: string, kw: string, idx: number): string => {
        const templates: Record<string, string[]> = {
            title: [
                `${topic} is reshaping how we think, work, and innovate. This presentation explores its core principles, real-world impact, and what comes next.`,
                `A deep-dive into ${topic} — from foundational theory to cutting-edge applications driving change across industries.`,
            ],
            content: [
                `• ${kw} enables faster, smarter decision-making at scale\n• Reduces operational friction by up to 40% in early adopters\n• Bridges the gap between raw data and strategic insight\n• Empowers cross-functional teams with actionable intelligence\n• Backed by research from leading institutions worldwide`,
                `• Key framework: Observe → Analyze → Act → Iterate\n• ${kw} adoption is growing at 34% CAGR globally\n• Early pilots demonstrate 3x ROI within 18 months\n• Integration with existing workflows requires minimal ramp-up\n• Scalable across SMBs and enterprise alike`,
                `• Five pillars: Speed, Precision, Adaptability, Scale, Trust\n• ${kw} reduces manual effort by 60–70%\n• Enables real-time personalization at population scale\n• Key stakeholders: engineers, analysts, executives, end users\n• Success metrics: accuracy, latency, adoption rate, ROI`,
            ],
            quote: [
                `"The measure of intelligence is the ability to change."\n\n— Albert Einstein`,
                `"We are entering an era where ${kw} becomes the infrastructure of everything."\n\n— Industry Research Report, 2025`,
                `"Innovation distinguishes between a leader and a follower. ${kw} is leadership."\n\n— Technology Futures Institute`,
            ],
            chart: [
                `Market adoption of ${kw} has accelerated sharply since 2022. Growth outpaces the industry average by 2.3×. Projected to reach $420B by 2030.`,
                `${kw} performance benchmarks consistently exceed baseline by 45–60%. The data validates accelerated investment and scaled deployment.`,
            ],
            timeline: [
                `Phase 01: Foundation — Establish core ${kw} infrastructure & pilot programs\nPhase 02: Expansion — Scale adoption across all divisions with measurable KPIs\nPhase 03: Optimization — Refine models, automate feedback loops, drive ROI`,
            ],
            comparison: [
                `Before ${kw}: Manual processes, delayed insights, high error rates\nWith ${kw}: Real-time automation, predictive accuracy, 10× throughput`,
            ]
        };
        const pool = templates[template] || templates['content'];
        return pool[idx % pool.length];
    };

    // --- Step 1: Generate outline (no AI call needed) ---
    const startBrainstorm = async () => {
        if (!userPrompt.trim()) { toast.error('Enter a research prompt first.'); return; }
        setIsGenerating(true);
        const toastId = toast.loading('Designing your presentation outline...', { icon: '🧠' });
        try {
            const response = await api.post('/ai/slides/outline', {
                content: userPrompt
            });
            
            if (response.data.error) throw new Error(response.data.error);

            const generatedOutline: SlideOutline[] = response.data.outline;
            setOutline(generatedOutline);
            setMode('outline');
            toast.dismiss(toastId);
            toast.success(`Outline ready — ${generatedOutline.length} slides crafted!`, { icon: '✅' });
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(handleApiError(error, 'Something went wrong. Try again.'));
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Step 2: Build slides with rich content ---
    const finalizeGeneration = async () => {
        setIsGenerating(true);
        const toastId = toast.loading('Building slides with AI-crafted content...', { icon: '✨' });
        try {
            const finalSlides: Slide[] = [];
            
            // Generate content for each slide sequentially or in parallel
            // We'll do it sequentially to avoid overwhelming the API rate limits if many slides
            for (let i = 0; i < outline.length; i++) {
                const o = outline[i];
                const contentResponse = await api.post('/ai/slides/content', {
                    prompt: `${o.title}: ${o.description}`,
                    content: userPrompt,
                    options: { template: o.suggestedTemplate }
                });

                if (contentResponse.data.error) throw new Error(contentResponse.data.error);

                finalSlides.push({
                    id: 's-' + o.id,
                    title: o.title,
                    content: contentResponse.data.content,
                    template: o.suggestedTemplate,
                    chartData: contentResponse.data.chartData,
                });
            }

            setSlides(finalSlides);
            setMode('editor');
            toast.dismiss(toastId);
            toast.success(`Your presentation is ready! 🎉 ${finalSlides.length} AI-crafted slides generated.`, { duration: 4000 });
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(handleApiError(error, 'Failed to build slides.'));
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Editor Logic ---

    const updateCurrentSlide = (field: keyof Slide, value: any) => {
        const newS = [...slides];
        newS[activeSlide] = { ...newS[activeSlide], [field]: value };
        setSlides(newS);
    };

    const handleNeuralCommand = async () => {
        if (!neuralCommand.trim()) return;
        const cmd = neuralCommand.toLowerCase();
        const toastId = toast.loading('Neural agent processing...');
        try {
            if (cmd.includes('chart') || cmd.includes('graph')) {
                updateCurrentSlide('template', 'chart');
                if (!slides[activeSlide].chartData) {
                    updateCurrentSlide('chartData', { labels: ['Phase 1','Phase 2','Phase 3','Phase 4'], datasets: [{ label: 'Performance', data: [55,72,84,96], backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 10 }] });
                }
                toast.success('Chart layout applied 📊');
            } else if (cmd.includes('quote')) {
                updateCurrentSlide('template', 'quote');
                toast.success('Quote layout applied 💬');
            } else if (cmd.includes('timeline')) {
                updateCurrentSlide('template', 'timeline');
                toast.success('Timeline layout applied ⏱️');
            } else if (cmd.includes('title')) {
                updateCurrentSlide('template', 'title');
                toast.success('Title layout applied 🎯');
            } else if (cmd.includes('dark') || cmd.includes('obsidian')) {
                setActiveTheme(THEMES[0]);
                toast.success('Obsidian theme applied 🌑');
            } else if (cmd.includes('ocean') || cmd.includes('blue')) {
                setActiveTheme(THEMES[1]);
                toast.success('Ocean theme applied 🌊');
            } else if (cmd.includes('green') || cmd.includes('emerald')) {
                setActiveTheme(THEMES[2]);
                toast.success('Emerald theme applied 💚');
            } else if (cmd.includes('light') || cmd.includes('minimal')) {
                setActiveTheme(THEMES[5]);
                toast.success('Light theme applied ☀️');
            } else if (cmd.includes('add slide') || cmd.includes('new slide')) {
                const newSlide: Slide = { id: `s-new-${Date.now()}`, title: 'New Slide', content: neuralCommand.replace(/add slide|new slide/gi,'').trim() || 'Add your content here.', template: 'content' };
                setSlides(prev => [...prev, newSlide]);
                setActiveSlide(slides.length);
                toast.success('New slide added! ✨');
            } else {
                // General AI processing
                const response = await api.post('/ai/generate', {
                    prompt: `Task: ${neuralCommand}\nApply this change to the slide content or visual layout. Keep it professional and concise. Use bullet points if appropriate.`,
                    content: `Context: Presentation about ${userPrompt}. Current Slide Title: ${slides[activeSlide].title}. Current Content: ${slides[activeSlide].content}`
                });

                if (response.data.error) throw new Error(response.data.error);
                updateCurrentSlide('content', response.data.content);
                toast.success('Slide updated by Neural Agent ✨');
            }
        } catch (error) {
            toast.error(handleApiError(error, 'Neural loop failed'));
        } finally {
            toast.dismiss(toastId);
            setNeuralCommand('');
        }
    };


    const startPresentation = () => {
        setIsPlaying(true);
        const el = document.getElementById('slide-presentation-container');
        if (el) el.requestFullscreen().catch(() => {});
    };

    const exitPresentation = () => {
        setIsPlaying(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying) return;
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                setActiveSlide(prev => Math.min(slides.length - 1, prev + 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                setActiveSlide(prev => Math.max(0, prev - 1));
            } else if (e.key === 'Escape') {
                exitPresentation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, slides.length]);

    // --- Renderers ---

    const renderSlideContent = (slide: Slide, isThumbnail = false, isEditing = false) => {
        const baseClass = isThumbnail ? 'p-2' : 'p-20 w-full h-full max-w-6xl mx-auto flex flex-col justify-center';
        const titleSize = isThumbnail ? 'text-[8px] mb-0.5' : 'text-6xl md:text-8xl mb-8';
        const contentSize = isThumbnail ? 'text-[6px]' : 'text-2xl md:text-3xl font-medium';
        
        const titleColor = activeTheme.isLight ? 'text-slate-900' : 'text-white';
        const contentColor = activeTheme.isLight ? 'text-slate-500' : 'text-white/60';

        const titleEl = isEditing ? (
            <input 
                value={slide.title} 
                onChange={e => updateCurrentSlide('title', e.target.value)}
                className={`bg-transparent font-[900] outline-none placeholder:opacity-20 ${titleColor} ${titleSize} w-full tracking-tighter ${slide.template === 'title' || slide.template === 'quote' ? 'text-center' : 'text-left'}`}
                placeholder="Slide Header"
            />
        ) : (
            <h1 className={`font-[900] tracking-tighter leading-[0.9] ${titleColor} ${titleSize} ${slide.template === 'title' || slide.template === 'quote' ? 'text-center' : 'text-left'}`}>
                {slide.title}
            </h1>
        );

        const contentEl = isEditing ? (
            <textarea
                value={slide.content}
                onChange={e => updateCurrentSlide('content', e.target.value)}
                className={`bg-transparent font-medium resize-none outline-none placeholder:opacity-20 ${contentColor} ${contentSize} w-full flex-1 leading-relaxed ${slide.template === 'quote' ? 'text-center italic font-serif' : 'text-left'}`}
                placeholder={slide.template === 'quote' ? "Enter attribution..." : "Describe the neural structure..."}
            />
        ) : (
            <div className={`font-medium whitespace-pre-wrap leading-relaxed ${contentColor} ${contentSize} ${slide.template === 'quote' ? 'text-center italic font-serif' : 'text-left'}`}>
                {slide.content}
            </div>
        );

        switch (slide.template) {
            case 'timeline':
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${baseClass}`}>
                        {titleEl}
                        <div className="flex-1 flex items-center gap-4 py-12">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex-1 flex flex-col gap-4">
                                    <div className={`h-2 rounded-full ${i === 1 ? activeTheme.accent : 'bg-white/10'}`}></div>
                                    <div className={`p-6 rounded-3xl ${activeTheme.isLight ? 'bg-slate-50' : 'bg-white/5'} border border-white/5`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Phase 0{i}</p>
                                        <div className={`font-bold ${isThumbnail ? 'text-[4px]' : 'text-lg text-white'}`}>Strategic Node {i}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'chart':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`${baseClass} items-start justify-start flex-col h-full`}>
                        {titleEl}
                        <div className={`w-full flex-1 rounded-[32px] ${activeTheme.isLight ? 'bg-white' : 'bg-white/5 shadow-inner'} p-8 flex items-center justify-center my-8 relative`}>
                            {isThumbnail ? (
                                <BarChart3 className="w-8 h-8 opacity-20" />
                            ) : (
                                <Bar 
                                    data={slide.chartData || { labels: [], datasets: [] }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: true, labels: { color: activeTheme.isLight ? '#334155' : '#ffffff', font: { family: 'Inter', weight: 'bold' } } },
                                        },
                                        scales: {
                                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: activeTheme.isLight ? '#64748b' : '#94a3b8' } },
                                            x: { grid: { display: false }, ticks: { color: activeTheme.isLight ? '#64748b' : '#94a3b8' } }
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="w-full text-left opacity-60">
                            {contentEl}
                        </div>
                    </motion.div>
                );
            case 'title':
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${baseClass} items-center justify-center`}>
                        {titleEl}
                        <motion.div 
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            className={`w-32 h-2.5 ${activeTheme.accent} rounded-full my-10 mx-auto shadow-lg shadow-blue-500/20`}
                        ></motion.div>
                        {contentEl}
                    </motion.div>
                );
            case 'quote':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${baseClass} items-center justify-center relative`}>
                        <Quote className={`absolute ${isThumbnail ? 'w-4 h-4 opacity-5 top-0 left-0' : 'w-40 h-40 opacity-5 top-10 left-10'} ${activeTheme.isLight ? 'text-blue-500' : 'text-white'}`} />
                        <div className={`font-serif italic ${titleColor} ${isThumbnail ? 'text-[10px]' : 'text-4xl md:text-6xl'} text-center mb-12 relative z-10 font-medium`}>
                             "{isEditing ? (
                                <input value={slide.title} onChange={e => updateCurrentSlide('title', e.target.value)} className="bg-transparent text-center outline-none w-full" />
                             ) : slide.title}"
                        </div>
                        {contentEl}
                    </motion.div>
                );
            case 'content':
            default:
                return (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`${baseClass} items-start justify-start`}>
                        {titleEl}
                        <div className={`w-20 h-2 bg-gradient-to-r ${activeTheme.accent} to-transparent rounded-full mb-12 shadow-lg shadow-blue-500/20`}></div>
                        {contentEl}
                    </motion.div>
                );
        }
    };

    // --- Workflow Views ---

    if (mode === 'prompt') {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden bg-white rounded-[48px] border border-slate-100 shadow-2xl">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/[0.03] rounded-full blur-[120px] -mr-[400px] -mt-[400px]"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/[0.03] rounded-full blur-[120px] -ml-[400px] -mb-[400px]"></div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 relative z-10">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-[28px] flex items-center justify-center shadow-2xl rotate-3">
                            <Presentation className="text-blue-500" size={32} />
                        </div>
                        <div className="w-14 h-14 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl -rotate-6 -ml-4 border border-white/10">
                            <Sparkles className="text-white" size={26} />
                        </div>
                    </div>
                    <h1 className="text-7xl font-[900] text-slate-900 tracking-tighter mb-4 italic leading-none">
                        Co-Create <span className="text-blue-600 flex flex-col">Intelligence</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[11px] max-w-lg mx-auto leading-relaxed">
                        Input a topic or upload your research. The AI will architect a structured narrative blueprint.
                    </p>
                </motion.div>

                <div className="w-full max-w-3xl space-y-8 relative z-10">
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-[40px] shadow-2xl focus-within:ring-4 ring-blue-500/5 transition-all">
                        <textarea 
                            rows={3}
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder="What are we building today? (e.g., 'Modern architecture in the 22nd century' or 'Quantum cryptography basics')"
                            className="w-full bg-transparent border-none outline-none p-10 font-bold text-xl text-slate-800 placeholder:text-slate-300 resize-none"
                        ></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={startBrainstorm}
                            disabled={isGenerating}
                            className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                        >
                            {isGenerating ? 'Synthesizing Blueprint...' : (
                                <>
                                    Generate Outline <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                        <button className="px-12 py-6 bg-white border border-slate-100 text-slate-400 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4">
                            <FileText size={18} /> Import Note
                        </button>
                    </div>

                    <div className="flex justify-center gap-6 pt-10">
                        {['Strategic Pitch', 'Educational Guide', 'Concept Design', 'Project Brief'].map(tag => (
                            <button key={tag} onClick={() => setUserPrompt(tag)} className="text-[10px] font-black uppercase text-slate-300 tracking-widest hover:text-blue-500 transition-colors">
                                #{tag.replace(' ', '')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'outline') {
        return (
            <div className="h-[calc(100vh-140px)] flex bg-slate-50 rounded-[48px] overflow-hidden animate-fade-in border border-slate-100 shadow-2xl p-12">
                <div className="flex-1 max-w-5xl mx-auto flex flex-col">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Step 2 of 3</span>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Outline</h2>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-2">Review <span className="text-blue-600">Trajectory</span></h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Edit the neural path before data synthesis.</p>
                        </div>
                        <button 
                            onClick={finalizeGeneration}
                            disabled={isGenerating}
                            className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center gap-4"
                        >
                            {isGenerating ? 'Creating Slides...' : 'Synthesize Design'} <Zap size={16} className="text-yellow-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-6 space-y-6 custom-scrollbar pb-20">
                        {outline.map((item, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={item.id} 
                                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex gap-8 items-start relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center text-xl font-black text-slate-300">
                                    0{i + 1}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input 
                                        className="w-full bg-transparent text-2xl font-black text-slate-800 outline-none border-b-2 border-transparent focus:border-blue-500 transition-all placeholder:text-slate-200"
                                        value={item.title}
                                        onChange={(e) => {
                                            const newO = [...outline];
                                            newO[i].title = e.target.value;
                                            setOutline(newO);
                                        }}
                                        placeholder="Slide Concept"
                                    />
                                    <textarea 
                                        className="w-full bg-transparent text-sm font-medium text-slate-400 outline-none resize-none"
                                        rows={2}
                                        value={item.description}
                                        onChange={(e) => {
                                            const newO = [...outline];
                                            newO[i].description = e.target.value;
                                            setOutline(newO);
                                        }}
                                        placeholder="Strategic Intent"
                                    ></textarea>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                        <Plus size={20} />
                                    </button>
                                    <button className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#F8FAFC] animate-fade-in -mx-4 -my-8 p-6 font-sans">
            {/* Sidebar Thumbnail List */}
            <div className="w-80 bg-white border border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto rounded-[40px] shadow-sm z-10 backdrop-blur-3xl">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                             <Presentation size={18} className="text-white" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Project Nodes</h3>
                    </div>
                </div>

                <div className="space-y-4 px-2 pb-24">
                    {slides.map((s, i) => (
                        <motion.div 
                            layout key={s.id} onClick={() => setActiveSlide(i)}
                            className={`aspect-video rounded-[28px] cursor-pointer transition-all flex flex-col group relative overflow-hidden ${activeTheme.id === 'light' ? 'bg-slate-100' : activeTheme.style} ${activeSlide === i ? 'ring-4 ring-blue-500 scale-[1.05] shadow-2xl z-10' : 'hover:scale-[1.02] opacity-80 border border-slate-200'}`}
                        >
                            <div className="absolute top-2 left-3 text-[9px] font-black opacity-40 z-20">NODE_{i + 1}</div>
                            {renderSlideContent(s, true, false)}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Editor Canvas */}
            <div className="flex-1 p-8 flex flex-col relative">
                {/* Editor Toolbar */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-[36px] p-4 shadow-xl mb-10 flex justify-between items-center border border-white relative z-20 mx-auto w-full max-w-6xl ring-1 ring-slate-200/50">
                    <div className="flex items-center gap-3 px-2">
                        <div className="text-slate-400 p-2"><Palette size={20} /></div>
                        <div className="flex gap-2.5">
                            {THEMES.map(theme => (
                                <button 
                                    key={theme.id} 
                                    onClick={() => setActiveTheme(theme)} 
                                    className={`w-9 h-9 rounded-full flex-shrink-0 ${theme.style} transition-all relative ${activeTheme.id === theme.id ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110 border border-slate-200'}`} 
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={startPresentation} className="flex items-center gap-3 px-10 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all hover:scale-[1.02] shadow-xl group">
                            <Maximize2 size={16} /> Launch Experience
                        </button>
                    </div>
                </div>

                {/* The Slide Viewport */}
                <div id="slide-presentation-container" className={`flex-1 flex items-center justify-center transition-all duration-700 relative group/viewport ${isPlaying ? 'bg-black' : ''}`}>
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={`${isPlaying ? 'full' : 'edit'}-${activeSlide}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className={`w-full ${isPlaying ? 'h-full' : 'aspect-video max-w-6xl rounded-[48px]'} ${activeTheme.style} p-20 flex flex-col relative group shadow-2xl border-8 border-white/50 transition-all`}
                        >
                            {isPlaying && (
                                <div className="absolute top-10 right-10 z-[60]">
                                    <button onClick={exitPresentation} className="p-5 bg-black/40 rounded-3xl hover:bg-rose-500 text-white border border-white/10"><X size={28}/></button>
                                </div>
                            )}

                            {renderSlideContent(slides[activeSlide], false, !isPlaying)}
                            
                            {!isPlaying && (
                                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all z-20">
                                    <div className="flex gap-2 p-1.5 bg-black/10 backdrop-blur-xl rounded-[20px] border border-white/10">
                                        {(['title', 'content', 'quote', 'chart', 'timeline'] as SlideTemplate[]).map(t => (
                                            <button 
                                                key={t} onClick={() => updateCurrentSlide('template', t)} 
                                                className={`p-3 rounded-xl ${slides[activeSlide].template === t ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/50'} transition-all`}
                                            >
                                                {t === 'title' ? <Layout size={18}/> : t === 'content' ? <AlignLeft size={18}/> : t === 'quote' ? <Quote size={18}/> : t === 'chart' ? <BarChart3 size={18}/> : <ListOrdered size={18}/>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em]">Node_{activeSlide + 1}</div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Neural Refinement Agent (Bottom integrated) */}
                <div className="max-w-4xl mx-auto w-full mt-12 relative z-20">
                    <div className="bg-white/90 backdrop-blur-2xl p-4 rounded-[40px] shadow-2xl border border-white flex gap-6 items-center ring-1 ring-slate-200">
                        <div className="w-14 h-14 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-blue-200 flex-shrink-0 animate-pulse">
                            <Wand2 size={24} />
                        </div>
                        <div className="flex-1 relative">
                            <input 
                                value={neuralCommand}
                                onChange={(e) => setNeuralCommand(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleNeuralCommand()}
                                placeholder="Refine with Neural Agent... (e.g., 'Make this a chart' or 'Apply Obsidian theme')"
                                className="w-full bg-slate-50 border-none outline-none py-4 px-8 rounded-3xl font-bold text-sm text-slate-800"
                            />
                            <button 
                                onClick={handleNeuralCommand}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideMaker;
