import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a cryptographically secure random token
 * @param length - Length of the token (default: 32)
 * @returns A secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for non-browser environments (Node.js)
    const crypto = require('crypto');
    crypto.randomFillSync(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Validates if a string is a valid UUID
 * @param uuid - String to validate
 * @returns boolean indicating if the string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Securely hashes a string using SHA-256
 * @param message - The message to hash
 * @returns A promise that resolves to the hashed string
 */
export const hashString = async (message: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for non-browser environments (Node.js)
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(message).digest('hex');
};

/**
 * Generates a CSRF token and stores it in the session storage
 * @returns The generated CSRF token
 */
export const generateCSRFToken = (): string => {
  const token = uuidv4();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf-token', token);
  }
  return token;
};

/**
 * Validates a CSRF token against the one stored in session storage
 * @param token - The token to validate
 * @returns boolean indicating if the token is valid
 */
export const validateCSRFToken = (token: string): boolean => {
  if (typeof window === 'undefined') return false;
  const storedToken = sessionStorage.getItem('csrf-token');
  return token === storedToken;
};

/**
 * Sets security headers for HTTP requests
 * @param headers - Optional existing headers to extend
 * @returns Headers object with security headers
 */
export const getSecureHeaders = (headers: HeadersInit = {}): HeadersInit => {
  const csrfToken = generateCSRFToken();
  
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Feature-Policy': "geolocation 'none'; microphone 'none'; camera 'none'",
    'X-CSRF-Token': csrfToken,
    ...headers
  };
};

/**
 * Encrypts data using AES-GCM
 * @param data - The data to encrypt (string or object)
 * @param secret - The secret key (must be 32 bytes for AES-256)
 * @returns The encrypted data as a base64 string
 */
export const encryptData = async (
  data: string | object,
  secret: string
): Promise<string> => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret.padEnd(32, '0').slice(0, 32));
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(text);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...result));
  } else {
    // Node.js environment
    const crypto = require('crypto');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(secret.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]).toString('base64');
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedData - The encrypted data as a base64 string
 * @param secret - The secret key used for encryption
 * @returns The decrypted data as a string
 */
export const decryptData = async (
  encryptedData: string,
  secret: string
): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser environment
      const decoder = new TextDecoder();
      const keyData = new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32));
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      return decoder.decode(decrypted);
    } else {
      // Node.js environment
      const crypto = require('crypto');
      const data = Buffer.from(encryptedData, 'base64');
      const iv = data.slice(0, 12);
      const authTag = data.slice(12, 28);
      const encrypted = data.slice(28);
      
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(secret.padEnd(32, '0').slice(0, 32)),
        iv
      );
      
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Creates a secure HTTP client with built-in CSRF protection and security headers
 */
export class SecureHttpClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...getSecureHeaders()
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  public get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  public post<T>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public put<T>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Export a default instance for convenience
export const httpClient = new SecureHttpClient(process.env.REACT_APP_API_URL || '');
