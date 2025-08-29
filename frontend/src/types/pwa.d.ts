// Extend the Window interface to include PWA-related properties
declare interface Window {
  // PWA installation prompt
  deferredPrompt?: BeforeInstallPromptEvent;
  // PWA standalone mode check
  navigator: Navigator & {
    standalone?: boolean;
  };
}

// Define the BeforeInstallPromptEvent interface
declare interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Add the event type to the global scope
declare var BeforeInstallPromptEvent: {
  prototype: BeforeInstallPromptEvent;
  new(type: string, eventInitDict?: EventInit): BeforeInstallPromptEvent;
};
