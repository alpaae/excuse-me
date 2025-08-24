import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Базовые переводы
const resources = {
  en: {
    common: {
      'app.name': 'ExcuseME',
      'app.description': 'Polite excuse generator',
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.account': 'Account',
      'nav.admin': 'Admin',
      'auth.signin': 'Sign In',
      'auth.signout': 'Sign Out',
      'auth.email': 'Email',
      'auth.github': 'Continue with GitHub',
      'auth.magic_link': 'Send magic link',
      'auth.magic_link_sent': 'Check your email for the magic link',
      'subscription.pro': 'Pro Subscription',
      'subscription.free': 'Free Plan',
      'subscription.upgrade': 'Upgrade to Pro',
      'subscription.renew': 'Renew Subscription',
      'subscription.limit_reached': 'Daily limit reached',
      'subscription.limit_remaining': '{{count}} generations remaining',
      'excuse.generate': 'Generate Excuse',
      'excuse.history': 'History',
      'excuse.favorites': 'Favorites',
      'excuse.favorite': 'Add to favorites',
      'excuse.unfavorite': 'Remove from favorites',
      'excuse.copy': 'Copy',
      'excuse.share': 'Share',
      'excuse.audio': 'Listen',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search',
      'no_results': 'No results found',
    },
  },
  ru: {
    common: {
      'app.name': 'ExcuseME',
      'app.description': 'Генератор вежливых отмазок',
      'nav.home': 'Главная',
      'nav.dashboard': 'Панель',
      'nav.account': 'Аккаунт',
      'nav.admin': 'Админ',
      'auth.signin': 'Войти',
      'auth.signout': 'Выйти',
      'auth.email': 'Email',
      'auth.github': 'Войти через GitHub',
      'auth.magic_link': 'Отправить magic link',
      'auth.magic_link_sent': 'Проверьте email для magic link',
      'subscription.pro': 'Pro подписка',
      'subscription.free': 'Бесплатный план',
      'subscription.upgrade': 'Перейти на Pro',
      'subscription.renew': 'Продлить подписку',
      'subscription.limit_reached': 'Дневной лимит исчерпан',
      'subscription.limit_remaining': 'Осталось генераций: {{count}}',
      'excuse.generate': 'Сгенерировать отмазку',
      'excuse.history': 'История',
      'excuse.favorites': 'Избранное',
      'excuse.favorite': 'Добавить в избранное',
      'excuse.unfavorite': 'Убрать из избранного',
      'excuse.copy': 'Копировать',
      'excuse.share': 'Поделиться',
      'excuse.audio': 'Слушать',
      'loading': 'Загрузка...',
      'error': 'Ошибка',
      'success': 'Успешно',
      'save': 'Сохранить',
      'cancel': 'Отмена',
      'delete': 'Удалить',
      'edit': 'Редактировать',
      'search': 'Поиск',
      'no_results': 'Ничего не найдено',
    },
  },
};

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18nextLng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/api/i18n/{{lng}}/{{ns}}',
      addPath: '/api/i18n/{{lng}}/{{ns}}',
    },
  });

export default i18next;
