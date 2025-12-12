import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioNoteTaker } from '../components/AudioNoteTaker';
import '@testing-library/jest-dom/vitest';

// Import mock implementations
import {
  MockMediaStreamTrack,
  MockHTMLMediaElement,
  MockMediaRecorder,
  MockAudioContext,
  MockBlobEvent
} from '../../../test-utils/mocks/mediaMocks';

// Mock the global MediaStream
class MockMediaStream implements MediaStream {
  private _tracks: MediaStreamTrack[] = [new MockMediaStreamTrack()];
  
  getTracks(): MediaStreamTrack[] {
    return [...this._tracks];
  }
  
  getAudioTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'audio');
  }
  
  getVideoTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'video');
  }
  
  getTrackById(trackId: string): MediaStreamTrack | null {
    return this._tracks.find(track => track.id === trackId) || null;
  }
  
  addTrack(track: MediaStreamTrack): void {
    if (!this._tracks.some(t => t === track)) {
      this._tracks.push(track);
    }
  }
  
  removeTrack(track: MediaStreamTrack): void {
    this._tracks = this._tracks.filter(t => t !== track);
  }
  
  clone(): MediaStream {
    const newStream = new MockMediaStream();
    this._tracks.forEach(track => newStream.addTrack(track.clone()));
    return newStream;
  }
  
  // Required properties
  active = true;
  id = 'mock-stream-id';
  onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null = null;
  
  // EventTarget implementation
  private _listeners: Record<string, EventListener[]> = {};
  
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    if (!listener) return;
    
    const wrappedListener = (e: Event) => {
      if (typeof listener === 'function') {
        listener(e);
      } else if ('handleEvent' in listener) {
        listener.handleEvent(e);
      }
    };

    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(wrappedListener);
  }
  
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void {
    if (!listener || !this._listeners[type]) return;
    
    this._listeners[type] = this._listeners[type].filter(l => 
      l !== listener && 
      (typeof listener !== 'function' ? l !== (listener as EventListenerObject).handleEvent : true)
    );
  }
  
  dispatchEvent(event: Event): boolean {
    const type = event.type;
    const listeners = this._listeners[type] || [];
    
    for (const listener of [...listeners]) {
      try {
        listener.call(this, event);
      } catch (e) {
        console.error('Error in event listener', e);
      }
    }

    // Call the corresponding on* handler if it exists
    const handler = this[`on${type}` as keyof this];
    if (typeof handler === 'function') {
      try {
        (handler as Function).call(this, event);
      } catch (e) {
        console.error('Error in event handler', e);
      }
    }

    return !event.defaultPrevented;
  }
  
  // Required for TypeScript
  [Symbol.iterator](): IterableIterator<MediaStreamTrack> {
    return this._tracks[Symbol.iterator]();
  }
  
  getTrackById(trackId: string): MediaStreamTrack | null {
    return this._tracks.find(track => track.id === trackId) || null;
  }
  
  getTracks(): MediaStreamTrack[] {
    return [...this._tracks];
  }
  
  getAudioTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'audio');
  }
  
  getVideoTracks(): MediaStreamTrack[] {
    return this._tracks.filter(track => track.kind === 'video');
  }
  
  addTrack(track: MediaStreamTrack): void {
    if (!this._tracks.some(t => t === track)) {
      this._tracks.push(track);
      this.dispatchEvent(new Event('addtrack'));
    }
  }
  
  removeTrack(track: MediaStreamTrack): void {
    const index = this._tracks.indexOf(track);
    if (index !== -1) {
      this._tracks.splice(index, 1);
      this.dispatchEvent(new Event('removetrack'));
    }
  }
  
  clone(): MediaStream {
    const stream = new MockMediaStream();
    this._tracks.forEach(track => stream.addTrack(track.clone()));
    return stream;
  }
  
  toJSON(): any {
    return {};
  }
}

// Mock the global URL
class MockURL {
  static createObjectURL(blob: Blob): string {
    return `blob:${URL.createObjectURL(blob)}`;
  }
  
