import { api, handleApiError } from '../../../lib/api';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string;
}

interface AuthResponse {
  user: User;
  tokens: Tokens;
}

const authService = {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      if (response.data.tokens) {
        this._setTokens(response.data.tokens);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Registration failed'));
    }
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.data.tokens) {
        this._setTokens(response.data.tokens);
      }
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Login failed'));
    }
  },

  /**
   * Logout user
   */
  logout(): Promise<void> {
    this._clearTokens();
    return Promise.resolve();
  },

  async refreshToken(refreshToken: string): Promise<Tokens> {
    try {
      const response = await api.post<{ tokens: Tokens }>('/auth/refresh-token', {
        refreshToken,
      });
      this._setTokens(response.data.tokens);
      return response.data.tokens;
    } catch (error) {
      this._clearTokens();
      throw new Error(handleApiError(error, 'Failed to refresh token'));
    }
  },

  _setTokens(tokens: Tokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString());
  },

  _clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  },

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/verify-email',
        { token }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Email verification failed'));
    }
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        { email }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to send password reset email'));
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/reset-password',
        { token, password, password_confirmation: passwordConfirmation }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Password reset failed'));
    }
  },

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await api.get<AuthResponse['user']>('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch user data'));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  },
};

export default authService;
