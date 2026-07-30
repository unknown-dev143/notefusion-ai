import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import PomodoroTimer from '../PomodoroTimer';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Audio
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();

describe('PomodoroTimer', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial state', () => {
    render(<PomodoroTimer />);
    
    // Check initial UI elements
    expect(screen.getByText('Ready to Focus')).toBeInTheDocument();
    expect(screen.getAllByText('25:00').length).toBeGreaterThan(0);
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument();
  });

  it('starts and pauses the timer', () => {
    render(<PomodoroTimer />);
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Fast-forward time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check if time has updated
    expect(screen.getAllByText('24:59').length).toBeGreaterThan(0);
    
    // Pause the timer
    fireEvent.click(screen.getByText('Pause'));
    expect(screen.getByText('Resume')).toBeInTheDocument();
    
    // Time should not change when paused
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getAllByText('24:59').length).toBeGreaterThan(0);
  });

  it('completes a work session and starts a break', () => {
    render(<PomodoroTimer />);
    
    // Start the timer
    fireEvent.click(screen.getByText('Start'));
    
    // Fast-forward to end of work session (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });
    
    // Should switch to break
    expect(screen.getByText('Short Break')).toBeInTheDocument();
    expect(screen.getAllByText('05:00').length).toBeGreaterThan(0);
  });

  it('adds and completes tasks', () => {
    render(<PomodoroTimer />);
    
    // Add a task
    const taskInput = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(taskInput, { target: { value: 'Test task' } });
    const addButton = screen.getByTestId('add-task-button');
    fireEvent.click(addButton);
    
    // Check if task was added
    expect(screen.getByText('Test task')).toBeInTheDocument();
    
    // Complete the task
    const completeButton = screen.getAllByTestId(/task-checkbox-/i)[0];
    fireEvent.click(completeButton);
    
    // Check if task is marked as completed
    expect(screen.getAllByTestId(/task-checkbox-/i)[0]).toHaveClass('ant-btn-default');
  });

  it('saves and loads state from localStorage', () => {
    // Set initial state in localStorage
    const initialState = {
      timeLeft: 1500,
      isActive: false,
      timerState: 'work',
      sessionCount: 1,
      totalFocusTime: 25,
      tasks: [{ id: '1', text: 'Saved task', completed: false, createdAt: new Date() }]
    };
    localStorage.setItem('pomodoroState', JSON.stringify(initialState));
    localStorage.setItem('pomodoroTasks', JSON.stringify(initialState.tasks));
    
    render(<PomodoroTimer />);
    
    // Check if state was loaded
    expect(screen.getAllByText('25:00').length).toBeGreaterThan(0);
    expect(screen.getByText('Saved task')).toBeInTheDocument();
  });

  it('toggles sound on and off', () => {
    render(<PomodoroTimer />);
    
    // Toggle sound off
    const soundButton = screen.getByLabelText('Mute sound');
    fireEvent.click(soundButton);
    
    // Check if sound was toggled off
    expect(screen.getByLabelText('Unmute sound')).toBeInTheDocument();
  });

  it('resets the timer', () => {
    render(<PomodoroTimer />);
    
    // Start the timer and let it run for a bit
    fireEvent.click(screen.getByText('Start'));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Reset the timer
    fireEvent.click(screen.getByText('Reset'));
    
    // Check if timer was reset to initial state
    expect(screen.getAllByText('25:00').length).toBeGreaterThan(0);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('handles settings changes', async () => {
    render(<PomodoroTimer />);
    
    // Open settings
    fireEvent.click(screen.getByLabelText('Settings'));
    
    // Change auto-start breaks switch instead of InputNumber to avoid AntD complex input issues
    const switches = screen.getAllByRole('switch');
    // Assuming the first switch is Auto-start breaks
    fireEvent.click(switches[0]);
    
    // Save settings
    fireEvent.click(screen.getByText('Save Settings'));
    
    // Wait for the settings to be applied
    await waitFor(() => {
      const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings') || '{}');
      expect(savedSettings.autoStartBreaks).toBe(false);
    });
  });
});
