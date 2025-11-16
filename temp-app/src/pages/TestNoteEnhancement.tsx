import { useState, useCallback } from 'react';
import { NoteEnhancementPanel } from '../components/NoteEnhancementPanel';

export const TestNoteEnhancement = () => {
  const [content, setContent] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isLoading] = useState(false);

  const handleEnhance = useCallback((type: string, result: string) => {
    setEnhancedContent(prev => `${prev ? `${prev}\n\n---\n\n` : ''}${type.toUpperCase()}:\n${result}`);
  }, []);

  const handleClear = () => {
    setEnhancedContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Note Enhancement Demo</h1>
          <p className="text-gray-600">
            Paste your notes below and use the enhancement tools to generate summaries, questions, key points, and outlines.
          </p>
        </header>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700">
              Your Notes:
            </label>
            <span className="text-xs text-gray-500">
              {content.length} characters
            </span>
          </div>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="Paste your notes here to enhance them..."
            disabled={isLoading}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <NoteEnhancementPanel
            content={content}
            onEnhance={handleEnhance}
            disabled={isLoading}
          />
        </div>

        {enhancedContent && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Enhanced Content</h2>
              <button
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {enhancedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestNoteEnhancement;
