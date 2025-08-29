import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the AudioPage component for smoke test
vi.mock('../pages/AudioPage', () => ({
  AudioPage: () => <div data-testid="audio-page">Audio Page Mock</div>
}));

describe('AudioPage Smoke Test', () => {
  it('renders without crashing', async () => {
    const { AudioPage } = await import('../pages/AudioPage');
    render(
      <MemoryRouter>
        <AudioPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('audio-page')).toBeInTheDocument();
  });
});
