module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready - started server on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Performance budget
        'categories:performance': ['error', { minScore: 0.85 }],
        
        // PWA requirements
        'categories:pwa': ['error', { minScore: 0.9 }],
        'pwa-installable': ['error', { minScore: 1 }],
        'installable-manifest': ['error', { minScore: 1 }],
        'service-worker': ['error', { minScore: 1 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Accessibility
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        
        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        // SEO
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
