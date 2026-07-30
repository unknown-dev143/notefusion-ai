import { User as FirebaseUser, UserCredential } from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  // Add any additional properties you expect to have on the user object
  id?: string;
  role?: string;
  emailVerified: boolean;
  token?: string; // For WebSocket authentication
  subscriptionStatus?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  user: AuthUser | null; // Alias for currentUser
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  signInWithMicrosoft: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
}
