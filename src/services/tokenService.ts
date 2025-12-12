import { authAPI } from './authAPI';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

class TokenService {
  private refreshPromise: Promise<string> | null = null;

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Store tokens
  setTokens(tokens: TokenData): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', 
      new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    );
  }

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return new Date(expiresAt) <= new Date();
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiryTime - currentTime <= fiveMinutes;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.doRefreshToken(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(_refreshToken: string): Promise<string> {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.error || !response.data) {
        throw new Error(response.error || 'Token refresh failed');
      }

      // Update the access token
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_expires_at', 
        new Date(Date.now() + response.data.expires_in * 1000).toISOString()
      );

      return response.data.access_token;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens();
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string | null> {
    const currentToken = this.getAccessToken();
    
    if (!currentToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return currentToken;
  }

  // Decode JWT token (simple implementation)
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Get user info from token
  getUserFromToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    
    return this.decodeToken(token);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUserFromToken();
    return user?.role === role;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getUserFromToken();
    return user?.permissions?.includes(permission) || false;
  }

  // Setup automatic token refresh
  setupAutoRefresh(): void {
    setInterval(async () => {
      if (this.isTokenExpiringSoon() && this.getRefreshToken()) {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error('Auto refresh failed:', error);
          // Redirect to login or show re-authentication UI
          window.dispatchEvent(new CustomEvent('token-expired'));
        }
      }
    }, 60000); // Check every minute
  }

  // Initialize token service
  initialize(): void {
    this.setupAutoRefresh();
    
    // Listen for token expiry events
    window.addEventListener('token-expired', () => {
      this.clearTokens();
      // You can redirect to login or show a modal here
      window.location.href = '/login';
    });
  }
}

export const tokenService = new TokenService();