  static revokeObjectURL(url: string): void {
    // No-op for testing
  }
}
  // Core properties
  currentTime = 0;
  duration = 100;
  paused = true;
  volume = 1;
  muted = false;
  src = '';
  error: MediaError | null = null;
  readyState = 0;
  networkState = 0;
  
  // Required properties for TypeScript
  audioTracks = { length: 0 } as unknown as AudioTrackList;
  buffered = { length: 0 } as unknown as TimeRanges;
  controller = null;
  defaultMuted = false;
  defaultPlaybackRate = 1;
  disableRemotePlayback = false;
  mediaKeys = null;
  preservesPitch = true;
  textTracks = { length: 0 } as unknown as TextTrackList;
  videoTracks = { length: 0 } as unknown as VideoTrackList;
  
  // Event handlers
  onplay: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onpause: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  ontimeupdate: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onended: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onerror: ((this: HTMLMediaElement, ev: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => any) | null = null;
  
  // Additional HTMLMediaElement properties
  autoplay = false;
  controls = false;
  crossOrigin: string | null = null;
  currentSrc = '';
  defaultPlaybackRate = 1;
  ended = false;
  loop = false;
  mediaKeys: MediaKeys | null = null;
  onabort: ((this: HTMLMediaElement, ev: UIEvent) => any) | null = null;
  oncanplay: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  oncanplaythrough: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  oncuechange: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  ondurationchange: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onemptied: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onencrypted: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onloadeddata: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onloadedmetadata: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onloadstart: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onplaying: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onprogress: ((this: HTMLMediaElement, ev: ProgressEvent) => any) | null = null;
  onratechange: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onresize: ((this: HTMLMediaElement, ev: UIEvent) => any) | null = null;
  onseeked: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onseeking: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onstalled: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onsuspend: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onvolumechange: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onwaiting: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onwaitingforkey: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  playbackRate = 1;
  played: TimeRanges = { length: 0 } as unknown as TimeRanges;
  preload: '' | 'none' | 'metadata' | 'auto' = 'metadata';
  seekable: TimeRanges = { length: 0 } as unknown as TimeRanges;
  seeking = false;
  sinkId = '';
  srcObject: MediaProvider | null = null;
  
  // Event listeners storage
  private _listeners: Record<string, EventListener[]> = {};
  
  // Mock methods
  async play(): Promise<void> {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }
  
  pause(): void {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    if (!listener) return;
    const wrappedListener = typeof listener === 'function' 
      ? listener 
      : listener.handleEvent.bind(listener);
    
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(wrappedListener);
  }
  
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void {
    if (!listener || !this._listeners[type]) return;
    
    this._listeners[type] = this._listeners[type].filter(l => 
      l !== listener && 
      (typeof listener !== 'function' ? l !== (listener as EventListenerObject).handleEvent : true)
    );
  }
  
  dispatchEvent(event: Event): boolean {
    const type = event.type;
    const listeners = this._listeners[type] || [];
    
    for (const listener of [...listeners]) {
      try {
        (listener as EventListener).call(this, event);
      } catch (e) {
        console.error('Error in event listener', e);
      }
    }
    
    // Call the corresponding on* handler if it exists
    const handler = this[`on${type}` as keyof this];
    if (typeof handler === 'function') {
      try {
        (handler as Function).call(this, event);
      } catch (e) {
        console.error('Error in event handler', e);
      }
    }
    
    return !event.defaultPrevented;
  }
  
  // Stub out other required methods
  load(): void {}
  canPlayType(): CanPlayTypeResult { return 'maybe'; }
  addTextTrack(): TextTrack { return {} as TextTrack; }
  captureStream(): MediaStream { return new MediaStream(); }
  fastSeek(time: number): void { this.currentTime = time; }
  getStartDate(): Date { return new Date(); }
  
  // Required for TypeScript
  [Symbol.toStringTag] = 'HTMLMediaElement';
  
  // Static properties
  static HAVE_NOTHING = 0;
  static HAVE_METADATA = 1;
  static HAVE_CURRENT_DATA = 2;
  static HAVE_FUTURE_DATA = 3;
  static HAVE_ENOUGH_DATA = 4;
  static NETWORK_EMPTY = 0;
  static NETWORK_IDLE = 1;
  static NETWORK_LOADING = 2;
  static NETWORK_NO_SOURCE = 3;
  seeking = false;
  sinkId: string = '';
  src = '';
  srcObject: MediaProvider | null = null;
  textTracks: TextTrackList = { length: 0 } as unknown as TextTrackList;
  videoTracks: VideoTrackList = { length: 0 } as unknown as VideoTrackList;
  volume = 1;
  
  // Event handlers (simplified for testing)
  onabort: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
  oncanplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  oncuechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  ondurationchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onemptied: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onended: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onerror: ((this: GlobalEventHandlers, ev: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => any) | null = null;
  onloadeddata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onloadstart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onplaying: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent<EventTarget>) => any) | null = null;
  onratechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onresize: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
  onseeked: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onseeking: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onstalled: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onsuspend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  
  // Mock implementations
  play = vi.fn(async (): Promise<void> => {
    this.paused = false;
    if (this.onplay) this.onplay(new Event('play'));
    if (this.onplaying) this.onplaying(new Event('playing'));
  });
  
  pause = vi.fn((): void => {
    if (!this.paused) {
      this.paused = true;
      if (this.onpause) this.onpause(new Event('pause'));
    }
  });
  
  dispatchEvent = vi.fn((event: Event): boolean => {
    // Simplified implementation for testing
    return true;
  });
  
  // Stub implementations for required methods
  addTextTrack(kind: TextTrackKind, label?: string, language?: string): TextTrack {
    return {} as TextTrack;
  }
  
  canPlayType(type: string): CanPlayTypeResult {
    return 'maybe';
  }
  
  captureStream(): MediaStream {
    return new MediaStream();
  }
  
  fastSeek(time: number): void {
    this.currentTime = time;
  }
  
  load(): void {
    // Implementation
  }
  
  pause(): void {
    this.paused = true;
    if (this.onpause) this.onpause(new Event('pause'));
  }
  
  async play(): Promise<void> {
    this.paused = false;
    if (this.onplay) this.onplay(new Event('play'));
    if (this.onplaying) this.onplaying(new Event('playing'));
  }
  
  // EventTarget implementation (only one implementation needed)
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    // Simplified implementation for testing
    if (!listener) return;
    
    const handler = (e: Event) => {
      if (typeof listener === 'function') {
        listener(e);
      } else if ('handleEvent' in listener) {
        listener.handleEvent(e);
      }
    };
    
    // Map event types to handlers
    switch (type) {
      case 'play': this.onplay = handler; break;
      case 'pause': this.onpause = handler; break;
      case 'ended': this.onended = handler; break;
      case 'timeupdate': this.ontimeupdate = handler; break;
      case 'loadedmetadata': this.onloadedmetadata = handler; break;
      case 'error': this.onerror = handler; break;
    }
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    // Implementation to remove event listeners
    if (!listener) return;
    
    const handler = (e: Event) => {
      if (typeof listener === 'function') {
        listener(e);
      } else if ('handleEvent' in listener) {
        listener.handleEvent(e);
      }
    };
    
    // Clear the appropriate handler
    switch (type) {
      case 'play': if (this.onplay === handler) this.onplay = null; break;
      case 'pause': if (this.onpause === handler) this.onpause = null; break;
      case 'ended': if (this.onended === handler) this.onended = null; break;
      case 'timeupdate': if (this.ontimeupdate === handler) this.ontimeupdate = null; break;
      case 'loadedmetadata': if (this.onloadedmetadata === handler) this.onloadedmetadata = null; break;
      case 'error': if (this.onerror === handler) this.onerror = null; break;
    }
  }

  dispatchEvent(event: Event): boolean {
    // Simplified implementation for testing
    const handler = this[`on${event.type}` as keyof this];
    if (typeof handler === 'function') {
      (handler as Function).call(this, event);
    }
    return !event.defaultPrevented;
  }
  
  // Required from EventTarget
  [Symbol.toStringTag] = 'HTMLMediaElement';
  
  // Mock HTMLMediaElement
  static readonly HAVE_NOTHING = 0 as const;
  static readonly HAVE_METADATA = 1 as const;
  static readonly HAVE_CURRENT_DATA = 2 as const;
  static readonly HAVE_FUTURE_DATA = 3 as const;
  static readonly HAVE_ENOUGH_DATA = 4 as const;
  static readonly NETWORK_EMPTY = 0 as const;
  static readonly NETWORK_IDLE = 1 as const;
  static readonly NETWORK_LOADING = 2 as const;
  static readonly NETWORK_NO_SOURCE = 3 as const;
}

