import React, { useState, useEffect } from 'react';
import { useNotes } from '../features/notes/context/NoteContext';
import { Link2, Copy, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlockReference {
  id: string;
  noteId: string;
  noteTitle: string;
  blockId: string;
  content: string;
  lineNumber: number;
}

const BlockReferences: React.FC = () => {
  const { notes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockReference[]>([]);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNote) {
      const note = notes.find(n => n.id === selectedNote);
      if (note) {
        extractBlocks(note);
      }
    }
  }, [selectedNote, notes]);

  const extractBlocks = (note: any) => {
    const lines = note.content.split('\n');
    const extractedBlocks: BlockReference[] = [];
    
    lines.forEach((line: string, index: number) => {
      // Extract paragraphs, headings, and list items as blocks
      if (line.trim() && !line.startsWith('---')) {
        const blockId = `${note.id}-block-${index}`;
        extractedBlocks.push({
          id: blockId,
          noteId: note.id,
          noteTitle: note.title,
          blockId: blockId,
          content: line,
          lineNumber: index + 1
        });
      }
    });

    setBlocks(extractedBlocks);
  };

  const copyBlockReference = (blockId: string) => {
    const reference = `[[${blockId}]]`;
    navigator.clipboard.writeText(reference);
    setCopiedBlockId(blockId);
    toast.success('Block reference copied!');
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  const getBlockType = (content: string) => {
    if (content.startsWith('#')) return { type: 'heading', icon: '📌', color: 'blue' };
    if (content.startsWith('-') || content.startsWith('*')) return { type: 'list', icon: '📝', color: 'emerald' };
    if (content.startsWith('>')) return { type: 'quote', icon: '💬', color: 'purple' };
    if (content.startsWith('```')) return { type: 'code', icon: '💻', color: 'slate' };
    return { type: 'paragraph', icon: '📄', color: 'amber' };
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-[24px] flex items-center justify-center shadow-xl">
            <Link2 size={32} className="text-white"/>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 leading-none">Block References</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Reference specific paragraphs across notes</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Note Selector */}
        <div className="bg-white border border-slate-100 rounded-[48px] p-8 shadow-lg">
          <h2 className="text-xl font-black text-slate-900 mb-6">Select Note</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  selectedNote === note.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-sm mb-1">{note.title}</p>
                    <p className={`text-xs font-medium ${selectedNote === note.id ? 'text-purple-100' : 'text-slate-400'}`}>
                      {note.content.split('\n').length} blocks
                    </p>
                  </div>
                  {selectedNote === note.id && (
                    <ArrowRight size={20}/>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Blocks List */}
        <div className="bg-white border border-slate-100 rounded-[48px] p-8 shadow-lg">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            {selectedNote ? 'Available Blocks' : 'Select a note to view blocks'}
          </h2>
          
          {blocks.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {blocks.map((block) => {
                const { type, icon, color } = getBlockType(block.content);
                return (
                  <div
                    key={block.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-purple-500 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 bg-${color}-100 text-${color}-700 rounded text-[10px] font-black uppercase tracking-wider`}>
                            {type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Line {block.lineNumber}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                          {block.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 truncate">
                        [[{block.blockId}]]
                      </code>
                      <button
                        onClick={() => copyBlockReference(block.blockId)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-xs font-black"
                      >
                        {copiedBlockId === block.blockId ? (
                          <>
                            <Check size={14}/>
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14}/>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 size={32} className="text-slate-400"/>
              </div>
              <p className="text-slate-600 font-medium">
                {selectedNote ? 'No blocks found in this note' : 'Select a note to see its blocks'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How to Use */}
      <div className="mt-8 p-8 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-[48px]">
        <h3 className="text-lg font-black text-purple-900 mb-4">How to Use Block References</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-black text-purple-800 mb-2">1. Select a Note</p>
            <p className="text-xs text-purple-700 font-medium">
              Choose the note containing the paragraph you want to reference
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-purple-800 mb-2">2. Find the Block</p>
            <p className="text-xs text-purple-700 font-medium">
              Locate the specific paragraph, heading, or list item
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-purple-800 mb-2">3. Copy Reference</p>
            <p className="text-xs text-purple-700 font-medium">
              Click "Copy" to get the block reference syntax: [[block-id]]
            </p>
          </div>
          <div>
            <p className="text-sm font-black text-purple-800 mb-2">4. Paste Anywhere</p>
            <p className="text-xs text-purple-700 font-medium">
              Paste the reference in any note to link to that specific block
            </p>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[48px] shadow-lg">
        <h3 className="text-lg font-black text-slate-900 mb-6">Example Usage</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">In Your Note</p>
            <code className="block p-4 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-700">
              See the definition in [[note-123-block-45]]
            </code>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Renders As</p>
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">
                See the definition in <span className="text-blue-600 underline cursor-pointer">→ Referenced Block</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockReferences;
