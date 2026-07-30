import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AudioDemo from '../AudioDemo';

describe('AudioDemo Page', () => {
  const renderAudioDemo = () => {
    return render(
      <BrowserRouter>
        <AudioDemo />
      </BrowserRouter>
    );
  };

  it('renders the audio demo page', () => {
    renderAudioDemo();
    expect(screen.getByText('Audio Fusion Engine')).toBeInTheDocument();
    expect(screen.getByText('Fusion Vault')).toBeInTheDocument();
  });

  it('toggles recording state', () => {
    renderAudioDemo();
    
    // Find the record button by checking its text content before and after click
    const button = screen.getByRole('button', { name: /🎤|⏹/i });
    expect(button.textContent).toContain('🎤');
    
    // Click to start recording
    fireEvent.click(button);
    expect(button.textContent).toContain('⏹');
    expect(screen.getByText('Recording Live')).toBeInTheDocument();
  });
});
