'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const RETRY_COUNT = 2;
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME,
            retry: RETRY_COUNT,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage:
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
