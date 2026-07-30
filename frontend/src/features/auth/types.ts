export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string;
  avatar?: string;
  streak_days?: number;
  token_balance?: number;
}

export interface AuthResponse {
  user: User;
  tokens?: Tokens;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  username?: string; // Optional username field
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
}
