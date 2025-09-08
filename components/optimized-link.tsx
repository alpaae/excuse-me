'use client';

import { useCallback, useRef } from 'react';
import { useOptimizedNavigation } from '@/lib/navigation';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  preload?: boolean;
  replace?: boolean;
}

export function OptimizedLink({ 
  href, 
  children, 
  className, 
  onClick, 
  preload = true,
  replace = false 
}: OptimizedLinkProps) {
  const { navigate, preload: preloadPage } = useOptimizedNavigation();
  const preloadTimeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    await navigate(href, { replace });
  }, [href, onClick, navigate, replace]);

  const handleMouseEnter = useCallback(() => {
    if (preload && !preloadTimeoutRef.current) {
      preloadTimeoutRef.current = setTimeout(() => {
        preloadPage(href);
      }, 100); // Small delay to avoid unnecessary preloading
    }
  }, [preload, href, preloadPage]);

  const handleMouseLeave = useCallback(() => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = undefined;
    }
  }, []);

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  );
}
