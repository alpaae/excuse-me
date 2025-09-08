// API cache for reducing redundant requests and improving performance
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private static instance: APICache;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  // Get cached data or fetch if not available/expired
  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number = 30000): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Fetch new data
    const promise = fetcher().then(data => {
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl
      });
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Invalidate cache entry
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const apiCache = APICache.getInstance();

// Optimized API functions with caching
export const cachedAPI = {
  // Get user limits with caching
  async getLimits(): Promise<any> {
    return apiCache.get('user-limits', async () => {
      const response = await fetch('/api/limits');
      if (!response.ok) throw new Error('Failed to fetch limits');
      return response.json();
    }, 60000); // Cache for 1 minute
  },

  // Get social proof with caching
  async getSocialProof(): Promise<any> {
    return apiCache.get('social-proof', async () => {
      const response = await fetch('/api/social-proof');
      if (!response.ok) throw new Error('Failed to fetch social proof');
      return response.json();
    }, 300000); // Cache for 5 minutes
  },

  // Get user profile with caching
  async getProfile(userId: string): Promise<any> {
    return apiCache.get(`profile-${userId}`, async () => {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }, 300000); // Cache for 5 minutes
  },

  // Get excuses with caching
  async getExcuses(): Promise<any> {
    return apiCache.get('excuses', async () => {
      const response = await fetch('/api/excuses');
      if (!response.ok) throw new Error('Failed to fetch excuses');
      return response.json();
    }, 60000); // Cache for 1 minute
  }
};

// Cache invalidation helpers
export const cacheHelpers = {
  // Invalidate user-related cache when user changes
  invalidateUserCache(userId?: string): void {
    apiCache.invalidate('user-limits');
    if (userId) {
      apiCache.invalidate(`profile-${userId}`);
    }
  },

  // Invalidate excuses cache when new excuse is created
  invalidateExcusesCache(): void {
    apiCache.invalidate('excuses');
  },

  // Invalidate all cache (useful for logout)
  invalidateAllCache(): void {
    apiCache.clear();
  }
};
