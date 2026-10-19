import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { queryKeys } from '@/data/query-keys';
import { isLike, type SwipeDirection, type Vehicle } from '@/domain/vehicle';
import { useRepository } from '@/providers/repository-provider';

/** Fetch the next batch once the queue is down to this many cards. */
const REFILL_AT = 5;

/**
 * Holds the card queue for the swipe screen. Remount (change `key`) to start
 * over, e.g. after the filters changed.
 */
export function useSwipeFeed() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const swipedIds = useRef(new Set<string>());
  // Swipes are written in order, and the feed waits for them so it never returns a swiped car.
  const pendingWrites = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isFetching.current || !hasMore || error || vehicles.length > REFILL_AT) return;

    isFetching.current = true;
    const queued = vehicles.map((vehicle) => vehicle.id);
    pendingWrites.current
      .then(() => repository.getFeed({ excludeIds: queued }))
      .then((batch) => {
        isFetching.current = false;
        if (!isMounted.current) return;
        const fresh = batch.filter((vehicle) => !swipedIds.current.has(vehicle.id));
        setHasMore(fresh.length > 0);
        setVehicles((current) => {
          const known = new Set(current.map((vehicle) => vehicle.id));
          return [...current, ...fresh.filter((vehicle) => !known.has(vehicle.id))];
        });
      })
      .catch((cause: unknown) => {
        isFetching.current = false;
        if (isMounted.current) setError(cause instanceof Error ? cause : new Error(String(cause)));
      });
  }, [repository, vehicles, hasMore, error]);

  const swipe = useCallback(
    (vehicle: Vehicle, direction: SwipeDirection) => {
      swipedIds.current.add(vehicle.id);
      setVehicles((current) => current.filter((candidate) => candidate.id !== vehicle.id));
      pendingWrites.current = pendingWrites.current
        .then(() => repository.recordSwipe(vehicle.id, direction))
        .then(() => {
          if (isLike(direction)) return queryClient.invalidateQueries({ queryKey: queryKeys.liked });
        })
        .catch((cause: unknown) => {
          if (isMounted.current) setError(cause instanceof Error ? cause : new Error(String(cause)));
        });
    },
    [repository, queryClient],
  );

  const retry = useCallback(() => setError(null), []);

  return {
    vehicles,
    swipe,
    retry,
    error,
    isLoading: vehicles.length === 0 && hasMore && !error,
    isExhausted: vehicles.length === 0 && !hasMore,
  };
}
