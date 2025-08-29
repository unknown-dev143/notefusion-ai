interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class AICache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTtl: number; // in milliseconds

  constructor(defaultTtl = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTtl = defaultTtl;
  }

  // Set a value in the cache with an optional TTL
  set<T>(key: string, value: T, ttl: number = this.defaultTtl): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    
    // Schedule cleanup if this is the first item
    if (this.cache.size === 1) {
      this.scheduleCleanup();
    }
  }

  // Get a value from the cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  // Delete a value from the cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all expired items from the cache
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
    
    // Schedule next cleanup if there are still items
    if (this.cache.size > 0) {
      this.scheduleCleanup();
    }
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }

  // Get the number of items in the cache
  size(): number {
    return this.cache.size;
  }

  // Schedule the next cleanup
  private scheduleCleanup(): void {
    // Run cleanup every minute
    setTimeout(() => this.cleanup(), 60 * 1000);
  }
}

// Create a singleton instance
export const aiCache = new AICache();

// Helper function to generate a cache key from function name and arguments
export function generateCacheKey(prefix: string, args: any[]): string {
  const argsKey = args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join('_');
  
  return `${prefix}_${argsKey}`;
}

// Higher-order function to add caching to any async function
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyPrefix: string;
    ttl?: number;
    getKey?: (...args: Parameters<T>) => string;
  }
): T {
  const { keyPrefix, ttl, getKey } = options;
  
  return (async (...args: Parameters<T>): Promise<any> => {
    const cacheKey = getKey 
      ? getKey(...args)
      : generateCacheKey(keyPrefix, args);
    
    // Try to get from cache
    const cached = aiCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    // If not in cache, call the original function
    const result = await fn(...args);
    
    // Cache the result
    aiCache.set(cacheKey, result, ttl);
    
    return result;
  }) as T;
}

export default aiCache;
