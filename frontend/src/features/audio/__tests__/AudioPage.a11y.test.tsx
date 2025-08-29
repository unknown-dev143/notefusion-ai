import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeAll } from 'vitest';
import { axe } from 'jest-axe';
import '@testing-library/jest-dom';

// Mock the child components to simplify testing
vi.mock('../components/TextToSpeech', () => ({
  TextToSpeech: () => <div>Text to Speech Component</div>,
}));

vi.mock('../components/SpeechToText', () => ({
  SpeechToText: () => <div>Speech to Text Component</div>,
}));

vi.mock('../components/AudioTranscriber', () => ({
  AudioTranscriber: () => <div>Audio Transcriber Component</div>,
}));

vi.mock('../components/AudioNoteTaker', () => ({
  AudioNoteTaker: () => <div>Audio Note Taker Component</div>,
}));

// Import after mocks
import { AudioPage } from '../pages/AudioPage';

describe('AudioPage Accessibility', () => {
  const renderComponent = (initialRoute = '/audio') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/audio" element={<AudioPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeAll(() => {
    // Mock window.matchMedia which is used by Ant Design
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderComponent();
    // Wait for the component to be fully rendered
    await screen.findByRole('tablist');
    // Test accessibility with the container
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes for tabs', () => {
    renderComponent();
    
    // Check tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    
    // Check tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
    
    // Check the first tab is selected by default
    const firstTab = tabs[0];
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    
    // Check other tabs are not selected
    tabs.slice(1).forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected', 'false');
    });
    
    // Check tab panel
    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();
    expect(tabPanel).toBeVisible();
  });

  it('should have proper heading structure', () => {
    renderComponent();
    
    // Check main heading
    const mainHeading = screen.getByRole('heading', { level: 2, name: /audio tools/i });
    expect(mainHeading).toBeInTheDocument();
    
    // Check tab labels
    const tabLabels = [
      /text to speech/i,
      /speech to text/i,
      /audio transcriber/i,
      /audio notes/i
    ];
    
    tabLabels.forEach(label => {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    });
  });

  it('should have proper keyboard navigation', () => {
    renderComponent();
    
    // Get all tabs
    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];
    const secondTab = tabs[1];
    const lastTab = tabs[tabs.length - 1];
    
    // Focus the first tab
    firstTab.focus();
    expect(document.activeElement).toBe(firstTab);
    
    // Test right arrow key navigation
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(secondTab);
    
    // Test left arrow key
    fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(firstTab);
    
    // Test Home key
    fireEvent.keyDown(firstTab, { key: 'Home' });
    expect(document.activeElement).toBe(firstTab);
    
    // Test End key
    fireEvent.keyDown(firstTab, { key: 'End' });
    expect(document.activeElement).toBe(lastTab);
  });
});
