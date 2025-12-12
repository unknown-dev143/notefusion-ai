import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'moderator' | 'user' | 'premium';
  mfaEnabled: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  ui: UIPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    system: boolean;
    social: boolean;
    achievement: boolean;
    reminder: boolean;
    collaboration: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  shareActivity: boolean;
  dataCollection: boolean;
}

export interface UIPreferences {
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  animationsEnabled: boolean;
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
}

export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  currentView: string;
  searchQuery: string;
  
  // Feature flags
  features: {
    analytics: boolean;
    collaboration: boolean;
    aiFeatures: boolean;
    gamification: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  unreadCount: number;
  
  // Cache
  cache: Map<string, any>;
  cacheTimestamps: Map<string, number>;
  
  // Offline sync
  offlineMode: boolean;
  pendingActions: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }>;
}

// Store interface
interface AppStore extends AppState {
  // User actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Feature flags
  setFeatures: (features: Partial<AppState['features']>) => void;
  
  // Notifications
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Cache actions
  setCache: (key: string, data: any, ttl?: number) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  
  // Offline actions
  setOfflineMode: (offline: boolean) => void;
  addPendingAction: (action: Omit<AppState['pendingActions'][0], 'id' | 'timestamp'>) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;
  
  // Reset
  reset: () => void;
}

// Cache TTL in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Create store
export const useAppStore = create<AppStore>()(
  persist(
    (set: any, get: any): AppStore => ({
      // Initial state matching AppState interface
      user: null,
      isAuthenticated: false,
      loading: false,
      sidebarOpen: true,
      currentView: 'dashboard',
      searchQuery: '',
      features: {
        analytics: true,
        collaboration: true,
        aiFeatures: true,
        gamification: true,
      },
      notifications: [],
      unreadCount: 0,
      cache: new Map(),
      cacheTimestamps: new Map(),
      offlineMode: false,
      pendingActions: [],

      // User actions
      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      updateUser: (updates: any) => set((state: any) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      updateUserPreferences: (preferences: any) => set((state: any) => ({
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...preferences }
        } : null
      })),
      
      setLoading: (loading: any) => set({ loading }),

      // UI actions
      setSidebarOpen: (sidebarOpen: any) => set({ sidebarOpen }),
      setCurrentView: (currentView: any) => set({ currentView }),
      setSearchQuery: (searchQuery: any) => set({ searchQuery }),

      // Feature flags
      setFeatures: (features: any) => set((state: any) => ({
        features: { ...state.features, ...features }
      })),

      // Notifications
      addNotification: (notification: any) => set((state: any) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        const notifications = [newNotification, ...state.notifications];
        const unreadCount = notifications.filter(n => !n.read).length;
        return { notifications, unreadCount };
      }),

      markNotificationRead: (id: any) => set((state: any) => {
        const notifications = state.notifications.map((n: any) =>
          n.id === id ? { ...n, read: true } : n
        );
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        return { notifications, unreadCount };
      }),

      markAllNotificationsRead: () => set((state: any) => ({
        notifications: state.notifications.map((n: any) => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      removeNotification: (id: any) => set((state: any) => {
        const notifications = state.notifications.filter((n: any) => n.id !== id);
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        return { notifications, unreadCount };
      }),

      clearNotifications: () => set({ 
        notifications: [], 
        unreadCount: 0 
      }),

      // Cache actions
      setCache: (key: any, data: any, ttl = CACHE_TTL) => set((state: any) => {
        const newCache = new Map(state.cache);
        const newTimestamps = new Map(state.cacheTimestamps);
        
        newCache.set(key, data);
        newTimestamps.set(key, Date.now() + ttl);
        
        return {
          cache: newCache,
          cacheTimestamps: newTimestamps,
        };
      }),

      getCache: (key: any) => {
        const state = get();
        const timestamp = state.cacheTimestamps.get(key);
        
        if (!timestamp || Date.now() > timestamp) {
          // Cache expired
          state.cache.delete(key);
          state.cacheTimestamps.delete(key);
          return null;
        }
        
        return state.cache.get(key);
      },

      clearCache: (key: any) => set((state: any) => {
        if (key) {
          const newCache = new Map(state.cache);
          const newTimestamps = new Map(state.cacheTimestamps);
          
          newCache.delete(key);
          newTimestamps.delete(key);
          
          return { cache: newCache, cacheTimestamps: newTimestamps };
        }
        
        return { cache: new Map(), cacheTimestamps: new Map() };
      }),

      // Offline actions
      setOfflineMode: (offlineMode: any) => set({ offlineMode }),

      addPendingAction: (action: any) => set((state: any) => ({
        pendingActions: [
          {
            ...action,
            id: Date.now().toString(),
            timestamp: Date.now(),
          },
          ...state.pendingActions,
        ],
      })),

      removePendingAction: (id: any) => set((state: any) => ({
        pendingActions: state.pendingActions.filter((a: any) => a.id !== id),
      })),

      clearPendingActions: () => set({ pendingActions: [] }),

      // Reset
      reset: () => set({
        user: null,
        isAuthenticated: false,
        loading: false,
        sidebarOpen: true,
        currentView: 'dashboard',
        searchQuery: '',
        notifications: [],
        unreadCount: 0,
        cache: new Map(),
        cacheTimestamps: new Map(),
        offlineMode: false,
        pendingActions: [],
      }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: any) => ({
        user: state.user,
        sidebarOpen: state.sidebarOpen,
        currentView: state.currentView,
        features: state.features,
      }),
      onRehydrateStorage: () => (state: any) => {
        // Initialize Maps after rehydration
        return {
          ...state,
          cache: new Map(),
          cacheTimestamps: new Map(),
        };
      },
    }
  )
);

// Selectors
export const useUser = () => useAppStore((state: any) => state.user);
export const useIsAuthenticated = () => useAppStore((state: any) => state.isAuthenticated);
export const useNotifications = () => useAppStore((state: any) => state.notifications);
export const useUnreadCount = () => useAppStore((state: any) => state.unreadCount);
export const useFeatures = () => useAppStore((state: any) => state.features);
export const useOfflineMode = () => useAppStore((state: any) => state.offlineMode);

// Actions
export const useAppActions = () => useAppStore((state: any) => ({
  setUser: state.setUser,
  updateUser: state.updateUser,
  updateUserPreferences: state.updateUserPreferences,
  setLoading: state.setLoading,
  setSidebarOpen: state.setSidebarOpen,
  setCurrentView: state.setCurrentView,
  setSearchQuery: state.setSearchQuery,
  setFeatures: state.setFeatures,
  addNotification: state.addNotification,
  markNotificationRead: state.markNotificationRead,
  markAllNotificationsRead: state.markAllNotificationsRead,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
  setCache: state.setCache,
  getCache: state.getCache,
  clearCache: state.clearCache,
  setOfflineMode: state.setOfflineMode,
  addPendingAction: state.addPendingAction,
  removePendingAction: state.removePendingAction,
  clearPendingActions: state.clearPendingActions,
  reset: state.reset,
}));
