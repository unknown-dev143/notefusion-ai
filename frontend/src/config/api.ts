// API Configuration
const API_BASE_URL = 
  (typeof window !== 'undefined' && (window as any)._env_?.REACT_APP_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TOKENS: {
    BALANCE: `${API_BASE_URL}/api/v1/tokens/balance`,
    USE: `${API_BASE_URL}/api/v1/tokens/use`,
    EARN: `${API_BASE_URL}/api/v1/tokens/earn`,
    HISTORY: `${API_BASE_URL}/api/v1/tokens/history`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  },
  CHAT: `${API_BASE_URL}/api/v1/chat`,
};

export default API_CONFIG;
