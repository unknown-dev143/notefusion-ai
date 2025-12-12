/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_ENABLE_COLLABORATION: string;
  readonly VITE_ENABLE_AI_FEATURES: string;
  readonly VITE_ENABLE_GAMIFICATION: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_RETRY_ATTEMPTS: string;
  readonly VITE_RETRY_DELAY: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_MAX_CACHE_SIZE: string;
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_PAGE_SIZE: string;
  readonly VITE_WS_RECONNECT_INTERVAL: string;
  readonly VITE_WS_MAX_RECONNECT_ATTEMPTS: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_ENABLE_CONSOLE_LOGGING: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_MOCK_API: string;
  readonly VITE_DEBUG_MODE: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
