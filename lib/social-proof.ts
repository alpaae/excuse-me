import useSWR from 'swr';
import { getWarsawDateString } from './time-warsaw';

interface SocialProofData {
  todayCount: number;
  stepHours: number;
  dailyCap: number;
  nextResetAt: string;
  tz: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function getLocalStorageKey(date: string): string {
  return `sp:${date}`;
}

function getLocalCount(date: string): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(getLocalStorageKey(date));
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function setLocalCount(date: string, count: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getLocalStorageKey(date), count.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export function useSocialProof() {
  const warsawDate = getWarsawDateString();
  const localCount = getLocalCount(warsawDate);
  
  const { data, error, mutate } = useSWR<SocialProofData>(
    '/api/social-proof',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0, // No automatic polling
      errorRetryCount: 1,
      errorRetryInterval: 5000,
    }
  );

  // Ensure count never decreases locally
  const currentCount = Math.max(
    localCount,
    data?.todayCount || 0
  );

  // Update local storage if we have new data
  if (data?.todayCount && data.todayCount > localCount) {
    setLocalCount(warsawDate, data.todayCount);
  }

  // Add small random increment for local visits (3-15)
  const addLocalIncrement = () => {
    const increment = Math.floor(Math.random() * 13) + 3; // 3-15
    const newCount = Math.min(currentCount + increment, data?.dailyCap || 50000);
    
    if (newCount > currentCount && data) {
      setLocalCount(warsawDate, newCount);
      mutate({ ...data, todayCount: newCount }, false);
    }
  };

  return {
    count: currentCount,
    isLoading: !error && !data,
    isError: error,
    addLocalIncrement,
    data: data ? { ...data, todayCount: currentCount } : undefined,
  };
}
