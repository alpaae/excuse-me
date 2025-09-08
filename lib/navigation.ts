// Navigation utilities for optimized page transitions
export class NavigationManager {
  private static instance: NavigationManager;
  private preloadCache = new Map<string, boolean>();
  private loadingStates = new Map<string, boolean>();

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  // Preload critical pages
  async preloadPage(path: string): Promise<void> {
    if (this.preloadCache.has(path)) return;
    
    try {
      // Preload the page component using dynamic import
      if (path === '/account') {
        await import('../app/account/page');
      } else if (path === '/history') {
        await import('../app/history/page');
      } else if (path === '/excuses') {
        await import('../app/excuses/page');
      }
      this.preloadCache.set(path, true);
    } catch (error) {
      console.warn(`Failed to preload page: ${path}`, error);
    }
  }

  // Optimized navigation with loading states
  async navigateTo(path: string, options?: { replace?: boolean }): Promise<void> {
    const loadingKey = `nav-${path}`;
    
    if (this.loadingStates.get(loadingKey)) {
      return; // Already navigating
    }

    this.loadingStates.set(loadingKey, true);

    try {
      // Preload the page if not already cached
      if (!this.preloadCache.has(path)) {
        await this.preloadPage(path);
      }

      // Use window.location for navigation (simpler and more reliable)
      if (typeof window !== 'undefined') {
        if (options?.replace) {
          window.location.replace(path);
        } else {
          window.location.href = path;
        }
      }
    } finally {
      this.loadingStates.set(loadingKey, false);
    }
  }

  // Check if page is preloaded
  isPreloaded(path: string): boolean {
    return this.preloadCache.has(path);
  }

  // Check if currently navigating
  isNavigating(path: string): boolean {
    return this.loadingStates.get(`nav-${path}`) || false;
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.preloadCache.clear();
    this.loadingStates.clear();
  }
}

// Export singleton instance
export const navigationManager = NavigationManager.getInstance();

// Preload critical pages on app start
export function preloadCriticalPages(): void {
  if (typeof window === 'undefined') return;

  // Preload critical pages after initial load
  setTimeout(() => {
    navigationManager.preloadPage('/account');
    navigationManager.preloadPage('/history');
    navigationManager.preloadPage('/excuses');
  }, 2000);
}

// Optimized link component props
export interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  preload?: boolean;
}

// Hook for optimized navigation
export function useOptimizedNavigation() {
  const navigate = async (path: string, options?: { replace?: boolean }) => {
    await navigationManager.navigateTo(path, options);
  };

  const preload = async (path: string) => {
    await navigationManager.preloadPage(path);
  };

  return { navigate, preload };
}
