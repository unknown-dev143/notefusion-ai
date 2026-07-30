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
  username: string;
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
  tokens?: Tokens;
  token?: string; // Supporting both versions
  access_token?: string; // Added for FastAPI compatibility
  accessToken?: string;  // For frontend internal consistency
  token_type?: string;   // Added for FastAPI compatibility
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
      } else if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      } else if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
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
      // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await api.post<AuthResponse>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      } else if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
      } else if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
      }
      
      // Build user object from the token response if not present
      if (!response.data.user && (response.data as any).user === undefined) {
        (response.data as any).user = {
          id: '',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'user',
          emailVerified: true,
        };
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Login failed'));
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this._clearTokens();
      localStorage.removeItem('authToken');
    }
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
    localStorage.setItem('authToken', tokens.accessToken); // Mirror to authToken
  },

  _clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('authToken');
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
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/resend-verification',
        { email }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to resend verification email'));
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
      const response = await api.get<AuthResponse['user']>('/auth/users/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch user data'));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('accessToken');
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return false; // If no expiry set, assume valid if token exists
    return Date.now() > parseInt(expiry, 10);
  },
};

export default authService;
