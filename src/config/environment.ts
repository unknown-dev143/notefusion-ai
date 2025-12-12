// Environment configuration
export const ENVIRONMENT = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000',
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.NODE_ENV === 'development',
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
  
  // Authentication
  TOKEN_REFRESH_INTERVAL: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL || '300000'), // 5 minutes
  TOKEN_EXPIRY_BUFFER: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_BUFFER || '300000'), // 5 minutes
  
  // File Upload
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600'), // 100MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/*',
    'audio/*',
    'video/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  
  // Features
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  ENABLE_COLLABORATION: import.meta.env.VITE_ENABLE_COLLABORATION !== 'false',
  ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
  ENABLE_GAMIFICATION: import.meta.env.VITE_ENABLE_GAMIFICATION !== 'false',
  
  // Performance
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'), // 30 seconds
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(import.meta.env.VITE_RETRY_DELAY || '1000'), // 1 second
  
  // Cache
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000'), // 5 minutes
  MAX_CACHE_SIZE: parseInt(import.meta.env.VITE_MAX_CACHE_SIZE || '50'), // 50 items
  
  // UI
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'),
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  
  // WebSocket
  WS_RECONNECT_INTERVAL: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL || '5000'), // 5 seconds
  WS_MAX_RECONNECT_ATTEMPTS: parseInt(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS || '10'),
  
  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  ENABLE_CONSOLE_LOGGING: import.meta.env.VITE_ENABLE_CONSOLE_LOGGING !== 'false',
  
  // External Services
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  
  // Development
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

// Type definitions
export type Environment = typeof ENVIRONMENT;

// Environment validation
export const validateEnvironment = (): void => {
  const required = [
    'API_BASE_URL',
  ];
  
  const missing = required.filter(key => !ENVIRONMENT[key as keyof Environment]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    
    if (ENVIRONMENT.IS_PRODUCTION) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // Log configuration in development
  if (ENVIRONMENT.IS_DEVELOPMENT) {
    console.log('Environment Configuration:', ENVIRONMENT);
  }
};

// Environment-specific configurations
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ENVIRONMENT.API_BASE_URL.endsWith('/') 
    ? ENVIRONMENT.API_BASE_URL.slice(0, -1)
    : ENVIRONMENT.API_BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint.slice(1)
    : endpoint;
  
  return `${baseUrl}/${cleanEndpoint}`;
};

export const getWebSocketUrl = (path?: string): string => {
  const baseUrl = ENVIRONMENT.WEBSOCKET_URL.endsWith('/')
    ? ENVIRONMENT.WEBSOCKET_URL.slice(0, -1)
    : ENVIRONMENT.WEBSOCKET_URL;
  
  if (!path) return baseUrl;
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

export const isFeatureEnabled = (feature: keyof Pick<typeof ENVIRONMENT, 'ENABLE_ANALYTICS' | 'ENABLE_COLLABORATION' | 'ENABLE_AI_FEATURES' | 'ENABLE_GAMIFICATION'>): boolean => {
  return ENVIRONMENT[feature];
};

export const getLogLevel = (): 'error' | 'warn' | 'info' | 'debug' => {
  const level = ENVIRONMENT.LOG_LEVEL.toLowerCase();
  return ['error', 'warn', 'info', 'debug'].includes(level) 
    ? level as 'error' | 'warn' | 'info' | 'debug'
    : 'info';
};
