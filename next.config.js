/** @type {import('next').NextConfig} */
const nextConfig = {
  // === ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ ===
  
  // Отключаем devtools для устранения ошибок
  devIndicators: {
    position: 'bottom-right',
  },

  // === НАСТРОЙКИ ИЗОБРАЖЕНИЙ ===
  images: {
    // Обновляем для Next.js 15: используем remotePatterns вместо domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      // Добавляем поддержку для Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    // Включаем современные форматы изображений
    formats: ['image/webp', 'image/avif'],
    // Оптимизация для мобильных устройств
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // === НАСТРОЙКИ СБОРКИ ===
  
  // Оптимизация для production
  compress: true,
  
  // Включаем современные возможности браузера
  poweredByHeader: false,

  // === НАСТРОЙКИ PWA ===
  
  // Headers для PWA и безопасности
  async headers() {
    return [
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          // Добавляем кэширование для PWA
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Добавляем security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // === НАСТРОЙКИ РЕДИРЕКТОВ ===
  
  // Редирект для Telegram Mini App
  async redirects() {
    return [
      {
        source: '/tg',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // === НАСТРОЙКИ WEBPACK ===
  
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для production
    if (!dev && !isServer) {
      // Включаем tree shaking
      config.optimization.usedExports = true;
      
      // Улучшенная оптимизация размера бандлов
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Разделяем vendor на более мелкие чанки
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Отдельный чанк для React
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Отдельный чанк для UI компонентов
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@radix-ui\/react|class-variance-authority|clsx|tailwind-merge|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // Отдельный чанк для Supabase
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase|supabase)[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 15,
          },
        },
      };
      
      // Оптимизация для мобильных устройств
      config.optimization.minimize = true;
    }

    return config;
  },

  // === ДОПОЛНИТЕЛЬНЫЕ ОПТИМИЗАЦИИ ===
  
  // Включаем экспериментальные оптимизации
  experimental: {
    // Оптимизация загрузки страниц
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

module.exports = nextConfig;
