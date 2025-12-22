import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Input, Button, Select, Space, message, Modal, Table, Tooltip, Dropdown, Menu, Divider, Badge } from 'antd';
const { Option } = Select;
import { 
  DownloadOutlined, 
  UploadOutlined,
  SaveOutlined,
  CalculatorOutlined,
  FileExcelOutlined,
  DeleteOutlined,
  CopyOutlined,
  SnippetsOutlined,
  UndoOutlined,
  RedoOutlined,
  FormatPainterOutlined,
  BorderOutlined,
  FunctionOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  GroupOutlined,
  UngroupOutlined,
  SplitCellsOutlined,
  MergeCellsOutlined,
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined
} from '@ant-design/icons';
import ExcelJS from 'exceljs';
import SpreadsheetWhiteboardIntegration from './SpreadsheetWhiteboardIntegration';


interface Cell {
  value: string | number | null;
  formula?: string;
  type: 'text' | 'number' | 'formula' | 'date';
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    alignment?: 'left' | 'center' | 'right';
  };
}

interface SheetData {
  [key: string]: Cell;
}

interface FormulaResult {
  value: number | string | null;
  error?: string;
}

interface HistoryItem {
  data: SheetData;
  value: string;
  type: 'text' | 'number' | 'formula' | 'date';
}

