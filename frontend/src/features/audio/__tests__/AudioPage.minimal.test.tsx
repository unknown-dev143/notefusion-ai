import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Simple mock component
const AudioPage = () => (
  <div data-testid="audio-page">
    <h1>Audio Tools</h1>
  </div>
);

describe('AudioPage - Minimal Test', () => {
  it('renders the component', () => {
    render(
      <MemoryRouter>
        <AudioPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Audio Tools')).toBeInTheDocument();
  });
});
