/**
 * Content-based recommendations: every swipe adds (or removes) weight to the
 * features of the swiped vehicle. Candidates are ranked by the summed weight
 * of their features, with a share of random picks so the feed doesn't get
 * stuck in a bubble.
 */

import type { SwipeDirection, Vehicle } from './vehicle';

export const SWIPE_VALUES: Record<SwipeDirection, number> = {
  like: 1,
  superlike: 2,
  dislike: -0.5,
};

/** A swipe loses half of its influence after this many days. */
export const HALF_LIFE_DAYS = 30;

export const DEFAULT_EXPLORATION_RATE = 0.15;

const PRICE_EDGES = [5_000, 10_000, 15_000, 20_000, 30_000, 45_000, 70_000];
const YEAR_EDGES = [2008, 2012, 2016, 2019, 2022, 2024];
const MILEAGE_EDGES = [20_000, 50_000, 100_000, 150_000, 200_000];
const POWER_EDGES = [60, 80, 110, 150, 200, 300];

export type FeatureWeights = Record<string, number>;

export interface SwipeHistoryEntry {
  vehicle: Vehicle;
  direction: SwipeDirection;
  createdAt: string;
}

export interface RankOptions {
  limit: number;
  explorationRate?: number;
  /** Returns a float in [0, 1). Injectable for deterministic tests. */
  random?: () => number;
}

export function bucket(value: number, edges: readonly number[]): string {
  let lower = 0;
  for (const edge of edges) {
    if (value < edge) return `${lower}-${edge}`;
    lower = edge;
  }
  return `${lower}+`;
}

export function vehicleFeatures(vehicle: Vehicle): string[] {
  return [
    `make:${vehicle.make}`,
    `model:${vehicle.make}|${vehicle.model}`,
    `body:${vehicle.bodyType}`,
    `fuel:${vehicle.fuel}`,
    `transmission:${vehicle.transmission}`,
    `price:${bucket(vehicle.priceEur, PRICE_EDGES)}`,
    `year:${bucket(vehicle.year, YEAR_EDGES)}`,
    `mileage:${bucket(vehicle.mileageKm, MILEAGE_EDGES)}`,
    `power:${bucket(vehicle.powerKw, POWER_EDGES)}`,
  ];
}

export function learnWeights(history: readonly SwipeHistoryEntry[], now: Date = new Date()): FeatureWeights {
  const weights: FeatureWeights = {};
  for (const entry of history) {
    const ageDays = Math.max(0, (now.getTime() - new Date(entry.createdAt).getTime()) / 86_400_000);
    const value = SWIPE_VALUES[entry.direction] * 0.5 ** (ageDays / HALF_LIFE_DAYS);
    for (const feature of vehicleFeatures(entry.vehicle)) {
      weights[feature] = (weights[feature] ?? 0) + value;
    }
  }
  return weights;
}

export function scoreVehicle(vehicle: Vehicle, weights: FeatureWeights): number {
  let score = 0;
  for (const feature of vehicleFeatures(vehicle)) {
    score += weights[feature] ?? 0;
  }
  return score;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks `limit` vehicles: the best-scored ones plus `explorationRate` random
 * picks from the rest, mixed in at random positions.
 */
export function rankFeed(
  candidates: readonly Vehicle[],
  weights: FeatureWeights,
  { limit, explorationRate = DEFAULT_EXPLORATION_RATE, random = Math.random }: RankOptions,
): Vehicle[] {
  // Shuffle first so equally scored vehicles come in a different order every time.
  const ranked = shuffled(candidates, random)
    .map((vehicle) => ({ vehicle, score: scoreVehicle(vehicle, weights) }))
    .sort((a, b) => b.score - a.score)
    .map(({ vehicle }) => vehicle);

  if (ranked.length <= limit) return ranked;

  const exploreCount = Math.round(limit * explorationRate);
  const feed = ranked.slice(0, limit - exploreCount);
  const explorePool = shuffled(ranked.slice(limit - exploreCount), random);

  for (const vehicle of explorePool.slice(0, exploreCount)) {
    feed.splice(Math.floor(random() * (feed.length + 1)), 0, vehicle);
  }
  return feed;
}
