import { apiClient, ApiResponse } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  username?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    username?: string;
    is_active: boolean;
    is_verified: boolean;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class AuthAPI {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.data) {
      const data = response.data as AuthResponse;
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return response as ApiResponse<AuthResponse>;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.data) {
      const data = response.data as AuthResponse;
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return response as ApiResponse<AuthResponse>;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/logout');
    
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    return response as ApiResponse<void>;
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return {
        error: 'No refresh token available',
        status: 401,
      };
    }

    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.data) {
      const data = response.data as RefreshTokenResponse;
      localStorage.setItem('access_token', data.access_token);
    }
    
    return response as ApiResponse<RefreshTokenResponse>;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get('/auth/me');
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/password-reset', { email });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/resend-verification');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authAPI = new AuthAPI();
