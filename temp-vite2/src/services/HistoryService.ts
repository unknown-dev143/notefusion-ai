import { v4 as uuidv4 } from 'uuid';

export interface HistoryItem {
  id: string;
  action: string;
  input: string;
  output: string | string[];
  timestamp: number;
}

const HISTORY_KEY = 'ai_history';

class HistoryService {
  private static getHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  private static saveHistory(history: HistoryItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }

  static addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
    const history = this.getHistory();
    const newItem = {
      ...item,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    
    // Keep only the last 100 items
    const updatedHistory = [newItem, ...history].slice(0, 100);
    this.saveHistory(updatedHistory);
    return newItem;
  }

  static getHistoryItems(limit = 10): HistoryItem[] {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  static searchHistory(query: string, limit = 10): HistoryItem[] {
    if (!query.trim()) return this.getHistoryItems(limit);
    
    const searchLower = query.toLowerCase();
    const history = this.getHistory();
    
    return history
      .filter(item => 
        item.input.toLowerCase().includes(searchLower) || 
        (typeof item.output === 'string' ? item.output.toLowerCase() : item.output.join(' ').toLowerCase()).includes(searchLower) ||
        item.action.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);
  }

  static clearHistory() {
    this.saveHistory([]);
  }

  static removeHistoryItem(id: string) {
    const history = this.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    this.saveHistory(updatedHistory);
  }
}

export default HistoryService;
