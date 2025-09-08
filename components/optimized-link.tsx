'use client';

import Link from 'next/link';
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
  const { preload: preloadPage } = useOptimizedNavigation();
  const preloadTimeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    // Let Next.js Link handle the navigation
  }, [onClick]);

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
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      replace={replace}
    >
      {children}
    </Link>
  );
}
