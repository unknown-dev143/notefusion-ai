// src/test-utils/mocks/mediaMocks.ts

export class MockMediaStreamTrack implements MediaStreamTrack {
  id = 'mock-track-id';
  kind: 'audio' | 'video' = 'audio';
  label = 'Mock Microphone';
  enabled = true;
  muted = false;
  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  readyState: MediaStreamTrackState = 'live';
  onended: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  contentHint = '';
  
  getCapabilities(): MediaTrackCapabilities {
    return {};
  }
  
  getConstraints(): MediaTrackConstraints {
    return {} as MediaTrackConstraints;
  }
  
  getSettings(): MediaTrackSettings {
    return {} as MediaTrackSettings;
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

export class MockHTMLMediaElement implements HTMLMediaElement {
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
  
  // Required properties
  audioTracks: AudioTrackList = { length: 0 } as unknown as AudioTrackList;
  buffered: TimeRanges = { length: 0 } as unknown as TimeRanges;
  controller: MediaController | null = null;
  defaultMuted = false;
  defaultPlaybackRate = 1;
  disableRemotePlayback = false;
  mediaKeys: MediaKeys | null = null;
  preservesPitch = true;
  textTracks: TextTrackList = { length: 0 } as unknown as TextTrackList;
  videoTracks: VideoTrackList = { length: 0 } as unknown as VideoTrackList;
  autoplay = false;
  controls = false;
  crossOrigin: string | null = null;
  currentSrc = '';
  ended = false;
  loop = false;
  onencrypted: ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => any) | null = null;
  onwaitingforkey: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  playbackRate = 1;
  played: TimeRanges = { length: 0 } as unknown as TimeRanges;
  preload: '' | 'none' | 'metadata' | 'auto' = 'metadata';
  seekable: TimeRanges = { length: 0 } as unknown as TimeRanges;
  seeking = false;
  sinkId = '';
  srcObject: MediaProvider | null = null;
  
  // Event handlers
  onabort: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
  oncanplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  oncuechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  ondurationchange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onemptied: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onended: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onerror: ((this: HTMLMediaElement, ev: Event) => any) | null = null;
  onloadeddata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onloadstart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onplaying: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null = null;
  onratechange: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onresize: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null = null;
  onseeked: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onseeking: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onstalled: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  onsuspend: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
  
  // Event listener storage
  private _listeners: Record<string, EventListener[]> = {};

  // Core methods
  async play(): Promise<void> {
    if (!this.paused) return;
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }

  load(): void {
    this.dispatchEvent(new Event('loadstart'));
    this.dispatchEvent(new Event('loadedmetadata'));
    this.dispatchEvent(new Event('loadeddata'));
    this.dispatchEvent(new Event('canplay'));
  }

  // EventTarget implementation
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
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

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    if (!listener || !this._listeners[type]) return;
    
    this._listeners[type] = this._listeners[type].filter(l => 
      l !== listener && 
      (typeof listener !== 'function' ? l !== (listener as EventListenerObject).handleEvent : true)
    );
  }

  dispatchEvent(event: Event): boolean {
    const type = event.type;
    const listeners = this._listeners[type] || [];
    
    // Call all registered listeners
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

  getStartDate(): Date {
    return new Date();
  }

  // Required by TypeScript
  [Symbol.toStringTag] = 'HTMLMediaElement';
  HAVE_NOTHING = 0;
  HAVE_METADATA = 1;
  HAVE_CURRENT_DATA = 2;
  HAVE_FUTURE_DATA = 3;
  HAVE_ENOUGH_DATA = 4;
  NETWORK_EMPTY = 0;
  NETWORK_IDLE = 1;
  NETWORK_LOADING = 2;
  NETWORK_NO_SOURCE = 3;
}

export class MockMediaRecorder implements MediaRecorder {
  static isTypeSupported = (type: string): boolean => true;
  
  state: RecordingState = 'inactive';
  stream: MediaStream;
  mimeType: string;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  
  onstart: ((this: MediaRecorder, ev: Event) => any) | null = null;
  onstop: ((this: MediaRecorder, ev: Event) => any) | null = null;
  ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null = null;
  onpause: ((this: MediaRecorder, ev: Event) => any) | null = null;
  onresume: ((this: MediaRecorder, ev: Event) => any) | null = null;
  onerror: ((this: MediaRecorder, ev: Event) => any) | null = null;
  
  private _listeners: Record<string, EventListener[]> = {};

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    this.stream = stream;
    this.mimeType = options?.mimeType || 'audio/webm';
    this.audioBitsPerSecond = options?.audioBitsPerSecond || 128000;
    this.videoBitsPerSecond = options?.videoBitsPerSecond || 
      (options?.bitsPerSecond ? options.bitsPerSecond - this.audioBitsPerSecond : 0);
  }

  start(timeslice?: number): void {
    this.state = 'recording';
    this.dispatchEvent(new Event('start'));
    
    if (timeslice && this.ondataavailable) {
      setTimeout(() => {
        if (this.state === 'recording' && this.ondataavailable) {
          this.ondataavailable(new BlobEvent('dataavailable', { 
            data: new Blob() 
          }));
        }
      }, timeslice);
    }
  }

  stop(): void {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    
    if (this.ondataavailable) {
      this.ondataavailable(new BlobEvent('dataavailable', { 
        data: new Blob() 
      }));
    }
    
    this.dispatchEvent(new Event('stop'));
  }

  pause(): void {
    if (this.state === 'recording') {
      this.state = 'paused';
      this.dispatchEvent(new Event('pause'));
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'recording';
      this.dispatchEvent(new Event('resume'));
    }
  }

  requestData(): void {
    if (this.state === 'recording' && this.ondataavailable) {
      this.ondataavailable(new BlobEvent('dataavailable', { 
        data: new Blob() 
      }));
    }
  }

  addEventListener(
    type: string, 
    listener: EventListenerOrEventListenerObject | null, 
    options?: boolean | AddEventListenerOptions
  ): void {
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

  removeEventListener(
    type: string, 
    listener: EventListenerOrEventListenerObject | null, 
    options?: boolean | EventListenerOptions
  ): void {
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
}

export class MockAudioContext implements AudioContext {
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
  
  onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null = null;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
  
  // Stub implementations for required methods
  createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer {
    return {
      numberOfChannels,
      length,
      sampleRate,
      duration: length / sampleRate,
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
      getChannelData: vi.fn().mockReturnValue(new Float32Array(length)),
    } as unknown as AudioBuffer;
  }
  
  createBufferSource(): AudioBufferSourceNode {
    return {
      buffer: null,
      playbackRate: { value: 1 } as AudioParam,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as AudioBufferSourceNode;
  }
  
  // Add other required AudioContext methods as stubs
  createGain(): GainNode {
    return {
      gain: { value: 1 } as AudioParam,
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;
  }
  
  createOscillator(): OscillatorNode {
    return {
      frequency: { value: 440 } as AudioParam,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    } as unknown as OscillatorNode;
  }
  
  decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
    return Promise.resolve(this.createBuffer(2, 44100, 44100));
  }
  
  // Required by TypeScript
  [Symbol.toStringTag] = 'AudioContext';
  currentTime = 0;
  listener = {} as AudioListener;
}

export class MockBlobEvent extends Event {
  data: Blob;

  constructor(type: string, eventInit: { data: Blob }) {
    super(type, eventInit as EventInit);
    this.data = eventInit.data;
  }
}
