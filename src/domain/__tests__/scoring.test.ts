import { createRandom, generateDemoVehicles } from '../../data/demo-vehicles';
import { bucket, learnWeights, rankFeed, scoreVehicle, vehicleFeatures, type SwipeHistoryEntry } from '../scoring';
import type { Vehicle } from '../vehicle';

const NOW = new Date('2026-10-19T12:00:00Z');
const vehicles = generateDemoVehicles(300, 7);

function liked(vehicle: Vehicle, direction: SwipeHistoryEntry['direction'] = 'like'): SwipeHistoryEntry {
  return { vehicle, direction, createdAt: NOW.toISOString() };
}

describe('bucket', () => {
  it('maps values into labelled ranges', () => {
    expect(bucket(4_000, [5_000, 10_000])).toBe('0-5000');
    expect(bucket(5_000, [5_000, 10_000])).toBe('5000-10000');
    expect(bucket(25_000, [5_000, 10_000])).toBe('10000+');
  });
});

describe('learnWeights', () => {
  it('rewards liked features and punishes disliked ones', () => {
    const [car] = vehicles;
    const weights = learnWeights([liked(car)], NOW);
    expect(weights[`make:${car.make}`]).toBe(1);

    const disliked = learnWeights([liked(car, 'dislike')], NOW);
    expect(disliked[`make:${car.make}`]).toBe(-0.5);
  });

  it('counts a superlike double', () => {
    const [car] = vehicles;
    expect(learnWeights([liked(car, 'superlike')], NOW)[`body:${car.bodyType}`]).toBe(2);
  });

  it('halves the influence of a swipe after 30 days', () => {
    const [car] = vehicles;
    const old = { ...liked(car), createdAt: '2026-09-19T12:00:00Z' };
    expect(learnWeights([old], NOW)[`make:${car.make}`]).toBeCloseTo(0.5, 5);
  });
});

describe('rankFeed', () => {
  const bmwEstates = vehicles.filter((v) => v.make === 'BMW' && v.bodyType === 'estate');

  it('puts vehicles like the liked ones first', () => {
    const history = bmwEstates.slice(0, 5).map((v) => liked(v));
    const weights = learnWeights(history, NOW);
    const candidates = vehicles.filter((v) => !history.some((entry) => entry.vehicle.id === v.id));

    const feed = rankFeed(candidates, weights, { limit: 20, explorationRate: 0, random: createRandom(1) });

    expect(feed.length).toBe(20);
    const isSimilar = (v: Vehicle) => v.make === 'BMW' || v.bodyType === 'estate';
    const shareInPool = candidates.filter(isSimilar).length / candidates.length;
    expect(shareInPool).toBeLessThan(0.4);
    expect(feed.filter(isSimilar).length).toBeGreaterThanOrEqual(16);
    expect(scoreVehicle(feed[0], weights)).toBeGreaterThanOrEqual(scoreVehicle(feed[19], weights));
  });

  it('mixes in the configured share of exploration picks', () => {
    const weights = learnWeights(bmwEstates.slice(0, 5).map((v) => liked(v)), NOW);
    const random = createRandom(2);
    const ranked = rankFeed(vehicles, weights, { limit: 20, explorationRate: 0, random: createRandom(2) });
    const feed = rankFeed(vehicles, weights, { limit: 20, explorationRate: 0.15, random });

    const exploration = feed.filter((v) => !ranked.slice(0, 17).some((top) => top.id === v.id));
    expect(feed.length).toBe(20);
    expect(new Set(feed.map((v) => v.id)).size).toBe(20);
    expect(exploration.length).toBeLessThanOrEqual(3);
  });

  it('returns everything when there are fewer candidates than the limit', () => {
    expect(rankFeed(vehicles.slice(0, 5), {}, { limit: 20 })).toHaveLength(5);
  });

  it('works without any history', () => {
    expect(rankFeed(vehicles, {}, { limit: 20, random: createRandom(3) })).toHaveLength(20);
  });
});

describe('vehicleFeatures', () => {
  it('describes a vehicle by make, model, body, fuel and buckets', () => {
    const features = vehicleFeatures(vehicles[0]);
    expect(features).toHaveLength(9);
    expect(features[0]).toBe(`make:${vehicles[0].make}`);
  });
});
