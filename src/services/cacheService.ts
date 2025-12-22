interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
  version: string;
}

interface CacheConfig {
  maxSize: number; // Maximum number of items
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig = {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000 // 1 minute
  };
  private cleanupTimer?: NodeJS.Timeout;

  private constructor() {
    this.startCleanupTimer();
    this.loadCacheFromStorage();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (item.ttl && (now - item.timestamp) > item.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveCacheToStorage();
  }

  private evictLRU() {
    if (this.cache.size >= this.config.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      this.cache.forEach((item, key) => {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
      });

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  private saveCacheToStorage() {
    try {
      const cacheArray = Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        item,
        expiresAt: item.ttl ? item.timestamp + item.ttl : null
      }));

      localStorage.setItem('appCache', JSON.stringify(cacheArray));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('appCache');
      if (stored) {
        const cacheArray = JSON.parse(stored);
        const now = Date.now();

        cacheArray.forEach(({ key, item, expiresAt }: any) => {
          if (!expiresAt || expiresAt > now) {
            this.cache.set(key, item);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Public API methods
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: '1.0'
    };

    this.evictLRU();
    this.cache.set(key, cacheItem);
    this.saveCacheToStorage();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Check if item has expired
    if (item.ttl && (now - item.timestamp) > item.ttl) {
      this.cache.delete(key);
      this.saveCacheToStorage();
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveCacheToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.saveCacheToStorage();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Specialized caching methods
  cacheApiResponse<T>(endpoint: string, params: any, data: T, ttl?: number): void {
    const key = this.generateKey('api', `${endpoint}:${JSON.stringify(params)}`);
    this.set(key, data, ttl);
  }

  getCachedApiResponse<T>(endpoint: string, params: any): T | null {
    const key = this.generateKey('api', `${endpoint}:${JSON.stringify(params)}`);
    return this.get<T>(key);
  }

  cacheImage(url: string, data: string | Blob, ttl?: number): void {
    const key = this.generateKey('image', url);
    this.set(key, data, ttl || 24 * 60 * 60 * 1000); // 24 hours default
  }

  getCachedImage(url: string): string | Blob | null {
    const key = this.generateKey('image', url);
    return this.get<string | Blob>(key);
  }

  cacheUserPreferences(preferences: any): void {
    const key = this.generateKey('user', 'preferences');
    this.set(key, preferences, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  getCachedUserPreferences(): any | null {
    const key = this.generateKey('user', 'preferences');
    return this.get(key);
  }

  cacheTheme(theme: any): void {
    const key = this.generateKey('theme', 'current');
    this.set(key, theme, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  getCachedTheme(): any | null {
    const key = this.generateKey('theme', 'current');
    return this.get(key);
  }

  // Cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    this.cache.forEach((item) => {
      if (item.ttl && (now - item.timestamp) > item.ttl) {
        expiredCount++;
      }
      
      // Estimate size of cached data
      totalSize += JSON.stringify(item.data).length;
    });

    return {
      totalItems: this.cache.size,
      expiredItems: expiredCount,
      maxSize: this.config.maxSize,
      utilization: (this.cache.size / this.config.maxSize) * 100,
      estimatedSize: totalSize,
      keysByPrefix: this.getKeysByPrefix()
    };
  }

  private getKeysByPrefix(): Record<string, number> {
    const prefixCount: Record<string, number> = {};

    this.cache.forEach((_, key) => {
      const prefix = key.split(':')[0];
      prefixCount[prefix] = (prefixCount[prefix] || 0) + 1;
    });

    return prefixCount;
  }

  // Cache warming
  async warmCache(items: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  // Cache invalidation strategies
  invalidateByPrefix(prefix: string): number {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix + ':')) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveCacheToStorage();
    
    return keysToDelete.length;
  }

  invalidateByPattern(pattern: RegExp): number {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveCacheToStorage();
    
    return keysToDelete.length;
  }

  // Configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Cleanup and disposal
  dispose(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

export default CacheService.getInstance();
