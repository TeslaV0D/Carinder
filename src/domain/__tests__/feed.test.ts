import { createRandom, generateDemoVehicles } from '../../data/demo-vehicles';
import { buildFeed } from '../feed';
import { DEFAULT_PREFERENCES, matchesPreferences } from '../preferences';

const vehicles = generateDemoVehicles(300, 11);

describe('buildFeed', () => {
  it('never returns swiped or excluded vehicles', () => {
    const history = vehicles.slice(0, 50).map((vehicle) => ({
      vehicle,
      direction: 'dislike' as const,
      createdAt: '2026-10-01T00:00:00Z',
    }));
    const excludeIds = vehicles.slice(50, 60).map((vehicle) => vehicle.id);

    const feed = buildFeed(vehicles, history, { limit: 100, excludeIds, random: createRandom(1) });
    const blocked = new Set([...history.map((entry) => entry.vehicle.id), ...excludeIds]);

    expect(feed).toHaveLength(100);
    expect(feed.some((vehicle) => blocked.has(vehicle.id))).toBe(false);
  });

  it('applies the hard filters', () => {
    const preferences = { ...DEFAULT_PREFERENCES, maxPriceEur: 20_000, fuels: ['electric' as const] };
    const feed = buildFeed(vehicles, [], { limit: 300, preferences });

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((vehicle) => vehicle.priceEur <= 20_000 && vehicle.fuel === 'electric')).toBe(true);
    expect(feed).toHaveLength(vehicles.filter((vehicle) => matchesPreferences(vehicle, preferences)).length);
  });
});
