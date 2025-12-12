interface HistoryItem {
  id: string;
  action: string;
  timestamp: Date;
  input: any;
  output: any;
  stateBefore: any;
  stateAfter: any;
}

class UndoManager {
  private history: HistoryItem[] = [];
  private redoStack: HistoryItem[] = [];
  private maxHistory: number;
  private currentState: any = null;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  // Add a new action to the history
  addAction(
    action: string,
    input: any,
    output: any,
    stateBefore: any,
    stateAfter: any
  ): string {
    const id = Date.now().toString();
    
    const historyItem: HistoryItem = {
      id,
      action,
      timestamp: new Date(),
      input,
      output,
      stateBefore,
      stateAfter,
    };

    this.history.unshift(historyItem);
    this.redoStack = []; // Clear redo stack when new action is performed
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    this.currentState = stateAfter;
    return id;
  }

  // Undo the last action
  undo(): { action: HistoryItem; previousState: any } | null {
    if (this.history.length === 0) return null;

    const lastAction = this.history.shift()!;
    this.redoStack.unshift(lastAction);
    
    this.currentState = lastAction.stateBefore;
    
    return {
      action: lastAction,
      previousState: lastAction.stateBefore,
    };
  }

  // Redo the last undone action
  redo(): { action: HistoryItem; nextState: any } | null {
    if (this.redoStack.length === 0) return null;

    const nextAction = this.redoStack.shift()!;
    this.history.unshift(nextAction);
    
    this.currentState = nextAction.stateAfter;
    
    return {
      action: nextAction,
      nextState: nextAction.stateAfter,
    };
  }

  // Check if undo is possible
  canUndo(): boolean {
    return this.history.length > 0;
  }

  // Check if redo is possible
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // Get the current state
  getCurrentState(): any {
    return this.currentState;
  }

  // Clear all history
  clear(): void {
    this.history = [];
    this.redoStack = [];
    this.currentState = null;
  }

  // Get all history items
  getHistory(): HistoryItem[] {
    return [...this.history];
  }

  // Get all redo items
  getRedoStack(): HistoryItem[] {
    return [...this.redoStack];
  }

  // Replace the current state (useful for syncing with external state)
  replaceState(newState: any): void {
    this.currentState = newState;
  }

  // Get the last action of a specific type
  getLastActionOfType(actionType: string): HistoryItem | undefined {
    return this.history.find(item => item.action === actionType);
  }

  // Get all actions of a specific type
  getActionsOfType(actionType: string): HistoryItem[] {
    return this.history.filter(item => item.action === actionType);
  }
}

export default UndoManager;
