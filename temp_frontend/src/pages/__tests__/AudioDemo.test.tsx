import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AudioDemo from '../AudioDemo';

// Mock the AudioRecorder component
jest.mock('../../components/ui/AudioRecorder', () => {
  return function MockAudioRecorder({ onSave }: { onSave: (title: string, audioUrl: string) => void }) {
    const handleSave = () => {
      onSave('Test Note', 'mock-audio-url');
    };

    return (
      <div data-testid="mock-audio-recorder">
        <button onClick={handleSave} data-testid="mock-save-button">
          Save Recording
        </button>
      </div>
    );
  };
});

describe('AudioDemo Page', () => {
  const renderAudioDemo = () => {
    return render(
      <BrowserRouter>
        <AudioDemo />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Mock the HTMLMediaElement
    window.HTMLMediaElement.prototype.play = jest.fn();
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  it('renders the audio demo page', () => {
    renderAudioDemo();
    expect(screen.getByText('Audio Notes Demo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-audio-recorder')).toBeInTheDocument();
  });

  it('adds a new audio note when saved', async () => {
    renderAudioDemo();
    
    // Click the save button in our mock AudioRecorder
    fireEvent.click(screen.getByTestId('mock-save-button'));
    
    // Check that the note was added to the list
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
  });

  it('plays an audio note when play button is clicked', async () => {
    // Add a note first
    const { container } = renderAudioDemo();
    fireEvent.click(screen.getByTestId('mock-save-button'));
    
    // Wait for the note to be added
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
    
    // Find and click the play button
    const playButton = screen.getByLabelText('play');
    fireEvent.click(playButton);
    
    // Check that the play method was called
    await waitFor(() => {
      const audioElement = container.querySelector('audio');
      expect(audioElement?.play).toHaveBeenCalled();
    });
  });

  it('deletes an audio note when delete button is clicked', async () => {
    renderAudioDemo();
    
    // Add a note first
    fireEvent.click(screen.getByTestId('mock-save-button'));
    
    // Wait for the note to be added
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
    
    // Click the delete button
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    
    // Check that the note was removed
    await waitFor(() => {
      expect(screen.queryByText('Test Note')).not.toBeInTheDocument();
    });
  });

  it('shows "No audio notes yet" message when there are no notes', () => {
    renderAudioDemo();
    expect(screen.getByText('No audio notes yet. Record one above!')).toBeInTheDocument();
  });
});
