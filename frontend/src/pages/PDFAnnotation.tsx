import React, { useState, useRef } from 'react';
import { FileText, Upload, Highlighter, MessageSquare, Save, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotes } from '../features/notes/context/NoteContext';
import toast from 'react-hot-toast';

const PDFAnnotation: React.FC = () => {
  const { createNote } = useNotes();
  const [file, setFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // Simulated total pages
  const [scale, setScale] = useState(1);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'cursor' | 'highlight' | 'comment'>('cursor');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      toast.success('PDF uploaded successfully!');
      // In production, you would load the PDF using pdf.js here
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const toggleHighlight = () => {
    setSelectedTool(selectedTool === 'highlight' ? 'cursor' : 'highlight');
    setIsHighlighting(!isHighlighting);
    toast(selectedTool === 'highlight' ? 'Highlight mode off' : 'Highlight mode active');
  };

  const addComment = () => {
    setSelectedTool('comment');
    const newComment = {
      id: Date.now(),
      page: currentPage,
      text: 'New comment',
      x: 50, // Simulated position
      y: 50,
    };
    setAnnotations([...annotations, newComment]);
    toast.success('Comment added');
  };

  const saveAnnotations = async () => {
      if (!file) return;
      try {
          const content = `**Research Paper**: ${file.name}\n**Date**: ${new Date().toLocaleDateString()}\n\n## Annotations\n` + 
              annotations.map(a => `- [Page ${a.page}] *${a.text}*`).join('\n') +
              `\n\n---\n*Extracted via NoteFusion PDF Engine*`;

          await createNote({
              title: `Analysis: ${file.name}`,
              content: content,
              tags: ['pdf', 'research', 'annotation'],
              isPinned: false,
              isArchived: false,
              color: '#fff1f2'
          } as any);
          toast.success('Annotations synced to Knowledge Base!');
      } catch (err) {
          toast.error('Failed to sync annotations');
          console.error(err);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <FileText size={24} className="text-red-600"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-none">PDF Annotation</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Read, highlight, and annotate research papers</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomOut size={18}/>
            </button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomIn size={18}/>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[32px] shadow-xl overflow-hidden flex">
        {file ? (
          <>
            {/* Toolbar */}
            <div className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-6 gap-4">
              <button 
                onClick={() => setSelectedTool('cursor')}
                className={`p-3 rounded-xl transition-all ${selectedTool === 'cursor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                title="Select"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                </svg>
              </button>
              <button 
                onClick={toggleHighlight}
                className={`p-3 rounded-xl transition-all ${selectedTool === 'highlight' ? 'bg-yellow-400 text-yellow-900 shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                title="Highlight"
              >
                <Highlighter size={20}/>
              </button>
              <button 
                onClick={addComment}
                className={`p-3 rounded-xl transition-all ${selectedTool === 'comment' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                title="Comment"
              >
                <MessageSquare size={20}/>
              </button>
              <div className="h-px w-8 bg-slate-200 my-2"></div>
              <button 
                onClick={saveAnnotations}
                className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                title="Save"
              >
                <Save size={20}/>
              </button>
              <button 
                 className="p-3 text-slate-500 hover:bg-slate-200 rounded-xl"
                 title="Download Annotated PDF"
              >
                <Download size={20}/>
              </button>
            </div>

            {/* PDF Viewer Area (Simulated) */}
            <div className="flex-1 bg-slate-100 p-8 overflow-auto flex justify-center relative">
              <div 
                className="bg-white shadow-2xl transition-transform origin-top"
                style={{ 
                  width: `${600 * scale}px`, 
                  height: `${850 * scale}px`,
                  transform: `scale(${scale})` // Assuming simple scaling for specific view, simplistic approach
                }}
              >
                {/* Simulated PDF Content */}
                <div className="p-12 prose max-w-none">
                  <h2 className="text-3xl font-bold mb-4">Research Paper Title: {file.name}</h2>
                  <p className="text-justify mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    <span className="bg-yellow-200">This is a simulated highlight on the text. In a real implementation, pdf.js text layers would be used here.</span>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                  <p className="text-justify mb-4">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                  </p>
                  
                  {/* Simulated Annotations */}
                  {annotations.filter(a => a.page === currentPage).map(ann => (
                    <div 
                      key={ann.id}
                      className="absolute bg-purple-100 border border-purple-300 p-2 rounded shadow-lg text-xs w-32"
                      style={{ top: `${ann.y}px`, left: `${ann.x}px` }}
                    >
                      <p className="font-bold text-purple-800">Comment</p>
                      {ann.text}
                    </div>
                  ))}
                  
                </div>
              </div>
              
              {/* Pagination Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-4 shadow-xl">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="hover:text-blue-400 disabled:opacity-50"
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className="font-mono text-sm">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="hover:text-blue-400 disabled:opacity-50"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-slate-300 rounded-[48px] p-20 cursor-pointer hover:border-red-400 hover:bg-red-50/10 transition-all group"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                <Upload size={40} className="text-red-500"/>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Upload PDF</h2>
              <p className="text-lg text-slate-500 font-medium mb-8">
                Drag and drop your research paper or click to browse
              </p>
              <button className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                Select File
              </button>
            </div>
            <p className="mt-8 text-slate-400 font-medium">Supported formats: .pdf</p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="application/pdf" 
        className="hidden" 
      />
    </div>
  );
};

export default PDFAnnotation;
