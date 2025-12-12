export class MockMediaStreamTrack implements MediaStreamTrack {
  id = 'mock-track-id';
  kind: 'audio' | 'video' = 'audio';
  label = 'Mock Microphone';
  enabled = true;
  muted = false;
  onmute = null;
  onunmute = null;
  readyState: MediaStreamTrackState = 'live';
  onended = null;
  contentHint = '';
  
  getCapabilities(): MediaTrackCapabilities {
    return {};
  }
  
  getConstraints(): MediaTrackConstraints {
    return {};
  }
  
  getSettings(): MediaTrackSettings {
    return {};
  }
  
  applyConstraints(constraints?: MediaTrackConstraints): Promise<void> {
    return Promise.resolve();
  }
  
  clone(): MediaStreamTrack {
    return new MockMediaStreamTrack();
  }
  
  stop(): void {}
  
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

export default MockMediaStreamTrack;
