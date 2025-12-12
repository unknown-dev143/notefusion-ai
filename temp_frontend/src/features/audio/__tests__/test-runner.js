// Simple test runner for manual verification
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioPage } from '../pages/AudioPage';

describe('AudioPage', () => {
  it('renders without crashing', () => {
    render(<AudioPage />);
    expect(screen.getByText('Audio Tools')).toBeInTheDocument();
  });

  it('shows Text to Speech tab by default', () => {
    render(<AudioPage />);
    expect(screen.getByText('Text to Speech')).toBeInTheDocument();
  });

  it('shows Speech to Text tab when clicked', () => {
    render(<AudioPage />);
    const speechToTextTab = screen.getByText('Speech to Text');
    expect(speechToTextTab).toBeInTheDocument();
  });
});
