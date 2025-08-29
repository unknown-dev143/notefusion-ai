import React from 'react';

const AudioPage = () => {
  return (
    <div data-testid="audio-page">
      <h1>Audio Page</h1>
      <button data-testid="record-button">Record</button>
      <div data-testid="audio-visualizer"></div>
    </div>
  );
};

export default AudioPage;
