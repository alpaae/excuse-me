import useSWR from 'swr';
import { useState, useEffect } from 'react';

interface LimitsData {
  remaining: number | Infinity;
  daily: number;
  isPro: boolean;
  nextResetAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLimits() {
  const { data, error, mutate } = useSWR<LimitsData>(
    '/api/limits',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      errorRetryCount: 1,
      errorRetryInterval: 5000,
    }
  );

  return {
    limits: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useCountdown(nextResetAt: string): string {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const resetTime = new Date(nextResetAt).getTime();
      const timeLeft = resetTime - now;

      if (timeLeft <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextResetAt]);

  return countdown;
}
