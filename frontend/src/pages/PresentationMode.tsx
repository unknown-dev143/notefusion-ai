import React, { useState, useEffect } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Maximize, X, Play, Settings, Download } from 'lucide-react';
import { useNotes } from '../features/notes/context/NoteContext';
import toast from 'react-hot-toast';

interface Slide {
  id: string;
  content: string;
  title?: string;
}

const PresentationMode: React.FC = () => {
  const { notes } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'gradient'>('gradient');

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        parseSlides(note.content, note.title);
      }
    }
  }, [selectedNoteId, notes]);

  const parseSlides = (content: string, title: string) => {
    // Split by horizontal rule '---' or headers
    // For this implementation, we'll split by '---' as explicit slide separator
    // If no '---', we'll split by Header 1 or 2
    let rawSlides = content.split('---');
    
    if (rawSlides.length === 1) {
       // Fallback: split by H1 or H2
       rawSlides = content.split(/(?=^#{1,2}\s)/m);
    }

    const parsedSlides: Slide[] = rawSlides
      .map((slideContent, index) => ({
        id: `slide-${index}`,
        content: slideContent.trim(),
        title: index === 0 ? title : undefined
      }))
      .filter(s => s.content.length > 0);

      // Ensure title slide matches note title if first slide doesn't have H1
      if (parsedSlides.length > 0 && !parsedSlides[0].content.startsWith('# ')) {
         parsedSlides[0].content = `# ${title}\n\n${parsedSlides[0].content}`;
      }

    setSlides(parsedSlides);
    setCurrentSlideIndex(0);
  };

  const startPresentation = () => {
    if (slides.length === 0) {
      toast.error('No content to present');
      return;
    }
    setIsPlaying(true);
    // Enter fullscreen
    document.documentElement.requestFullscreen().catch((e) => {
       console.log("Fullscreen request denied", e);
    });
  };

  const exitPresentation = () => {
    setIsPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') exitPresentation();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') exitPresentation();
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPlaying]);

  return (
    <div className={`max-w-7xl mx-auto px-6 py-10 animate-slide-up ${isPlaying ? 'fixed inset-0 z-50 bg-black max-w-none px-0 py-0' : ''}`}>
      
      {!isPlaying ? (
        <>
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-[24px] flex items-center justify-center shadow-xl">
                <Presentation size={32} className="text-white"/>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 leading-none">Presentation Mode</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Turn your notes into beautiful slide decks instantly</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Note Selector */}
            <div className="bg-white border border-slate-100 rounded-[48px] p-8 shadow-lg h-[600px] flex flex-col">
              <h2 className="text-xl font-black text-slate-900 mb-6">Select Note to Present</h2>
              <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`w-full p-4 rounded-2xl text-left transition-all group ${
                      selectedNoteId === note.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm mb-1">{note.title}</p>
                        <p className={`text-xs font-medium ${selectedNoteId === note.id ? 'text-orange-100' : 'text-slate-400'}`}>
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedNoteId === note.id && <Play size={20} fill="currentColor" />}
                    </div>
                  </button>
                ))}
                {notes.length === 0 && (
                   <p className="text-center text-slate-400 py-10">No notes found. Create a note first!</p>
                )}
              </div>
            </div>

            {/* Preview & Settings */}
            <div className="flex flex-col gap-6">
               <div className="bg-white border border-slate-100 rounded-[48px] p-8 shadow-lg flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                  {selectedNoteId ? (
                     <>
                        <div 
                           className={`w-full aspect-video rounded-xl shadow-2xl flex items-center justify-center p-8 text-center transition-all transform hover:scale-[1.02] cursor-pointer
                           ${theme === 'dark' ? 'bg-slate-900 text-white' : theme === 'gradient' ? 'bg-gradient-to-br from-indigo-900 to-purple-800 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
                           onClick={startPresentation}
                        >
                           <div>
                              <h1 className="text-2xl font-black mb-4 line-clamp-2">
                                 {slides[0]?.content.split('\n')[0].replace(/#/g, '') || 'Slide Title'}
                              </h1>
                              <p className="text-sm opacity-80 line-clamp-3">
                                 {slides[0]?.content.split('\n').slice(1).join(' ') || 'Slide content preview...'}
                              </p>
                           </div>
                        </div>
                        <p className="mt-6 text-sm text-slate-500 font-medium">
                           {slides.length} Slides Generated
                        </p>
                        <button
                           onClick={startPresentation}
                           className="mt-4 px-12 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                           <Play size={24} fill="currentColor"/>
                           Start Presentation
                        </button>
                     </>
                  ) : (
                     <div className="text-center opacity-50">
                        <Presentation size={64} className="mx-auto mb-4 text-slate-300"/>
                        <p className="text-slate-400 font-bold">Select a note to preview</p>
                     </div>
                  )}
               </div>

               {/* Theme Selector */}
               <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg">
                  <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                     <Settings size={16}/> Presentation Theme
                  </h3>
                  <div className="flex gap-3">
                     {[
                        { id: 'light', name: 'Clean Light', bg: 'bg-white border border-slate-200' },
                        { id: 'dark', name: 'Focus Dark', bg: 'bg-slate-900 text-white' },
                        { id: 'gradient', name: 'Deep Space', bg: 'bg-gradient-to-br from-indigo-900 to-purple-800 text-white' }
                     ].map(t => (
                        <button
                           key={t.id}
                           onClick={() => setTheme(t.id as any)}
                           className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${
                              theme === t.id ? 'ring-2 ring-orange-500 ring-offset-2' : 'hover:opacity-80'
                           } ${t.bg}`}
                        >
                           {t.name}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </>
      ) : (
        /* Fullscreen Player */
        <div 
           className={`w-full h-full flex flex-col justify-center items-center relative
           ${theme === 'dark' ? 'bg-slate-900 text-white' : theme === 'gradient' ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white' : 'bg-white text-slate-900'}`}
        >
           {/* Controls Overlay */}
           <div className="absolute top-6 right-6 flex gap-4 opacity-0 hover:opacity-100 transition-opacity">
              <button 
                 onClick={exitPresentation}
                 className="p-3 bg-black/20 backdrop-blur rounded-full hover:bg-black/40 text-white"
              >
                 <X size={24}/>
              </button>
           </div>

           {/* Slide Content */}
           <div className="max-w-5xl w-full p-12 text-center animate-fade-in">
              <div className="prose prose-xl md:prose-2xl max-w-none dark:prose-invert">
                 {/* Simple formatting for demo - in production use ReactMarkdown */}
                 <h1 className="text-5xl md:text-7xl font-black mb-12 leading-tight">
                    {slides[currentSlideIndex]?.content.split('\n')[0].replace(/#/g, '')}
                 </h1>
                 <div className="text-2xl md:text-3xl font-medium leading-relaxed opacity-90 whitespace-pre-wrap">
                    {slides[currentSlideIndex]?.content.split('\n').slice(1).join('\n').trim()}
                 </div>
              </div>
           </div>

           {/* Navigation */}
           <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
              <button 
                 onClick={prevSlide}
                 disabled={currentSlideIndex === 0}
                 className="p-4 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all text-white"
              >
                 <ChevronLeft size={48}/>
              </button>
              <div className="text-sm font-bold opacity-50 text-white">
                 {currentSlideIndex + 1} / {slides.length}
              </div>
              <button 
                 onClick={nextSlide}
                 disabled={currentSlideIndex === slides.length - 1}
                 className="p-4 rounded-full hover:bg-white/10 disabled:opacity-30 transition-all text-white"
              >
                 <ChevronRight size={48}/>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PresentationMode;
