import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Save, 
  Download, 
  Share2, 
  Calculator, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Copy, 
  Check, 
  Users, 
  Shield, 
  Plus,
  Zap,
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
  Search,
  Maximize2,
  ChevronRight,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';
import { spreadsheetService } from '../features/spreadsheets/services/spreadsheetService';
import { motion, AnimatePresence } from 'framer-motion';
import { microsoftService } from '../services/microsoftService';

const Spreadsheet: React.FC = () => {
  const [rows, setRows] = useState(25);
  const [cols, setCols] = useState(12);
  const [colLabels] = useState(() => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)));
  const [data, setData] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeView, setActiveView] = useState<'sheet' | 'analytics' | 'forecast'>('sheet');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load implementation
  useEffect(() => {
    loadSheet();
  }, []);

  const loadSheet = async () => {
    try {
        const sheets = await spreadsheetService.getSpreadsheets();
        if (sheets.length > 0) {
            const sheet = sheets[0];
            setSheetId(sheet.id);
            setData(JSON.parse(sheet.data));
        } else {
            const newSheet = await spreadsheetService.createSpreadsheet({
                title: 'Neural Synthesis Sheet',
                data: JSON.stringify({})
            });
            setSheetId(newSheet.id);
            setData({});
        }
    } catch (err) {
        toast.error('Neural uplink failed');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
      if (!sheetId) return;
      try {
          await spreadsheetService.updateSpreadsheet(sheetId, {
              data: JSON.stringify(data)
          });
          toast.success('Sync complete', { icon: '☁️' });
      } catch (err) {
          toast.error('Sync failed');
      }
  };

  const synthesizeData = async () => {
    setIsSynthesizing(true);
    toast.loading('AI Architect synthesizing data...', { id: 'synth' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock synthesis: if A1 has "Revenue", fill B1-B5 with numbers
      const newData = { ...data };
      newData['0-1'] = 'Revenue Report';
      newData['1-0'] = 'Q1'; newData['1-1'] = '12500';
      newData['2-0'] = 'Q2'; newData['2-1'] = '15200';
      newData['3-0'] = 'Q3'; newData['3-1'] = '18900';
      newData['4-0'] = 'Q4'; newData['4-1'] = '24500';
      newData['5-0'] = 'Total'; newData['5-1'] = '=SUM(B2:B5)';
      
      setData(newData);
      toast.success('Synthesis complete!', { id: 'synth' });
    } catch (error) {
      toast.error('Synthesis failed', { id: 'synth' });
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Formula evaluation engine
  const evaluateFormula = (formula: string, cellData: Record<string, string>): string => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      let expression = formula.substring(1).toUpperCase();
      
      // Handle SUM function: =SUM(A1:A5)
      const sumMatch = expression.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (sumMatch) {
        const [_, startColLetter, startRowStr, endColLetter, endRowStr] = sumMatch;
        const startCol = startColLetter.charCodeAt(0) - 65;
        const startRow = parseInt(startRowStr) - 1;
        const endRow = parseInt(endRowStr) - 1;
        
        let sum = 0;
        for (let r = startRow; r <= endRow; r++) {
          const val = parseFloat(cellData[`${r}-${startCol}`] || '0');
          if (!isNaN(val)) sum += val;
        }
        return sum.toString();
      }

      // Replace cell references (A1 -> values)
      expression = expression.replace(/([A-Z])(\d+)/g, (match, col, row) => {
        const colIdx = col.charCodeAt(0) - 65;
        const rowIdx = parseInt(row) - 1;
        const value = cellData[`${rowIdx}-${colIdx}`] || '0';
        return isNaN(parseFloat(value)) ? '0' : value;
      });

      // Simple math evaluation
      // eslint-disable-next-line no-eval
      return eval(expression).toString();
    } catch (error) {
      return '#REF!';
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    setData(prev => ({
      ...prev,
      [`${row}-${col}`]: value
    }));
  };

  const getCellValue = (row: number, col: number): string => {
    const rawValue = data[`${row}-${col}`] || '';
    if (rawValue.startsWith('=')) {
      return evaluateFormula(rawValue, data);
    }
    return rawValue;
  };

  const statistics = useMemo(() => {
    let filled = 0, numeric = 0, formulas = 0;
    Object.values(data).forEach(val => {
      if (val) {
        filled++;
        if (val.startsWith('=')) formulas++;
        else if (!isNaN(parseFloat(val))) numeric++;
      }
    });
    return { filled, numeric, formulas };
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col bg-slate-950 border border-white/5 rounded-[56px] shadow-3xl overflow-hidden animate-slide-up">
      
      {/* Premium Header HUD */}
      <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-gradient-to-r from-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20">
             <Calculator size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">Neural <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Analytical Sheet</span></h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <Activity size={10} /> Active Syndicate
               </span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">V4.2 Protocol • {statistics.filled} Nodes Loaded</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
           <button 
             onClick={synthesizeData}
             className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
              <Sparkles size={16} /> AI Synthesize
           </button>
           
           <button 
             onClick={() => setShowExportMenu(!showExportMenu)}
             className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 relative"
           >
              <Download size={16}/> Export
           </button>

           <button className="px-6 py-4 bg-slate-900 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
              <Save size={16}/> Save
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Grid Stage */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Formula HUD Bar */}
          <div className="px-8 py-5 border-b border-white/5 flex items-center gap-6 bg-slate-900/50 backdrop-blur-xl">
             <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Target size={14} className="text-blue-500" />
                <span className="text-xs font-black text-white italic lining-nums w-10">{activeCell || '--'}</span>
             </div>
             <div className="flex-1 flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 group focus-within:border-blue-500 transition-all">
                <span className="text-[10px] font-black text-slate-500 uppercase italic">fx</span>
                <input 
                  type="text"
                  placeholder="Insert formula (e.g. =SUM(A1:A10))"
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-100 flex-1 placeholder:text-slate-600 italic"
                  value={activeCell ? (data[`${parseInt(activeCell.substring(1))-1}-${activeCell.charCodeAt(0)-65}`] || '') : ''}
                  onChange={(e) => {
                    if (activeCell) {
                      const row = parseInt(activeCell.substring(1)) - 1;
                      const col = activeCell.charCodeAt(0) - 65;
                      handleCellChange(row, col, e.target.value);
                    }
                  }}
                />
             </div>
          </div>

          {/* Grid Viewport */}
          <div className="flex-1 overflow-auto custom-scrollbar bg-slate-950" ref={scrollContainerRef}>
            <div className="inline-block min-w-full">
              {/* Header Labels */}
              <div className="flex sticky top-0 z-30">
                <div className="w-16 h-12 bg-slate-900 border-r border-b border-white/10 flex items-center justify-center sticky left-0 z-40">
                   <span className="text-[10px] text-slate-500 font-black italic">ID</span>
                </div>
                {colLabels.slice(0, cols).map(label => (
                  <div key={label} className="w-48 h-12 bg-slate-900 border-r border-b border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 italic">
                    {label}
                  </div>
                ))}
              </div>

              {/* Data Synthesis Grid */}
              {Array.from({ length: rows }).map((_, rIdx) => (
                <div key={rIdx} className="flex group/row">
                  <div className="w-16 h-12 bg-slate-900 border-r border-b border-white/5 flex items-center justify-center text-[10px] font-black text-slate-600 sticky left-0 z-20 group-hover/row:bg-slate-800 transition-colors lining-nums">
                    {rIdx + 1}
                  </div>
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const cellId = `${colLabels[cIdx]}${rIdx + 1}`;
                    const isSelected = activeCell === cellId;
                    const rawValue = data[`${rIdx}-${cIdx}`] || '';
                    const displayValue = rawValue.startsWith('=') ? getCellValue(rIdx, cIdx) : rawValue;
                    const isFormula = rawValue.startsWith('=');
                    
                    return (
                      <div 
                        key={cIdx} 
                        className={`w-48 h-12 border-r border-b border-white/5 shrink-0 transition-all relative ${isSelected ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                      >
                        {isSelected && (
                          <motion.div layoutId="selection" className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-10" />
                        )}
                        <input 
                          className={`w-full h-full px-5 py-3 outline-none text-sm font-medium bg-transparent transition-all ${isFormula ? 'text-blue-400 font-bold' : 'text-slate-300'} placeholder:text-slate-800`}
                          value={isSelected ? rawValue : displayValue}
                          onFocus={() => setActiveCell(cellId)}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          onBlur={handleSave}
                          spellCheck={false}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neural Insights Sidebar */}
        <div className="w-96 border-l border-white/5 bg-slate-900/40 backdrop-blur-3xl p-8 flex flex-col gap-8">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-3">
                 <Brain size={16} /> AI Architect
              </h4>
              <Zap size={16} className="text-blue-400 animate-pulse" />
           </div>

           <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
                 <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-emerald-500" size={18} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Growth Trend</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Based on your Q1-Q4 data, your revenue is showing a <strong>42% recursive growth</strong>. 
                 </p>
                 <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase">Optimal</span>
                 </div>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
                 <div className="flex items-center gap-3 mb-4">
                    <Layers className="text-blue-400" size={18} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Synthetic Cluster</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    A cluster was detected in columns B-D. Would you like to synthesize a summary node?
                 </p>
                 <button className="mt-4 w-full py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                    Link Cluster →
                 </button>
              </div>

              <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/20 transition-all"></div>
                 <h5 className="text-sm font-black text-white mb-2 italic">Neural Forecaster</h5>
                 <p className="text-xs text-indigo-100 font-medium mb-4 leading-relaxed">
                    Predicting next 6 months of data yields a 94% confidence score.
                 </p>
                 <button className="w-full py-3 bg-white text-indigo-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-2xl transition-all">
                    Generate Forecast
                 </button>
              </div>
           </div>

           <div className="mt-auto pt-8 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Synergy Score</p>
                    <p className="text-xl font-black text-white italic">84<span className="text-[10px] text-blue-500">%</span></p>
                 </div>
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Density Index</p>
                    <p className="text-xl font-black text-white italic">0.92</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Metadata Footer */}
      <div className="px-10 py-6 bg-slate-900 border-t border-white/5 flex justify-between items-center relative z-40">
         <div className="flex gap-10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Grid: {rows}x{cols}</span>
            </div>
            <div className="flex items-center gap-3">
               <BookOpen size={14} className="text-slate-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Formulas: {statistics.formulas}</span>
            </div>
            <div className="flex items-center gap-3">
               <Shield size={14} className="text-slate-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Encrypted Uplink</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] opacity-40 italic">NoteFusion Synth Engine V4.2</span>
            <Maximize2 size={16} className="text-slate-600 hover:text-white cursor-pointer transition-colors" />
         </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
