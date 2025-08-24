'use client';

import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then(res => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        errorRetryCount: 1,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
