// User data caching utility
interface UserCacheData {
  profile: any;
  subscription: any;
  timestamp: number;
}

class UserCache {
  private cache = new Map<string, UserCacheData>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  set(userId: string, data: { profile: any; subscription: any }): void {
    this.cache.set(userId, {
      ...data,
      timestamp: Date.now()
    });
  }

  get(userId: string): { profile: any; subscription: any } | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheDuration) {
      this.cache.delete(userId);
      return null;
    }

    return {
      profile: cached.profile,
      subscription: cached.subscription
    };
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache info for debugging
  getInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const userCache = new UserCache();