// Set up global mocks
beforeAll(() => {
  // Mock HTMLMediaElement
  global.HTMLMediaElement = MockHTMLMediaElement as any;
  
  // Mock MediaRecorder
  global.MediaRecorder = MockMediaRecorder as any;
  
  // Mock AudioContext
  global.AudioContext = MockAudioContext as any;
  global.webkitAudioContext = MockAudioContext as any;
  
  // Mock BlobEvent
  global.BlobEvent = MockBlobEvent as any;
  
  // Mock URL
  global.URL = {
    ...URL,
    createObjectURL: vi.fn().mockImplementation(blob => `blob:mock-url/${blob.type}`),
    revokeObjectURL: vi.fn()
  };
  
  // Mock navigator.mediaDevices
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
      enumerateDevices: vi.fn().mockResolvedValue([
        {
          deviceId: 'default',
          kind: 'audioinput',
          label: 'Default Microphone',
          groupId: 'default-group',
          toJSON: () => ({})
        }
      ])
    },
    writable: true
  });
  // Mock navigator.mediaDevices
  const mockMediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn(),
        kind: 'audio',
        enabled: true,
        id: 'mock-track-id',
        label: 'Mock Audio Input',
        muted: false,
        onended: null,
        onmute: null,
        onunmute: null,
        readyState: 'live',
        contentHint: '',
        getConstraints: () => ({}),
        getSettings: () => ({}),
        applyConstraints: vi.fn().mockResolvedValue(undefined),
        clone: () => ({} as MediaStreamTrack),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
      getTrackById: () => null,
      addTrack: () => {},
      removeTrack: () => {},
      clone: () => ({} as MediaStream),
      onaddtrack: null,
      onremovetrack: null,
      active: true,
      id: 'mock-stream-id',
      onactive: null,
      oninactive: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }),
    enumerateDevices: vi.fn().mockResolvedValue([{
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default Microphone',
      groupId: 'default-group',
      toJSON: () => ({})
    }])
  };

  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: mockMediaDevices,
    writable: true,
    configurable: true
  });

  // MockMediaStreamTrack is defined above
  
    // Create a mock MediaRecorder class
  class MockMediaRecorder {
    static isTypeSupported = (): boolean => true;
    
    // Required MediaRecorder properties
    state: RecordingState = 'inactive';
    stream: MediaStream;
    mimeType = 'audio/webm';
    videoBitsPerSecond = 0;
    audioBitsPerSecond = 128000; // Default audio bitrate
    
    // Event handlers
    onstart: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onstop: ((this: MediaRecorder, ev: Event) => any) | null = null;
    ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null = null;
    onpause: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onresume: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onerror: ((this: MediaRecorder, ev: Event) => any) | null = null;
    
    // Mock implementations
    start = vi.fn((timeslice?: number): void => {
      this.state = 'recording';
      if (this.onstart) this.onstart(new Event('start'));
      
      // If timeslice is provided, simulate periodic dataavailable events
      if (timeslice && this.ondataavailable) {
        setTimeout(() => {
          if (this.state === 'recording' && this.ondataavailable) {
            this.ondataavailable(new BlobEvent('dataavailable', { 
              data: new Blob() 
            }));
          }
        }, timeslice);
      }
    });
    
    stop = vi.fn((): void => {
      if (this.state === 'inactive') return;
      
      this.state = 'inactive';
      
      // Trigger final dataavailable event
      if (this.ondataavailable) {
        this.ondataavailable(new BlobEvent('dataavailable', { 
          data: new Blob() 
        }));
      }
      
      // Trigger stop event
      if (this.onstop) {
        this.onstop(new Event('stop'));
      }
    });
    
    pause = vi.fn((): void => {
      if (this.state === 'recording') {
        this.state = 'paused';
        if (this.onpause) this.onpause(new Event('pause'));
      }
    });
    
    resume = vi.fn((): void => {
      if (this.state === 'paused') {
        this.state = 'recording';
        if (this.onresume) this.onresume(new Event('resume'));
      }
    });
    
    requestData = vi.fn((): void => {
      if (this.state === 'recording' && this.ondataavailable) {
        this.ondataavailable(new BlobEvent('dataavailable', { 
          data: new Blob() 
        }));
      }
    });
    
    constructor(stream: MediaStream, options?: MediaRecorderOptions) {
      this.stream = stream;
      if (options?.mimeType) {
        this.mimeType = options.mimeType;
      }
      if (options?.audioBitsPerSecond) {
        this.audioBitsPerSecond = options.audioBitsPerSecond;
      }
      if (options?.videoBitsPerSecond) {
        this.videoBitsPerSecond = options.videoBitsPerSecond;
      } else if (options?.bitsPerSecond) {
        // If only bitsPerSecond is provided, split between audio and video
        this.audioBitsPerSecond = options.bitsPerSecond;
      }
    }
    
    addEventListener = vi.fn((
      type: string, 
      listener: EventListenerOrEventListenerObject | null, 
      options?: boolean | AddEventListenerOptions
    ): void => {
      if (!listener) return;
      
      const callback = typeof listener === 'function' 
        ? listener 
        : listener.handleEvent;
      
      switch (type) {
        case 'dataavailable':
          this.ondataavailable = callback as (ev: BlobEvent) => void;
          break;
        case 'start':
          this.onstart = callback as (ev: Event) => void;
          break;
        case 'stop':
          this.onstop = callback as (ev: Event) => void;
          break;
        case 'pause':
          this.onpause = callback as (ev: Event) => void;
          break;
        case 'resume':
          this.onresume = callback as (ev: Event) => void;
          break;
        case 'error':
          this.onerror = callback as (ev: Event) => void;
          break;
      }
    });
    
    removeEventListener = vi.fn((
      type: string, 
      listener: EventListenerOrEventListenerObject | null, 
      options?: boolean | EventListenerOptions
    ): void => {
      if (!listener) return;
      
      const callback = typeof listener === 'function' 
        ? listener 
        : listener.handleEvent;
      
      switch (type) {
        case 'dataavailable':
          if (this.ondataavailable === callback) this.ondataavailable = null;
          break;
        case 'start':
          if (this.onstart === callback) this.onstart = null;
          break;
        case 'stop':
          if (this.onstop === callback) this.onstop = null;
          break;
        case 'pause':
          if (this.onpause === callback) this.onpause = null;
          break;
        case 'resume':
          if (this.onresume === callback) this.onresume = null;
          break;
        case 'error':
          if (this.onerror === callback) this.onerror = null;
          break;
      }
    });
    
    dispatchEvent = vi.fn((event: Event): boolean => {
      // Simplified implementation for testing
      return true;
    });
  }
  
  // Assign to global
  global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

  // Mock the AudioContext
  class MockAudioContext {
    createMediaStreamSource = vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      context: this,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 2,
      channelCountMode: 'max',
      channelInterpretation: 'speakers',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    createAnalyser = vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      fftSize: 2048,
      minDecibels: -100,
      maxDecibels: -30,
      smoothingTimeConstant: 0.8,
      context: this,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 2,
      channelCountMode: 'max',
      channelInterpretation: 'speakers',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    close = vi.fn().mockResolvedValue(undefined);
    suspend = vi.fn().mockResolvedValue(undefined);
    resume = vi.fn().mockResolvedValue(undefined);
    state = 'suspended';
    sampleRate = 44100;
    baseLatency = 0.01;
    outputLatency = 0.01;
    audioWorklet = {
      addModule: vi.fn().mockResolvedValue(undefined)
    };
    destination = {
      channelCount: 2,
      connect: vi.fn(),
      disconnect: vi.fn(),
      context: this,
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCountMode: 'max',
      channelInterpretation: 'speakers',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    };
    onstatechange = null;
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  }

  global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
});

