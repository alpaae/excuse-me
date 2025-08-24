import toast from 'react-hot-toast';

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const showPromise = <T>(
    promise: Promise<T>,
    {
      loading = 'Загрузка...',
      success = 'Успешно!',
      error = 'Произошла ошибка',
    }: {
      loading?: string;
      success?: string;
      error?: string;
    } = {}
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
    dismiss,
    showPromise,
  };
}

// Утилиты для API ошибок
export const toastMessages = {
  generate: {
    success: 'Отмазка успешно сгенерирована!',
    error: 'Не удалось сгенерировать отмазку',
    rateLimit: 'Слишком много запросов. Попробуйте через минуту.',
    freeLimit: 'Достигнут дневной лимит. Перейдите на Pro для неограниченного доступа.',
  },
  tts: {
    success: 'Аудио успешно создано!',
    error: 'Не удалось создать аудио',
  },
  auth: {
    success: 'Ссылка для входа отправлена на email!',
    error: 'Не удалось отправить ссылку для входа',
  },
  general: {
    networkError: 'Ошибка сети. Проверьте подключение к интернету.',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    unknownError: 'Произошла неизвестная ошибка',
  },
} as const;
