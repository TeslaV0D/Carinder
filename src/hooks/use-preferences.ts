import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/data/query-keys';
import type { Preferences } from '@/domain/preferences';
import { useRepository } from '@/providers/repository-provider';

export function usePreferences() {
  const repository = useRepository();
  return useQuery({ queryKey: queryKeys.preferences, queryFn: () => repository.getPreferences() });
}

export function useSavePreferences() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: Preferences) => repository.savePreferences(preferences),
    onMutate: (preferences) => queryClient.setQueryData(queryKeys.preferences, preferences),
    onError: () => queryClient.invalidateQueries({ queryKey: queryKeys.preferences }),
  });
}

/** Changes whenever the swipe deck should start over. */
export function useFeedEpoch() {
  return useQuery({ queryKey: queryKeys.feedEpoch, queryFn: () => 0, staleTime: Infinity }).data ?? 0;
}

export function useRestartFeed() {
  const queryClient = useQueryClient();
  return () => queryClient.setQueryData<number>(queryKeys.feedEpoch, (epoch) => (epoch ?? 0) + 1);
}