afterEach(() => {
  vi.clearAllMocks();
  // Reset all HTMLMediaElement mocks
  const mediaElements = document.querySelectorAll('audio, video');
  mediaElements.forEach(el => {
    const htmlEl = el as HTMLMediaElement;
    htmlEl.pause();
    htmlEl.currentTime = 0;
  });
});

describe('AudioNoteTaker', () => {
  const mockOnSave = vi.fn();
  
  // Create a mock MediaRecorder class
  class MockMediaRecorder {
    static isTypeSupported = (type: string): boolean => true;
    
    // Required MediaRecorder properties
    state: RecordingState = 'inactive';
    stream: MediaStream;
    mimeType = 'audio/webm';
    videoBitsPerSecond = 0;
    audioBitsPerSecond = 128000; // Default audio bitrate
    
    // Event handlers
    onstart: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onstop: ((this: MediaRecorder, ev: Event) => any) | null = null;
    ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null = null;
    onpause: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onresume: ((this: MediaRecorder, ev: Event) => any) | null = null;
    onerror: ((this: MediaRecorder, ev: Event) => any) | null = null;
    
    // Mock implementations
    start = vi.fn((timeslice?: number): void => {
      this.state = 'recording';
      if (this.onstart) this.onstart(new Event('start'));
      
      // If timeslice is provided, simulate periodic dataavailable events
      if (timeslice && this.ondataavailable) {
        setTimeout(() => {
          if (this.state === 'recording' && this.ondataavailable) {
            this.ondataavailable(new BlobEvent('dataavailable', { 
              data: new Blob() 
            }));
          }
        }, timeslice);
      }
    });
    
    stop = vi.fn((): void => {
      if (this.state === 'inactive') return;
      
      this.state = 'inactive';
      
      // Trigger final dataavailable event
      if (this.ondataavailable) {
        this.ondataavailable(new BlobEvent('dataavailable', { 
          data: new Blob() 
        }));
      }
      
      // Trigger stop event
      if (this.onstop) {
        this.onstop(new Event('stop'));
      }
    });
    
    pause = vi.fn((): void => {
      if (this.state === 'recording') {
        this.state = 'paused';
        if (this.onpause) this.onpause(new Event('pause'));
      }
    });
    
    resume = vi.fn((): void => {
      if (this.state === 'paused') {
        this.state = 'recording';
        if (this.onresume) this.onresume(new Event('resume'));
      }
    });
    
    requestData = vi.fn((): void => {
      if (this.state === 'recording' && this.ondataavailable) {
        this.ondataavailable(new BlobEvent('dataavailable', { 
          data: new Blob() 
        }));
      }
    });
    
    constructor(stream: MediaStream, options?: MediaRecorderOptions) {
      this.stream = stream;
      if (options?.mimeType) {
        this.mimeType = options.mimeType;
      }
      if (options?.audioBitsPerSecond) {
        this.audioBitsPerSecond = options.audioBitsPerSecond;
      }
      if (options?.videoBitsPerSecond) {
        this.videoBitsPerSecond = options.videoBitsPerSecond;
      } else if (options?.bitsPerSecond) {
        // If only bitsPerSecond is provided, use it for audio
        this.audioBitsPerSecond = options.bitsPerSecond;
      }
    }
    
    addEventListener = vi.fn((
      type: string, 
      listener: EventListenerOrEventListenerObject | null, 
      options?: boolean | AddEventListenerOptions
    ): void => {
      if (!listener) return;
      
      const callback = typeof listener === 'function' 
        ? listener 
        : listener.handleEvent;
      
      switch (type) {
        case 'dataavailable':
          this.ondataavailable = callback as (ev: BlobEvent) => void;
          break;
        case 'start':
          this.onstart = callback as (ev: Event) => void;
          break;
        case 'stop':
          this.onstop = callback as (ev: Event) => void;
          break;
        case 'pause':
          this.onpause = callback as (ev: Event) => void;
          break;
        case 'resume':
          this.onresume = callback as (ev: Event) => void;
          break;
        case 'error':
          this.onerror = callback as (ev: Event) => void;
          break;
      }
    });
    
    removeEventListener = vi.fn((
      type: string, 
      listener: EventListenerOrEventListenerObject | null, 
      options?: boolean | EventListenerOptions
    ): void => {
      if (!listener) return;
      
      const callback = typeof listener === 'function' 
        ? listener 
        : listener.handleEvent;
      
      switch (type) {
        case 'dataavailable':
          if (this.ondataavailable === callback) this.ondataavailable = null;
          break;
        case 'start':
          if (this.onstart === callback) this.onstart = null;
          break;
        case 'stop':
          if (this.onstop === callback) this.onstop = null;
          break;
        case 'pause':
          if (this.onpause === callback) this.onpause = null;
          break;
        case 'resume':
          if (this.onresume === callback) this.onresume = null;
          break;
        case 'error':
          if (this.onerror === callback) this.onerror = null;
          break;
      }
    });
    
    dispatchEvent = vi.fn((event: Event): boolean => {
      // Simplified implementation for testing
      return true;
    });
  }
  
  global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [new MockMediaStreamTrack()],
          getAudioTracks: () => [new MockMediaStreamTrack()],
          getVideoTracks: () => [],
          getTrackById: () => new MockMediaStreamTrack(),
          addTrack: () => {},
          removeTrack: () => {},
          clone: () => ({} as MediaStream),
          onaddtrack: null,
          onremovetrack: null,
          active: true,
          id: 'mock-stream-id',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        } as MediaStream),
        enumerateDevices: vi.fn().mockResolvedValue([{
          deviceId: 'default',
          kind: 'audioinput',
          label: 'Default Microphone',
          groupId: 'default-group'
        }]),
      },
      configurable: true,
      writable: true,
    });
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      return window.setTimeout(callback, 0);
    });
    
    // Mock window.URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-audio-url');
    
    // Mock the Audio constructor
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      duration: 100,
      ontimeupdate: null,
      onplay: null,
      onpause: null,
      onended: null,
      onerror: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = vi.fn((id) => {
      clearTimeout(id);
    });
  });

  it('renders the component with initial state', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    expect(screen.getByText(/audio notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add a note at the current time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('starts and stops recording', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Verify recording started
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    // Verify recording stopped
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    });
  });

  it('adds a note', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Add a note
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    // Verify note was added
    await waitFor(() => {
      expect(screen.getByText('Test note')).toBeInTheDocument();
      // Save button should be enabled now
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });
  });

  it('saves notes', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording and add a note
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    // Save notes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Verify onSave was called with the note
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          content: 'Test note',
        })
      ]));
    });
  });

  it('seeks to timestamp when clicking on a note', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording and add a note
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(addButton);
    });
    
    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    // Get the audio element and mock play
    const audioElement = document.querySelector('audio');
    const playSpy = vi.spyOn(audioElement!, 'play').mockResolvedValue();
    
    // Click on the note timestamp
    const timestampButton = screen.getByText(/0:00/);
    await act(async () => {
      fireEvent.click(timestampButton);
    });
    
    // Verify play was called
    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled();
    });
    
    // Cleanup
    playSpy.mockRestore();
  });
  
  it('handles microphone access denied', async () => {
    // Mock getUserMedia to reject with an error
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
        enumerateDevices: vi.fn().mockResolvedValue([])
      },
      configurable: true,
      writable: true
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Try to start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Verify error handling
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error accessing microphone:', expect.any(Error));
    });
    
    // Verify UI shows error state
    expect(screen.getByText(/error accessing microphone/i)).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
  
  it('handles empty note submission', async () => {
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Try to add empty note
    const addButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Verify no note was added
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
  
  it('handles long note text', async () => {
    const longNote = 'a'.repeat(1000); // Very long note
    
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Add a very long note
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: longNote } });
      fireEvent.click(addButton);
    });
    
    // Verify note was added (UI should handle long text appropriately)
    const noteElement = screen.getByText(longNote.substring(0, 100)); // Check first 100 chars
    expect(noteElement).toBeInTheDocument();
    
    // Stop recording and save
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Verify long note was saved correctly
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          content: longNote,
        })
      ]));
    });
  });
  
  it('handles special characters in notes', async () => {
    const specialNote = 'Note with special chars: !@#$%^&*()_+{}[]|\\:;\'\"<>,.?/`~';
    
    await act(async () => {
      render(<AudioNoteTaker onSave={mockOnSave} />);
    });
    
    // Start recording
    const startButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Add a note with special characters
    const noteInput = screen.getByPlaceholderText(/add a note at the current time/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      fireEvent.change(noteInput, { target: { value: specialNote } });
      fireEvent.click(addButton);
    });
    
    // Verify note was added with special characters
    const noteElement = screen.getByText(specialNote);
    expect(noteElement).toBeInTheDocument();
    
    // Stop recording and save
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Verify note with special characters was saved correctly
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          content: specialNote,
        })
      ]));
    });
  });
});