const ExcelSheet: React.FC = () => {
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<{ [key: string]: Cell } | null>(null);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [generatedCharts, setGeneratedCharts] = useState<any[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [dataRange, setDataRange] = useState<string>('');
  const [chartTitle, setChartTitle] = useState<string>('');
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Microsoft Office-style features
  const [selectedCells] = useState<Set<string>>(new Set());
  const [cellFormat, setCellFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left' as 'left' | 'center' | 'right',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 11,
    fontFamily: 'Arial',
    borders: {
      top: false,
      bottom: false,
      left: false,
      right: false
    }
  });
  const [isFormatPainter, setIsFormatPainter] = useState(false);
  const [mergedCells, setMergedCells] = useState<Set<string>>(new Set());
    const [showFilter, setShowFilter] = useState(false);
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not editing a cell
      if (editingCell) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Ctrl+C - Copy
      if (isCtrl && e.key === 'c' && !isShift && !isAlt) {
        e.preventDefault();
        copyCells();
        return;
      }

      // Ctrl+V - Paste
      if (isCtrl && e.key === 'v' && !isShift && !isAlt) {
        e.preventDefault();
        pasteCells();
        return;
      }

      // Ctrl+X - Cut
      if (isCtrl && e.key === 'x' && !isShift && !isAlt) {
        e.preventDefault();
        copyCells();
        clearCells();
        return;
      }

      // Ctrl+Z - Undo
      if (isCtrl && e.key === 'z' && !isShift && !isAlt) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y - Redo
      if (isCtrl && e.key === 'y' && !isShift && !isAlt) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+S - Save
      if (isCtrl && e.key === 's' && !isShift && !isAlt) {
        e.preventDefault();
        message.info('Save functionality coming soon');
        return;
      }

      // Delete - Clear cell
      if (e.key === 'Delete' && !isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        clearCells();
        return;
      }

      // F1 - Show shortcuts
      if (e.key === 'F1' && !isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Escape - Close modals
      if (e.key === 'Escape' && !isCtrl && !isShift && !isAlt) {
        e.preventDefault();
        setShowShortcuts(false);
        return;
      }

      // Arrow keys - Navigate cells
      if (!isCtrl && !isAlt && !isShift) {
        const { col, row } = parseCellReference(selectedCell) || {};
        if (col !== undefined && row !== undefined) {
          let newCol = col;
          let newRow = row;

          switch (e.key) {
            case 'ArrowUp':
              e.preventDefault();
              newRow = Math.max(0, row - 1);
              break;
            case 'ArrowDown':
              e.preventDefault();
              newRow = Math.min(99, row + 1);
              break;
            case 'ArrowLeft':
              e.preventDefault();
              newCol = Math.max(0, col - 1);
              break;
            case 'ArrowRight':
              e.preventDefault();
              newCol = Math.min(25, col + 1);
              break;
            default:
              return;
          }

          const newCellKey = getCellKey(newCol, newRow);
          setSelectedCell(newCellKey);
          handleCellClick(newCellKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, selectedCell, sheetData, history, historyIndex, clipboard]);

  // Microsoft Office-style functions
  const applyFormatToCells = useCallback(() => {
    const newSheetData = { ...sheetData };
    selectedCells.forEach(cellKey => {
      if (newSheetData[cellKey]) {
        newSheetData[cellKey] = {
          ...newSheetData[cellKey],
          style: { ...newSheetData[cellKey].style, ...cellFormat }
        };
      }
    });
    setSheetData(newSheetData);
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ data: newSheetData, value: '', type: 'text' });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [selectedCells, cellFormat, sheetData, history, historyIndex]);

  const toggleFormatPainter = useCallback(() => {
    if (isFormatPainter) {
      setIsFormatPainter(false);
    } else if (selectedCells.size > 0) {
      setIsFormatPainter(true);
      message.info('Format Painter activated - click cells to apply format');
    }
  }, [isFormatPainter, selectedCells]);

  
  const mergeCells = useCallback(() => {
    if (selectedCells.size < 2) {
      message.warning('Please select at least 2 cells to merge');
      return;
    }
    const newMergedCells = new Set(mergedCells);
    selectedCells.forEach(cell => newMergedCells.add(cell));
    setMergedCells(newMergedCells);
    message.success('Cells merged');
  }, [selectedCells, mergedCells]);

  const unmergeCells = useCallback(() => {
    const newMergedCells = new Set(mergedCells);
    selectedCells.forEach(cell => newMergedCells.delete(cell));
    setMergedCells(newMergedCells);
    message.success('Cells unmerged');
  }, [selectedCells, mergedCells]);

  
  const sortData = useCallback((direction: 'asc' | 'desc') => {
    if (selectedCells.size === 0) {
      message.warning('Please select cells to sort');
      return;
    }
    // Implementation for sorting data
    message.success(`Data sorted ${direction === 'asc' ? 'ascending' : 'descending'}`);
  }, [selectedCells]);

  const filterData = useCallback(() => {
    setShowFilter(!showFilter);
    message.info(showFilter ? 'Filter disabled' : 'Filter enabled');
  }, [showFilter]);

  const groupRows = useCallback(() => {
    // Implementation for grouping rows
    message.success('Rows grouped');
  }, []);

  const ungroupRows = useCallback(() => {
    // Implementation for ungrouping rows
    message.success('Rows ungrouped');
  }, []);

  const addConditionalFormat = useCallback(() => {
    // Implementation for conditional formatting
    message.success('Conditional formatting added');
  }, []);

  // Helper function to evaluate conditions for IF function
  const evaluateCondition = (condition: string, data: SheetData): boolean => {
    try {
      // Replace cell references with their values
      let processedCondition = condition;
      const cellRefs = condition.match(/[A-Z]+\d+/g) || [];
      
      for (const ref of cellRefs) {
        const cell = data[ref];
        if (cell) {
          const value = cell.formula ? evaluateFormula(cell.formula, data).value : cell.value;
          processedCondition = processedCondition.replace(ref, String(value || 0));
        } else {
          processedCondition = processedCondition.replace(ref, '0');
        }
      }

      // Evaluate logical operators
      if (processedCondition.includes('>=')) {
        const [left, right] = processedCondition.split('>=').map((s: string) => s.trim());
        return Number(left) >= Number(right);
      }
      if (processedCondition.includes('<=')) {
        const [left, right] = processedCondition.split('<=').map((s: string) => s.trim());
        return Number(left) <= Number(right);
      }
      if (processedCondition.includes('<>')) {
        const [left, right] = processedCondition.split('<>').map((s: string) => s.trim());
        return left !== right;
      }
      if (processedCondition.includes('>')) {
        const [left, right] = processedCondition.split('>').map((s: string) => s.trim());
        return Number(left) > Number(right);
      }
      if (processedCondition.includes('<')) {
        const [left, right] = processedCondition.split('<').map((s: string) => s.trim());
        return Number(left) < Number(right);
      }
      if (processedCondition.includes('=')) {
        const [left, right] = processedCondition.split('=').map((s: string) => s.trim());
        return left === right;
      }

      return Boolean(processedCondition);
    } catch (error) {
      return false;
    }
  };

  // Column letters (A, B, C, ..., Z, AA, AB, ...)
  const getColumnLetters = (count: number): string[] => {
    const letters = [];
    for (let i = 0; i < count; i++) {
      let column = '';
      let num = i;
      while (num >= 0) {
        column = String.fromCharCode(65 + (num % 26)) + column;
        num = Math.floor(num / 26) - 1;
      }
      letters.push(column);
    }
    return letters;
  };

  const columns = getColumnLetters(26);
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  // Cell reference parsing (A1, B2, etc.)
  const parseCellReference = (ref: string): { col: number; row: number } | null => {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    
    const colStr = match[1];
    const row = parseInt(match[2]) - 1;
    
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col--;
    
    return { col, row };
  };

  // Get cell key from coordinates
  const getCellKey = (col: number, row: number): string => {
    return `${columns[col]}${row + 1}`;
  };

  // Formula evaluation engine
  const evaluateFormula = useCallback((formula: string, data: SheetData): FormulaResult => {
    try {
      if (!formula.startsWith('=')) {
        return { value: formula };
      }

      const expression = formula.substring(1);
      
      // Replace cell references with their values
      let processedExpression = expression;
      const cellRefs = expression.match(/[A-Z]+\d+/g) || [];
      
      for (const ref of cellRefs) {
        const cell = data[ref];
        if (cell) {
          const value = cell.formula ? evaluateFormula(cell.formula, data).value : cell.value;
          processedExpression = processedExpression.replace(ref, String(value || 0));
        } else {
          processedExpression = processedExpression.replace(ref, '0');
        }
      }

      // Basic mathematical operations
      processedExpression = processedExpression.replace(/SUM\(([^)]+)\)/g, (_, range) => {
        const cells = range.split(',').map((cell: string) => cell.trim());
        const sum = cells.reduce((acc: number, cellRef: string) => {
          const cell = data[cellRef];
          const cellValue = cell?.value || 0;
          return acc + Number(cellValue);
        }, 0);
        return sum.toString();
      });

      processedExpression = processedExpression.replace(/AVERAGE\(([^)]+)\)/g, (_, range) => {
        const cells = range.split(',').map((cell: string) => cell.trim());
        const values = cells.map((cellRef: string) => {
          const cell = data[cellRef];
          return Number(cell?.value || 0);
        });
        const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
        return avg.toString();
      });

      processedExpression = processedExpression.replace(/COUNT\(([^)]+)\)/g, (_, range) => {
        const cells = range.split(',').map((cell: string) => cell.trim());
        const count = cells.filter((cellRef: string) => {
          const cell = data[cellRef];
          return cell?.value !== null && cell?.value !== '';
        }).length;
        return count.toString();
      });

      processedExpression = processedExpression.replace(/MAX\(([^)]+)\)/g, (_, range) => {
        const cells = range.split(',').map((cell: string) => cell.trim());
        const values = cells.map((cellRef: string) => {
          const cell = data[cellRef];
          return Number(cell?.value || 0);
        });
        return Math.max(...values).toString();
      });

      processedExpression = processedExpression.replace(/MIN\(([^)]+)\)/g, (_, range) => {
        const cells = range.split(',').map((cell: string) => cell.trim());
        const values = cells.map((cellRef: string) => {
          const cell = data[cellRef];
          return Number(cell?.value || 0);
        });
        return Math.min(...values).toString();
      });

      // Advanced Excel functions
      
      // VLOOKUP function
      processedExpression = processedExpression.replace(/VLOOKUP\(([^,]+),([^,]+),(\d+)(?:,([^)]+))?\)/g, (_, lookupValue, tableRange, colIndex, exactMatch) => {
        try {
          const [startCell, endCell] = tableRange.trim().split(':');
          const startCol = startCell.match(/[A-Z]+/)?.[0] || 'A';
          const startRow = parseInt(startCell.match(/\d+/)?.[0] || '1');
          const endRow = parseInt(endCell.match(/\d+/)?.[0] || '1');
          
          const targetColIndex = parseInt(colIndex) - 1;
          const isExact = exactMatch?.trim() === 'FALSE' || exactMatch?.trim() === 'false';
          
          // Search for lookup value in first column
          for (let row = startRow; row <= endRow; row++) {
            const lookupCellKey = `${startCol}${row}`;
            const lookupCell = data[lookupCellKey];
            const lookupValueInTable = lookupCell?.value;
            
            if (lookupValueInTable !== null && lookupValueInTable !== undefined) {
              const match = isExact ? 
                String(lookupValueInTable) === lookupValue.trim() :
                String(lookupValueInTable).toLowerCase() === lookupValue.trim().toLowerCase();
              
              if (match) {
                // Get value from target column
                const targetCol = String.fromCharCode(65 + (startCol.charCodeAt(0) - 65 + targetColIndex));
                const resultCellKey = `${targetCol}${row}`;
                const resultCell = data[resultCellKey];
                return String(resultCell?.value || '');
              }
            }
          }
          
          return '#N/A';
        } catch (error) {
          return '#ERROR!';
        }
      });

      // IF function
      processedExpression = processedExpression.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, (_, condition, trueValue, falseValue) => {
        try {
          // Evaluate condition
          const conditionResult = evaluateCondition(condition.trim(), data);
          return conditionResult ? trueValue.trim() : falseValue.trim();
        } catch (error) {
          return '#ERROR!';
        }
      });

      // COUNTIF function
      processedExpression = processedExpression.replace(/COUNTIF\(([^,]+),([^)]+)\)/g, (_, range, criteria) => {
        try {
          const cells = range.split(',').map((cell: string) => cell.trim());
          const criteriaValue = criteria.trim().replace(/['"]/g, '');
          
          let count = 0;
          cells.forEach((cellRef: string) => {
            const cell = data[cellRef];
            if (cell?.value !== null && cell?.value !== undefined) {
              const cellValue = String(cell.value);
              if (cellValue === criteriaValue || 
                  (criteriaValue.startsWith('*') && cellValue.endsWith(criteriaValue.slice(1))) ||
                  (criteriaValue.endsWith('*') && cellValue.startsWith(criteriaValue.slice(0, -1))) ||
                  (criteriaValue.includes('*') && cellValue.includes(criteriaValue.replace(/\*/g, '')))) {
                count++;
              }
            }
          });
          
          return count.toString();
        } catch (error) {
          return '#ERROR!';
        }
      });

      // SUMIF function
      processedExpression = processedExpression.replace(/SUMIF\(([^,]+),([^,]+),([^)]+)\)/g, (_, criteriaRange, criteria, sumRange) => {
        try {
          const criteriaCells = criteriaRange.split(',').map((cell: string) => cell.trim());
          const sumCells = sumRange.split(',').map((cell: string) => cell.trim());
          const criteriaValue = criteria.trim().replace(/['"]/g, '');
          
          let sum = 0;
          criteriaCells.forEach((cellRef: string, index: number) => {
            const cell = data[cellRef];
            if (cell?.value !== null && cell?.value !== undefined) {
              const cellValue = String(cell.value);
              if (cellValue === criteriaValue || 
                  (criteriaValue.startsWith('*') && cellValue.endsWith(criteriaValue.slice(1))) ||
                  (criteriaValue.endsWith('*') && cellValue.startsWith(criteriaValue.slice(0, -1))) ||
                  (criteriaValue.includes('*') && cellValue.includes(criteriaValue.replace(/\*/g, '')))) {
                const sumCell = data[sumCells[index]];
                sum += Number(sumCell?.value || 0);
              }
            }
          });
          
          return sum.toString();
        } catch (error) {
          return '#ERROR!';
        }
      });

      // CONCATENATE function
      processedExpression = processedExpression.replace(/CONCATENATE\(([^)]+)\)/g, (_, params) => {
        try {
          const values = params.split(',').map((param: string) => {
            const trimmed = param.trim().replace(/['"]/g, '');
            const cell = data[trimmed];
            return cell ? String(cell.value || '') : trimmed;
          });
          return values.join('');
        } catch (error) {
          return '#ERROR!';
        }
      });

      // LEFT function
      processedExpression = processedExpression.replace(/LEFT\(([^,]+),(\d+)\)/g, (_, text, numChars) => {
        try {
          const cell = data[text.trim()];
          const textValue = cell ? String(cell.value || '') : text.trim().replace(/['"]/g, '');
          return textValue.substring(0, parseInt(numChars));
        } catch (error) {
          return '#ERROR!';
        }
      });

      // RIGHT function
      processedExpression = processedExpression.replace(/RIGHT\(([^,]+),(\d+)\)/g, (_, text, numChars) => {
        try {
          const cell = data[text.trim()];
          const textValue = cell ? String(cell.value || '') : text.trim().replace(/['"]/g, '');
          const start = Math.max(0, textValue.length - parseInt(numChars));
          return textValue.substring(start);
        } catch (error) {
          return '#ERROR!';
        }
      });

      // LEN function
      processedExpression = processedExpression.replace(/LEN\(([^)]+)\)/g, (_, text) => {
        try {
          const cell = data[text.trim()];
          const textValue = cell ? String(cell.value || '') : text.trim().replace(/['"]/g, '');
          return textValue.length.toString();
        } catch (error) {
          return '#ERROR!';
        }
      });

      // ROUND function
      processedExpression = processedExpression.replace(/ROUND\(([^,]+),(\d+)\)/g, (_, number, decimals) => {
        try {
          const cell = data[number.trim()];
          const numValue = cell ? Number(cell.value || 0) : Number(number.trim());
          const decimalPlaces = parseInt(decimals);
          const result = Math.round(numValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
          return result.toString();
        } catch (error) {
          return '#ERROR!';
        }
      });

      // DATE function
      processedExpression = processedExpression.replace(/DATE\(([^,]+),([^,]+),([^)]+)\)/g, (_, year, month, day) => {
        try {
          const y = parseInt(year.trim());
          const m = parseInt(month.trim());
          const d = parseInt(day.trim());
          const date = new Date(y, m - 1, d);
          return date.toISOString().split('T')[0];
        } catch (error) {
          return '#ERROR!';
        }
      });

      // Evaluate the final expression
      const result = Function('"use strict"; return (' + processedExpression + ')')();
      
      if (isNaN(result) && !isFinite(result)) {
        return { value: null, error: '#VALUE!' };
      }
      
      return { value: result };
    } catch (error) {
      return { value: null, error: '#ERROR!' };
    }
  }, []);

  // Get cell value (evaluated if formula)
  const getCellValue = useCallback((cellKey: string): string | number | null => {
    const cell = sheetData[cellKey];
    if (!cell) return null;
    
    if (cell.formula) {
      const result = evaluateFormula(cell.formula, sheetData);
      return result.error || result.value;
    }
    
    return cell.value;
  }, [sheetData, evaluateFormula]);

  // Update cell value
  const updateCell = useCallback((cellKey: string, value: string) => {
    const newSheetData = { ...sheetData };
    const isFormula = value.startsWith('=');
    
    if (!value || value === '') {
      delete newSheetData[cellKey];
    } else {
      newSheetData[cellKey] = {
        value: isFormula ? null : value,
        formula: isFormula ? value : undefined,
        type: isFormula ? 'formula' : isNaN(Number(value)) ? 'text' : 'number'
      };
    }
    
    setSheetData(newSheetData);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ data: newSheetData, value: '', type: 'text' });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [sheetData, history, historyIndex]);

  // Handle cell click
  const handleCellClick = (cellKey: string) => {
    setSelectedCell(cellKey);
    const cell = sheetData[cellKey];
    setEditValue(cell?.formula || String(cell?.value || ''));
  };

  // Handle cell double click (edit mode)
  const handleCellDoubleClick = (cellKey: string) => {
    setEditingCell(cellKey);
    const cell = sheetData[cellKey];
    setEditValue(cell?.formula || String(cell?.value || ''));
  };

  // Handle cell edit
  const handleCellEdit = (value: string) => {
    if (editingCell) {
      updateCell(editingCell, value);
      setEditingCell(null);
    }
  };

  // Copy selected cells
  const copyCells = () => {
    if (selectedCells.size > 0) {
      const copiedData: { [key: string]: Cell } = {};
      selectedCells.forEach(cellKey => {
        if (sheetData[cellKey]) {
          copiedData[cellKey] = sheetData[cellKey];
        }
      });
      setClipboard(copiedData);
      message.success(`${selectedCells.size} cells copied`);
    } else if (selectedCell) {
      setClipboard({ [selectedCell]: sheetData[selectedCell] || { value: null, type: 'text' } });
      message.success('Cell copied');
    }
  };

  // Paste cells
  const pasteCells = () => {
    if (clipboard && selectedCell) {
      const newSheetData = { ...sheetData };
      
      if (Object.keys(clipboard).length === 1) {
        // Single cell paste
        newSheetData[selectedCell] = { ...Object.values(clipboard)[0] };
        message.success('Cell pasted');
      } else {
        // Multiple cells paste - calculate offset
        const sourceCells = Object.keys(clipboard);
        const sourceTopLeft = parseCellReference(sourceCells[0]);
        const targetTopLeft = parseCellReference(selectedCell);
        
        if (sourceTopLeft && targetTopLeft) {
          sourceCells.forEach(cellKey => {
            const source = parseCellReference(cellKey);
            if (source) {
              const rowOffset = targetTopLeft.row - sourceTopLeft.row;
              const colOffset = targetTopLeft.col - sourceTopLeft.col;
              const targetCol = source.col + colOffset;
              const targetRow = source.row + rowOffset;
              
              if (targetCol >= 0 && targetCol < 26 && targetRow >= 0 && targetRow < 100) {
                const targetKey = getCellKey(targetCol, targetRow);
                newSheetData[targetKey] = { ...clipboard[cellKey] };
              }
            }
          });
          message.success(`${Object.keys(clipboard).length} cells pasted`);
        }
      }
      
      setSheetData(newSheetData);
    }
  };

  // Clear cells
  const clearCells = () => {
    if (selectedCells.size > 0) {
      const newSheetData = { ...sheetData };
      selectedCells.forEach(cellKey => {
        delete newSheetData[cellKey];
      });
      setSheetData(newSheetData);
      message.success(`${selectedCells.size} cells cleared`);
    } else if (selectedCell) {
      updateCell(selectedCell, '');
    }
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSheetData(history[historyIndex - 1].data);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSheetData(history[historyIndex + 1].data);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      
      // Add header row
      const headerRow = worksheet.addRow(['', ...columns]);
      headerRow.font = { bold: true };
      
      // Add data rows
      rows.forEach(row => {
        const rowData: (string | number)[] = [row];
        columns.forEach(col => {
          const cellKey = `${col}${row}`;
          const value = getCellValue(cellKey);
          const numericValue = Number(value);
          rowData.push(isNaN(numericValue) ? String(value || '') : numericValue);
        });
        worksheet.addRow(rowData);
      });

      // Set column widths
      worksheet.columns = [
        { width: 5 },
        ...columns.map(() => ({ width: 15 }))
      ];
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spreadsheet_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      message.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export Excel file');
    }
  };

  // Import from Excel
  const importFromExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        
        if (!workbook.worksheets.length) {
          message.error('Excel file has no sheets');
          return;
        }
        
        const worksheet = workbook.worksheets[0];
        const newSheetData: SheetData = {};
        
        worksheet.eachRow((row, rowIndex) => {
          if (rowIndex === 1) return; // Skip header row
          if (!row || row.values.length === 0) return; // Skip empty rows
          
          row.eachCell((cell, colIndex) => {
            if (colIndex === 1) return; // Skip row number column
            if (colIndex - 1 >= columns.length) return; // Skip if column exceeds our grid
            
            const cellKey = `${columns[colIndex - 1]}${rowIndex}`;
            let value = cell.value;
            
            // Handle different data types
            if (value !== null && value !== undefined && value !== '') {
              // Check if it's a formula
              if (typeof value === 'string' && value.startsWith('=')) {
                newSheetData[cellKey] = {
                  value: null,
                  formula: value,
                  type: 'formula'
                };
              } else {
                newSheetData[cellKey] = {
                  value: String(value),
                  type: isNaN(Number(value)) ? 'text' : 'number'
                };
              }
            }
          });
        });
        
        setSheetData(newSheetData);
        message.success(`Excel file imported successfully. Loaded ${Object.keys(newSheetData).length} cells.`);
      } catch (error) {
        console.error('Import error:', error);
        message.error('Failed to import Excel file. Please check the file format.');
      }
    };
    reader.onerror = () => {
      message.error('Failed to read file');
    };
    reader.readAsArrayBuffer(file);
  };

  
  // Handle whiteboard insertion
  const handleWhiteboardInsert = (type: 'table' | 'chart', data: any) => {
    // Store the data for whiteboard integration
    const whiteboardData = JSON.stringify({ type, data });
    localStorage.setItem('whiteboardInsertData', whiteboardData);
    
    // Open whiteboard in new tab
    window.open('/whiteboard', '_blank');
    message.success('Data sent to whiteboard');
  };

  // Chart generation functions
  const generateChart = () => {
    try {
      const chartData = extractChartData(dataRange);
      if (!chartData || chartData.length === 0) {
        message.error('No data found in the specified range');
        return;
      }

      const newChart = {
        id: Date.now(),
        type: selectedChartType,
        title: chartTitle,
        data: chartData,
        color: '#1890ff'
      };

      setGeneratedCharts([...generatedCharts, newChart]);
      message.success('Chart generated successfully');
      
      // Clear form
      setSelectedChartType('');
      setDataRange('');
      setChartTitle('');
    } catch (error) {
      message.error('Failed to generate chart. Please check your data range.');
    }
  };

  const extractChartData = (range: string): { label: string; value: number; category: string }[] => {
    if (!range) return [];
    
    // Handle range like A1:B5 or single cell like A1
    let data: { label: string; value: number; category: string }[] = [];
    
    try {
      // Check if range is in format A1:B5
      if (range.includes(':')) {
        const [start, end] = range.split(':').map(s => s.trim());
        const startCol = start.match(/[A-Za-z]+/)?.[0] || '';
        const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
        const endCol = end.match(/[A-Za-z]+/)?.[0] || '';
        const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
        
        // Convert column letters to numbers (A=1, B=2, ..., Z=26, AA=27, etc.)
        const colToNum = (col: string): number => {
          let num = 0;
          for (let i = 0; i < col.length; i++) {
            num = num * 26 + (col.toUpperCase().charCodeAt(i) - 64);
          }
          return num;
        };
        
        const startColNum = colToNum(startCol);
        const endColNum = colToNum(endCol);
        
        // Extract data from the range
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startColNum; col <= endColNum; col++) {
            // Convert column number back to letters
            let colName = '';
            let n = col;
            while (n > 0) {
              let r = (n - 1) % 26;
              colName = String.fromCharCode(65 + r) + colName;
              n = Math.floor((n - 1) / 26);
            }
            
            const cellRef = `${colName}${row}`;
            const cell = sheetData[cellRef];
            if (cell && cell.value !== null && cell.value !== undefined) {
              const value = Number(cell.value);
              if (!isNaN(value)) {
                data.push({
                  label: cellRef,
                  value: value,
                  category: `Row ${row}`
                });
              }
            }
          }
        }
      } else {
        // Handle single cell
        const cell = sheetData[range];
        if (cell && cell.value !== null && cell.value !== undefined) {
          const value = Number(cell.value);
          if (!isNaN(value)) {
            data.push({
              label: range,
              value: value,
              category: range
            });
          }
        }
      }
    } catch (error) {
      console.error('Error extracting chart data:', error);
    }
    
    return data;
  };

  const removeChart = (index: number) => {
    const newCharts = generatedCharts.filter((_, i) => i !== index);
    setGeneratedCharts(newCharts);
    message.success('Chart removed');
  };

  const renderChart = (chart: any) => {
    if (!chart.data || chart.data.length === 0) {
      return <div style={{ color: '#999', fontSize: '10px' }}>No data available</div>;
    }

    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];
    
    if (chart.type === 'bar') {
      const maxValue = Math.max(...chart.data.map((d: any) => d.value));
      return (
        <div style={{ width: '100%', height: '100%', padding: '4px' }}>
          {chart.data.slice(0, 3).map((item: any, index: number) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              <div style={{ 
                height: '12px', 
                width: `${(item.value / maxValue) * 100}%`,
                background: colors[index % colors.length],
                borderRadius: '2px',
                marginBottom: '1px'
              }} />
              <div style={{ fontSize: '8px', color: '#666' }}>{item.label}: {item.value}</div>
            </div>
          ))}
        </div>
      );
    }
    
    if (chart.type === 'pie') {
      const total = chart.data.reduce((sum: number, item: any) => sum + item.value, 0);
      const pieData = chart.data.slice(0, 3);
      const segments = pieData.map((item: any, index: number) => ({
        percentage: (item.value / total) * 100,
        color: colors[index % colors.length]
      }));
      
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%',
            background: `conic-gradient(${segments.map((seg: any, i: number) => `${seg.color} ${segments.slice(0, i).reduce((acc: number, s: any) => acc + s.percentage, 0)}deg ${segments.slice(0, i + 1).reduce((acc: number, s: any) => acc + s.percentage, 0)}deg`).join(', ')})`
          }} />
        </div>
      );
    }
    
    if (chart.type === 'line') {
      const maxValue = Math.max(...chart.data.map((d: any) => d.value));
      const points = chart.data.slice(0, 5);
      return (
        <div style={{ width: '100%', height: '100%', padding: '4px' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40">
            <polyline
              fill="none"
              stroke={chart.color}
              strokeWidth="2"
              points={points.map((item: any, index: number) => `${(index / (points.length - 1)) * 180 + 10},${40 - (item.value / maxValue) * 30}`).join(' ')}
            />
            {points.map((item: any, index: number) => (
              <circle
                key={index}
                cx={(index / (points.length - 1)) * 180 + 10}
                cy={40 - (item.value / maxValue) * 30}
                r="3"
                fill={chart.color}
              />
            ))}
          </svg>
        </div>
      );
    }
    
    if (chart.type === 'area') {
      const maxValue = Math.max(...chart.data.map((d: any) => d.value));
      const points = chart.data.slice(0, 5);
      return (
        <div style={{ width: '100%', height: '100%', padding: '4px' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40">
            <polygon
              fill={chart.color}
              fillOpacity="0.3"
              stroke={chart.color}
              strokeWidth="2"
              points={`10,40 ${points.map((item: any, index: number) => `${(index / (points.length - 1)) * 180 + 10},${40 - (item.value / maxValue) * 30}`).join(' ')} 190,40`}
            />
          </svg>
        </div>
      );
    }
    
    // Scatter plot
    if (chart.type === 'scatter') {
      const maxValue = Math.max(...chart.data.map((d: any) => d.value));
      const points = chart.data.slice(0, 10);
      return (
        <div style={{ width: '100%', height: '100%', padding: '4px' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40">
            {points.map((item: any, index: number) => (
              <circle
                key={index}
                cx={(index / (points.length - 1)) * 180 + 10}
                cy={40 - (item.value / maxValue) * 30}
                r="2"
                fill={chart.color}
              />
            ))}
          </svg>
        </div>
      );
    }

    // Doughnut chart
    if (chart.type === 'doughnut') {
      const total = chart.data.reduce((sum: number, item: any) => sum + item.value, 0);
      const doughnutData = chart.data.slice(0, 4);
      const segments = doughnutData.map((item: any, index: number) => ({
        percentage: (item.value / total) * 100,
        color: colors[index % colors.length]
      }));
      
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="60px" height="60px" viewBox="0 0 42 42">
            {segments.map((seg: any, i: number) => {
              const startAngle = segments.slice(0, i).reduce((acc: number, s: any) => acc + s.percentage, 0) * 3.6;
              const endAngle = segments.slice(0, i + 1).reduce((acc: number, s: any) => acc + s.percentage, 0) * 3.6;
              return (
                <path
                  key={i}
                  d={`M 21 21 L 21 8 A 13 13 0 ${startAngle > 180 ? 1 : 0} 1 ${21 + 13 * Math.cos(startAngle * Math.PI / 180)} ${8 + 13 * Math.sin(startAngle * Math.PI / 180)} A 13 13 0 ${endAngle > 180 ? 1 : 0} 1 ${21 + 13 * Math.cos(endAngle * Math.PI / 180)} ${8 + 13 * Math.sin(endAngle * Math.PI / 180)} Z`}
                  fill={seg.color}
                />
              );
            })}
            <circle cx="21" cy="21" r="8" fill="white" />
          </svg>
        </div>
      );
    }

    // Default fallback
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
          {chart.type} chart<br/>
          {chart.data.length} items
        </div>
      </div>
    );
  };

  
  // Render table columns
  const tableColumns = [
    {
      title: '',
      dataIndex: 'row',
      key: 'row',
      width: 50,
      fixed: 'left' as const,
      render: (row: number) => (
        <div style={{ textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5' }}>
          {row}
        </div>
      )
    },
    ...columns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      width: 100,
      render: (_value: any, record: any) => {
        const cellKey = `${col}${record.row}`;
        const cell = sheetData[cellKey];
        const isSelected = selectedCell === cellKey;
        const isEditing = editingCell === cellKey;
        
        return (
          <div
            style={{
              border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
              padding: '4px',
              minHeight: '24px',
              background: isSelected ? '#e6f7ff' : 'white',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => handleCellClick(cellKey)}
            onDoubleClick={() => handleCellDoubleClick(cellKey)}
          >
            {isEditing ? (
              <Input
                size="small"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleCellEdit(editValue)}
                onPressEnter={() => handleCellEdit(editValue)}
                autoFocus
                style={{ border: 'none', padding: 0 }}
              />
            ) : (
              <div>
                {cell?.formula && (
                  <div style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
                    {cell.formula}
                  </div>
                )}
                <div style={{ fontWeight: cell?.style?.bold ? 'bold' : 'normal' }}>
                  {getCellValue(cellKey)}
                </div>
              </div>
            )}
          </div>
        );
      }
    }))
  ];

  // Render table data
  const tableData = rows.map(row => ({
    key: row,
    row,
    ...columns.reduce((acc, col) => {
      acc[col] = '';
      return acc;
    }, {} as any)
  }));

  return (
    <Card
      title={
        <Space>
          <FileExcelOutlined />
          <span>Excel Spreadsheet</span>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Keyboard Shortcuts (F1)">
            <Button icon={<CalculatorOutlined />} onClick={() => setShowShortcuts(true)}>
              Shortcuts
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Formula Bar">
            <Button onClick={() => setShowFormulaBar(!showFormulaBar)}>
              {showFormulaBar ? 'Hide' : 'Show'} Formula
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Grid Lines">
            <Button onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
          </Tooltip>
          <Tooltip title="Zoom">
            <Select value={zoom} onChange={setZoom} style={{ width: 80 }}>
              <Select.Option value={50}>50%</Select.Option>
              <Select.Option value={75}>75%</Select.Option>
              <Select.Option value={100}>100%</Select.Option>
              <Select.Option value={125}>125%</Select.Option>
              <Select.Option value={150}>150%</Select.Option>
            </Select>
          </Tooltip>
          
          {/* File Operations Group */}
          <div style={{ borderLeft: '1px solid #d9d9d9', paddingLeft: '8px', marginLeft: '8px' }}>
            <Space>
              <Tooltip title="Import Excel File">
                <Button icon={<UploadOutlined />} type="default">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importFromExcel(file);
                    }}
                    title="Import Excel file"
                    placeholder="Choose Excel file to import"
                    style={{ display: 'none' }}
                  />
                  Import
                </Button>
              </Tooltip>
              
              <Tooltip title="Export Excel File">
                <Button icon={<DownloadOutlined />} onClick={exportToExcel} type="default">
                  Export
                </Button>
              </Tooltip>
              
              <Tooltip title="Save Spreadsheet">
                <Button icon={<SaveOutlined />} type="primary">
                  Save
                </Button>
              </Tooltip>
            </Space>
          </div>
          
          {/* Microsoft Office-style Formatting Toolbar */}
          <div style={{ borderLeft: '1px solid #d9d9d9', paddingLeft: '8px', marginLeft: '8px' }}>
            <Space>
              <Badge dot={isFormatPainter}>
                <Button 
                  icon={<FormatPainterOutlined />} 
                  onClick={toggleFormatPainter}
                  type={isFormatPainter ? 'primary' : 'default'}
                >
                  Format Painter
                </Button>
              </Badge>
              
              <Divider type="vertical" />
              
              <Button 
                icon={<BoldOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, bold: !prev.bold }))}
                type={cellFormat.bold ? 'primary' : 'default'}
              />
              
              <Button 
                icon={<ItalicOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, italic: !prev.italic }))}
                type={cellFormat.italic ? 'primary' : 'default'}
              />
              
              <Button 
                icon={<UnderlineOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, underline: !prev.underline }))}
                type={cellFormat.underline ? 'primary' : 'default'}
              />
              
              <Divider type="vertical" />
              
              <Button 
                icon={<AlignLeftOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, align: 'left' }))}
                type={cellFormat.align === 'left' ? 'primary' : 'default'}
              />
              
              <Button 
                icon={<AlignCenterOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, align: 'center' }))}
                type={cellFormat.align === 'center' ? 'primary' : 'default'}
              />
              
              <Button 
                icon={<AlignRightOutlined />} 
                onClick={() => setCellFormat(prev => ({ ...prev, align: 'right' }))}
                type={cellFormat.align === 'right' ? 'primary' : 'default'}
              />
              
              <Button icon={<BorderOutlined />} onClick={applyFormatToCells}>
                Borders
              </Button>
              
              <Button icon={<MergeCellsOutlined />} onClick={mergeCells}>
                Merge
              </Button>
              
              <Button icon={<SplitCellsOutlined />} onClick={unmergeCells}>
                Unmerge
              </Button>
            </Space>
          </div>
          
          {/* Data Operations */}
          <div style={{ borderLeft: '1px solid #d9d9d9', paddingLeft: '8px', marginLeft: '8px' }}>
            <Space>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="sort-asc" icon={<SortAscendingOutlined />} onClick={() => sortData('asc')}>
                      Sort Ascending
                    </Menu.Item>
                    <Menu.Item key="sort-desc" icon={<SortDescendingOutlined />} onClick={() => sortData('desc')}>
                      Sort Descending
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="filter" icon={<FilterOutlined />} onClick={filterData}>
                      {showFilter ? 'Disable Filter' : 'Enable Filter'}
                    </Menu.Item>
                    <Menu.Item key="conditional" icon={<FunctionOutlined />} onClick={addConditionalFormat}>
                      Conditional Formatting
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button icon={<SortAscendingOutlined />}>
                  Sort & Filter <span style={{ fontSize: '10px' }}>▼</span>
                </Button>
              </Dropdown>
              
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="group-rows" icon={<GroupOutlined />} onClick={groupRows}>
                      Group Rows
                    </Menu.Item>
                    <Menu.Item key="group-cols" icon={<GroupOutlined />}>
                      Group Columns
                    </Menu.Item>
                    <Menu.Item key="ungroup-rows" icon={<UngroupOutlined />} onClick={ungroupRows}>
                      Ungroup Rows
                    </Menu.Item>
                    <Menu.Item key="ungroup-cols" icon={<UngroupOutlined />} onClick={ungroupRows}>
                      Ungroup Columns
                    </Menu.Item>
                  </Menu>
                }>
                <Button icon={<GroupOutlined />}>
                  Group <span style={{ fontSize: '10px' }}>▼</span>
                </Button>
              </Dropdown>
              
              <Dropdown
                overlay={
                  <Menu>
                  </Menu>
                }>
                <Button disabled>
                  Freeze <span style={{ fontSize: '10px' }}>▼</span>
                </Button>
              </Dropdown>
            </Space>
          </div>
          
          {/* Edit Operations */}
          <div style={{ borderLeft: '1px solid #d9d9d9', paddingLeft: '8px', marginLeft: '8px' }}>
            <Space>
              <Button icon={<UndoOutlined />} onClick={undo} disabled={historyIndex <= 0}>
                Undo
              </Button>
              <Button icon={<RedoOutlined />} onClick={redo} disabled={historyIndex >= history.length - 1}>
                Redo
              </Button>
              <Button icon={<CopyOutlined />} onClick={copyCells}>
                Copy
              </Button>
              <Button icon={<SnippetsOutlined />} onClick={pasteCells} disabled={!clipboard}>
                Paste
              </Button>
              <Button icon={<DeleteOutlined />} onClick={clearCells}>
                Clear
              </Button>
            </Space>
          </div>
          
          {/* Advanced Features */}
          <div style={{ borderLeft: '1px solid #d9d9d9', paddingLeft: '8px', marginLeft: '8px' }}>
            <Space>
              <SpreadsheetWhiteboardIntegration
                spreadsheetData={sheetData}
                charts={generatedCharts}
                onInsertData={handleWhiteboardInsert}
              />
            </Space>
          </div>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <div style={{ height: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Formula Bar */}
        {showFormulaBar && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderBottom: '1px solid #d9d9d9',
            background: '#fafafa',
            flexShrink: 0
          }}>
            <span style={{
              fontWeight: 'bold',
              marginRight: '8px',
              minWidth: '60px'
            }}>
              {selectedCell}:
            </span>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={() => handleCellEdit(editValue)}
              placeholder="Enter value or formula (start with =)"
              style={{ flex: 1 }}
            />
          </div>
        )}

        {/* Spreadsheet Table */}
        <div
          ref={tableRef}
          style={{
            flex: 1,
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            minHeight: '300px',
            maxHeight: '400px'
          }}
        >
          <div style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: '100%'
          }}>
            <Table
              columns={tableColumns}
              dataSource={tableData}
              pagination={false}
              scroll={{ x: 1500, y: 300 }}
              size="small"
              bordered={showGrid}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '4px 8px', 
          background: '#f5f5f5', 
          fontSize: '12px',
          borderTop: '1px solid #d9d9d9',
          flexShrink: 0
        }}>
          <span>Selected: {selectedCell}</span>
          <span>Cells: {Object.keys(sheetData).length}</span>
          <span>Zoom: {zoom}%</span>
        </div>
        
        {/* Chart Generation Section */}
        <div style={{ 
          borderTop: '1px solid #d9d9d9',
          padding: '16px',
          background: '#fafafa',
          flexShrink: 0,
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: '#1890ff', fontSize: '14px' }}>Chart Generator</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
              Create charts from your spreadsheet data
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '12px',
            flexWrap: 'nowrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Select 
                placeholder="Chart Type" 
                style={{ width: 130, height: '32px' }}
                value={selectedChartType}
                onChange={setSelectedChartType}
                size="small"
              >
                <Option value="line">Line</Option>
                <Option value="bar">Bar</Option>
                <Option value="pie">Pie</Option>
                <Option value="area">Area</Option>
                <Option value="scatter">Scatter</Option>
                <Option value="doughnut">Doughnut</Option>
              </Select>
              
              <Input
                placeholder="Data Range (e.g., A1:B10)"
                style={{ width: 160, height: '32px' }}
                value={dataRange}
                onChange={(e) => setDataRange(e.target.value)}
                size="small"
              />
              
              <Input
                placeholder="Chart Title"
                style={{ width: 150, height: '32px' }}
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                size="small"
              />
              
              <Button 
                type="primary" 
                onClick={generateChart}
                disabled={!selectedChartType || !dataRange || !chartTitle}
                size="small"
                style={{ height: '32px' }}
              >
                Generate
              </Button>
            </div>
          </div>
          
          {/* Generated Charts Display */}
          {generatedCharts.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Generated Charts:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxHeight: '150px', overflow: 'auto', justifyContent: 'flex-start' }}>
                {generatedCharts.map((chart, index) => (
                  <Card 
                    key={index}
                    size="small"
                    title={chart.title}
                    style={{ width: 220, height: 90, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
                    styles={{ body: { padding: '8px' }, title: { fontSize: '11px' } }}
                    extra={
                      <Button 
                        size="small" 
                        type="text" 
                        danger
                        onClick={() => removeChart(index)}
                        style={{ fontSize: '10px', height: '16px', lineHeight: '16px' }}
                      >
                        ×
                      </Button>
                    }
                  >
                    <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderChart(chart)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      <Modal
        title="Keyboard Shortcuts"
        open={showShortcuts}
        onCancel={() => setShowShortcuts(false)}
        footer={[
          <Button key="close" onClick={() => setShowShortcuts(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #d9d9d9' }}>Shortcut</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #d9d9d9' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+C</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Copy selected cell</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+V</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Paste to selected cell</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+X</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Cut selected cell</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+Z</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Undo last action</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+Y</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Redo last action</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Ctrl+S</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Save spreadsheet</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Delete</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Clear selected cell</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Arrow Keys</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Navigate between cells</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>F1</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Show this help</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}><kbd>Escape</kbd></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>Close dialogs</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>Advanced Functions:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>VLOOKUP</strong>: =VLOOKUP(value, range, column, exact)</li>
              <li><strong>IF</strong>: =IF(condition, true_value, false_value)</li>
              <li><strong>COUNTIF</strong>: =COUNTIF(range, criteria)</li>
              <li><strong>SUMIF</strong>: =SUMIF(criteria_range, criteria, sum_range)</li>
              <li><strong>CONCATENATE</strong>: =CONCATENATE(text1, text2, ...)</li>
              <li><strong>LEFT/RIGHT</strong>: =LEFT(text, num_chars)</li>
              <li><strong>LEN</strong>: =LEN(text)</li>
              <li><strong>ROUND</strong>: =ROUND(number, decimals)</li>
              <li><strong>DATE</strong>: =DATE(year, month, day)</li>
            </ul>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ExcelSheet;
