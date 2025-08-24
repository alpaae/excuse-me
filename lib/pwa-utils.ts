// === PWA УТИЛИТЫ ДЛЯ NEXT.JS 15 ===

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

interface PWAConfig {
  swPath: string;
  scope: string;
  updateViaCache: ServiceWorkerUpdateViaCache;
}

// Конфигурация PWA
const PWA_CONFIG: PWAConfig = {
  swPath: '/sw.js',
  scope: '/',
  updateViaCache: 'none',
};

// === РЕГИСТРАЦИЯ SERVICE WORKER ===
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker не поддерживается');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(PWA_CONFIG.swPath, {
      scope: PWA_CONFIG.scope,
      updateViaCache: PWA_CONFIG.updateViaCache,
    });

    console.log('[PWA] Service Worker зарегистрирован:', registration);

    // Обработка обновлений
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Доступно обновление Service Worker');
            showUpdateNotification();
          }
        });
      }
    });

    // Обработка ошибок
    registration.addEventListener('error', (error) => {
      console.error('[PWA] Ошибка Service Worker:', error);
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Ошибка регистрации Service Worker:', error);
    return null;
  }
}

// === ПРОВЕРКА ВЕРСИИ SERVICE WORKER ===
export async function getServiceWorkerVersion(): Promise<string | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.version) {
          resolve(event.data.version);
        } else {
          resolve(null);
        }
      };

      registration.active!.postMessage(
        { type: 'GET_VERSION' } as ServiceWorkerMessage,
        [messageChannel.port2]
      );

      // Timeout для предотвращения зависания
      setTimeout(() => resolve(null), 1000);
    });
  } catch (error) {
    console.error('[PWA] Ошибка получения версии SW:', error);
    return null;
  }
}

// === ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ SERVICE WORKER ===
export async function forceServiceWorkerUpdate(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    // Отправляем сообщение для принудительного обновления
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' } as ServiceWorkerMessage);
      return true;
    }

    // Если нет ожидающего SW, обновляем регистрацию
    await registration.update();
    return true;
  } catch (error) {
    console.error('[PWA] Ошибка принудительного обновления SW:', error);
    return false;
  }
}

// === ПРОВЕРКА ОНЛАЙН СТАТУСА ===
export function isOnline(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

// === ПРОВЕРКА PWA УСТАНОВКИ ===
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Проверяем различные индикаторы установки PWA
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// === ПОКАЗ УВЕДОМЛЕНИЯ ОБ ОБНОВЛЕНИИ ===
function showUpdateNotification(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Создаем уведомление об обновлении
  const updateNotification = document.createElement('div');
  updateNotification.className = 'pwa-update-notification';
  updateNotification.innerHTML = `
    <div class="pwa-update-content">
      <p>Доступно обновление приложения</p>
      <button onclick="window.location.reload()">Обновить</button>
      <button onclick="this.parentElement.parentElement.remove()">Позже</button>
    </div>
  `;

  // Добавляем стили
  updateNotification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6f5cff;
    color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    max-width: 300px;
  `;

  const updateContent = updateNotification.querySelector('.pwa-update-content') as HTMLElement;
  if (updateContent) {
    updateContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
  }

  updateNotification.querySelectorAll('button').forEach(button => {
    button.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: white;
      color: #6f5cff;
      cursor: pointer;
      font-weight: 500;
    `;
  });

  document.body.appendChild(updateNotification);

  // Автоматически скрываем через 10 секунд
  setTimeout(() => {
    if (updateNotification.parentElement) {
      updateNotification.remove();
    }
  }, 10000);
}

// === ИНИЦИАЛИЗАЦИЯ PWA ===
export async function initializePWA(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('[PWA] Инициализация PWA...');

  // Регистрируем Service Worker
  const registration = await registerServiceWorker();
  if (!registration) {
    console.warn('[PWA] Не удалось зарегистрировать Service Worker');
    return;
  }

  // Проверяем версию
  const version = await getServiceWorkerVersion();
  console.log('[PWA] Версия Service Worker:', version);

  // Добавляем обработчики онлайн/офлайн статуса
  window.addEventListener('online', () => {
    console.log('[PWA] Приложение онлайн');
    // Можно добавить уведомление пользователю
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Приложение офлайн');
    // Можно показать офлайн индикатор
  });

  // Проверяем, установлено ли PWA
  if (isPWAInstalled()) {
    console.log('[PWA] Приложение установлено как PWA');
  }

  console.log('[PWA] Инициализация завершена');
}

// === УТИЛИТЫ ДЛЯ КЭШИРОВАНИЯ ===
export async function clearPWAStorage(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Очищаем кэш Service Worker
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith('excuseme-'))
        .map(name => caches.delete(name))
    );

    // Очищаем localStorage и sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    console.log('[PWA] Хранилище очищено');
  } catch (error) {
    console.error('[PWA] Ошибка очистки хранилища:', error);
  }
}

// === ПРОВЕРКА ПОДДЕРЖКИ PWA ===
export function checkPWASupport(): {
  serviceWorker: boolean;
  pushManager: boolean;
  notifications: boolean;
  backgroundSync: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      serviceWorker: false,
      pushManager: false,
      notifications: false,
      backgroundSync: false,
    };
  }

  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
  };
}
