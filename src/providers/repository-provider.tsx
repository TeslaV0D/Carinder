import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, use, useMemo, type PropsWithChildren } from 'react';

import { LocalRepository } from '@/data/local-repository';
import type { CarinderRepository } from '@/data/repository';
import { DemoSource } from '@/data/sources/demo-source';
import { SupabaseRepository } from '@/data/supabase-repository';
import { supabase } from '@/lib/supabase';

import { useSession } from './session-provider';

const RepositoryContext = createContext<CarinderRepository | null>(null);

function createRepository(mode: 'demo' | 'supabase', userId: string | null): CarinderRepository | null {
  if (mode === 'demo') return new LocalRepository(AsyncStorage, new DemoSource());
  if (supabase && userId) return new SupabaseRepository(supabase, userId);
  return null;
}

export function RepositoryProvider({ children }: PropsWithChildren) {
  const { mode, session } = useSession();
  const userId = session?.user.id ?? null;

  // A fresh query cache per account, so one account's data never shows up for the next.
  const { repository, queryClient } = useMemo(
    () => ({ repository: createRepository(mode, userId), queryClient: new QueryClient() }),
    [mode, userId],
  );

  return (
    <RepositoryContext value={repository}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RepositoryContext>
  );
}

export function useRepository(): CarinderRepository {
  const repository = use(RepositoryContext);
  if (!repository) throw new Error('useRepository requires a signed-in user');
  return repository;
}
