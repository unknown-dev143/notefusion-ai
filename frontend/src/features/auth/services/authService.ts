import { api, handleApiError } from '../../../lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
  };
  token: string;
}

const authService = {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
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
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
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
      localStorage.removeItem('authToken');
    }
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
    return localStorage.getItem('authToken');
  },
};

export default authService;
