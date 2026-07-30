// frontend/src/config.ts

/**
 * Utility to get environment variables from multiple sources:
 * 1. window._env_ (Runtime config from public/env-config.js)
 * 2. import.meta.env (Vite build-time config)
 * 3. process.env (Fallback/Legacy)
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  const viteKey = `VITE_${key}`;
  const reactKey = `REACT_APP_${key}`;

  return (
    (window as any)?._env_?.[viteKey] ||
    (window as any)?._env_?.[reactKey] ||
    (import.meta.env as any)?.[viteKey] ||
    (process.env as any)?.[reactKey] ||
    (process.env as any)?.[viteKey] ||
    defaultValue
  );
};

export const API_URL = getEnv('API_URL', 'http://localhost:8000/api/v1');
export const WS_URL = getEnv('WS_URL', 'ws://localhost:8000/ws');
export const APP_VERSION = getEnv('VERSION', '1.0.0');

export const FIREBASE_CONFIG = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
};

export const GOOGLE_CONFIG = {
  clientId: getEnv('GOOGLE_CLIENT_ID'),
  apiKey: getEnv('GOOGLE_API_KEY')
};

export const PAYMENT_CONFIG = {
  stripePublishableKey: getEnv('STRIPE_PUBLISHABLE_KEY'),
  lemonSqueezyVariantId: getEnv('LEMON_SQUEEZY_VARIANT_ID')
};

export const SUPPORT_CONFIG = {
  email: getEnv('SUPPORT_EMAIL', 'support@notefusion.ai'),
  termsUrl: getEnv('TERMS_URL', 'https://notefusion.ai/terms'),
  privacyUrl: getEnv('PRIVACY_URL', 'https://notefusion.ai/privacy')
};
