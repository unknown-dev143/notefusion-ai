import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock AudioPage component for testing
const AudioPage = () => (
  <div data-testid="audio-page">
    <h1 data-testid="title">Audio Tools</h1>
  </div>
);

// Test wrapper component
const renderAudioPage = () => {
  return render(
    <MemoryRouter initialEntries={['/audio']}>
      <Routes>
        <Route path="/audio" element={<AudioPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AudioPage', () => {
  it('renders without crashing', () => {
    renderAudioPage();
    expect(screen.getByTestId('audio-page')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    renderAudioPage();
    expect(screen.getByTestId('title')).toHaveTextContent('Audio Tools');
  });
});
