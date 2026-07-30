import React from 'react';
import { X, Command, Zap } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['⌘', 'K'], description: 'Open Command Palette' },
        { keys: ['⌘', '/'], description: 'Quick Search' },
        { keys: ['⌘', 'N'], description: 'New Note' },
        { keys: ['⌘', 'G'], description: 'Open Graph View' },
        { keys: ['⌘', 'T'], description: 'Open Tasks' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['⌘', 'S'], description: 'Save Current Item' },
        { keys: ['⌘', 'Shift', 'S'], description: 'Take Screenshot' },
        { keys: ['⌘', 'Shift', 'R'], description: 'Record Screen' },
        { keys: ['⌘', 'E'], description: 'Export Notes' },
      ]
    },
    {
      category: 'Editor',
      items: [
        { keys: ['⌘', 'B'], description: 'Bold Text' },
        { keys: ['⌘', 'I'], description: 'Italic Text' },
        { keys: ['⌘', 'U'], description: 'Underline Text' },
        { keys: ['⌘', 'Z'], description: 'Undo' },
        { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
      ]
    },
    {
      category: 'General',
      items: [
        { keys: ['ESC'], description: 'Close Modal/Dialog' },
        { keys: ['?'], description: 'Show Keyboard Shortcuts' },
        { keys: ['⌘', ','], description: 'Open Settings' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-8 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-[48px] p-12 max-w-4xl w-full shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl">
                <Command size={24} className="text-white"/>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Keyboard Shortcuts</h2>
                <p className="text-sm text-slate-400 font-medium">Master NoteFusion AI like a pro</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all group"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600"/>
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={14}/>
                {section.category}
              </h3>
              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                  >
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, kidx) => (
                        <React.Fragment key={kidx}>
                          <kbd className="px-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-xs font-black text-slate-700 shadow-sm min-w-[40px] text-center">
                            {key}
                          </kbd>
                          {kidx < item.keys.length - 1 && (
                            <span className="text-slate-400 font-black text-xs mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tip */}
        <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[32px]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <p className="text-sm font-black text-blue-900 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                On Windows, use <kbd className="px-2 py-1 bg-white rounded text-[10px] font-black mx-1">Ctrl</kbd> instead of <kbd className="px-2 py-1 bg-white rounded text-[10px] font-black mx-1">⌘</kbd>. 
                Press <kbd className="px-2 py-1 bg-white rounded text-[10px] font-black mx-1">?</kbd> anytime to see this guide.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
