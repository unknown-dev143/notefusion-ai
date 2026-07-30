import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Eye, Download, Trash2 } from 'lucide-react';
import { useNotes } from '../features/notes/context/NoteContext';
import toast from 'react-hot-toast';

interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  content: string;
  timestamp: Date;
  changeDescription: string;
  wordCount: number;
}

const VersionHistory: React.FC = () => {
  const { notes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      loadVersions(selectedNote);
    }
  }, [selectedNote]);

  const loadVersions = async (noteId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/notes/${noteId}/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to load versions');
      const data = await response.json();
      const mapped = data.map((v: any) => ({
        id: v.id,
        noteId: v.note_id,
        version: v.version_number,
        content: v.content,
        timestamp: new Date(v.created_at),
        changeDescription: v.change_description,
        wordCount: v.content.split(/\s+/).length
      }));
      setVersions(mapped);
      setSelectedVersion(mapped[0] || null);
    } catch (err) {
      toast.error('Could not load version history');
      setVersions([]);
    }
  };

  const restoreVersion = async (version: NoteVersion) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/notes/${version.noteId}/restore/${version.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Restoration failed');
      toast.success(`Restored to version ${version.version}`);
      // Reload versions to show the new auto-save backup
      loadVersions(version.noteId);
    } catch (err) {
      toast.error('Restoration failed');
    }
  };

  const downloadVersion = (version: NoteVersion) => {
    const blob = new Blob([version.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `version-${version.version}-${Date.now()}.md`;
    a.click();
    toast.success('Version downloaded!');
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[24px] flex items-center justify-center shadow-xl">
            <Clock size={32} className="text-white"/>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 leading-none">Version History</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Track changes and restore previous versions</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Note Selector */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg">
          <h2 className="text-lg font-black text-slate-900 mb-4">Select Note</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                className={`w-full p-3 rounded-xl text-left transition-all text-sm ${
                  selectedNote === note.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-black truncate">{note.title}</p>
                <p className={`text-xs font-medium mt-1 ${selectedNote === note.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  3 versions
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Version Timeline */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg">
          <h2 className="text-lg font-black text-slate-900 mb-4">Version Timeline</h2>
          
          {versions.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  onClick={() => setSelectedVersion(version)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    selectedVersion?.id === version.id
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-emerald-100' : 'bg-indigo-100'
                      }`}>
                        <span className="text-sm font-black">
                          {index === 0 ? '✓' : `v${version.version}`}
                        </span>
                      </div>
                      {index < versions.length - 1 && (
                        <div className="absolute top-10 left-1/2 w-0.5 h-8 bg-slate-200 -translate-x-1/2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {index === 0 ? 'Current' : `Version ${version.version}`}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-1">
                        {version.changeDescription}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {formatTimestamp(version.timestamp)}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {version.wordCount} words
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-slate-400"/>
              </div>
              <p className="text-slate-600 font-medium text-sm">
                Select a note to view its version history
              </p>
            </div>
          )}
        </div>

        {/* Version Preview */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">Preview</h2>
            {selectedVersion && selectedVersion.version !== versions[0]?.version && (
              <div className="flex gap-2">
                <button
                  onClick={() => restoreVersion(selectedVersion)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <RotateCcw size={14}/>
                  Restore
                </button>
              </div>
            )}
          </div>

          {selectedVersion ? (
            <div className="space-y-4">
              {/* Version Info */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Version</p>
                    <p className="font-bold text-slate-900">{selectedVersion.version}</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Words</p>
                    <p className="font-bold text-slate-900">{selectedVersion.wordCount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="font-bold text-slate-900">{selectedVersion.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
                  {selectedVersion.content}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadVersion(selectedVersion)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14}/>
                  Download
                </button>
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={14}/>
                  {showDiff ? 'Hide' : 'Show'} Diff
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye size={28} className="text-slate-400"/>
              </div>
              <p className="text-slate-600 font-medium text-sm">
                Select a version to preview
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[32px]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-2xl">💾</span>
          </div>
          <div>
            <p className="text-sm font-black text-indigo-900 mb-1">Auto-Save Versions</p>
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              NoteFusion AI automatically saves versions of your notes every time you make significant changes. 
              You can restore any previous version or compare changes with the diff view. Versions are kept for 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
