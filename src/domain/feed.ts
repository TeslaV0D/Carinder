import { matchesPreferences, type Preferences } from './preferences';
import { learnWeights, rankFeed, type SwipeHistoryEntry } from './scoring';
import type { Vehicle } from './vehicle';

export const FEED_BATCH_SIZE = 20;

export interface BuildFeedOptions {
  limit?: number;
  /** Skip when the candidates were already filtered (e.g. server side). */
  preferences?: Preferences;
  /** Vehicles the app already holds but hasn't recorded as swiped yet. */
  excludeIds?: readonly string[];
  random?: () => number;
  now?: Date;
}

/** Shared feed pipeline used by every repository: filter, learn, rank. */
export function buildFeed(
  candidates: readonly Vehicle[],
  history: readonly SwipeHistoryEntry[],
  { limit = FEED_BATCH_SIZE, preferences, excludeIds = [], random, now }: BuildFeedOptions = {},
): Vehicle[] {
  const excluded = new Set([...excludeIds, ...history.map((entry) => entry.vehicle.id)]);
  const eligible = candidates.filter(
    (vehicle) =>
      !excluded.has(vehicle.id) && (preferences === undefined || matchesPreferences(vehicle, preferences)),
  );
  return rankFeed(eligible, learnWeights(history, now), { limit, random });
}
