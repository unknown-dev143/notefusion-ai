// src/mocks/mediaMocks.ts
// Centralised mocks for browser media APIs used in audio component tests.

// Mock MediaStream (with a single dummy track)
const mockMediaTrack = {
  stop: vi.fn(),
  kind: 'audio',
  id: 'mock-track-id',
  label: 'Mock Audio Track',
  enabled: true,
} as any;

const mockMediaStream = {
  getTracks: () => [mockMediaTrack],
  getAudioTracks: () => [mockMediaTrack],
  getVideoTracks: () => [],
  getTrackById: () => null,
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn(() => mockMediaStream),
  active: true,
  id: 'mock-stream-id',
} as any;

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
  },
  writable: true,
});

// Mock AudioContext / webkitAudioContext
window.AudioContext = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  state: 'running',
})) as any;
window.webkitAudioContext = window.AudioContext;

// Mock MediaRecorder
window.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
})) as any;

// Mock URL.createObjectURL / revokeObjectURL
window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
window.URL.revokeObjectURL = vi.fn();
