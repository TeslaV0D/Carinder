import { DEFAULT_PREFERENCES } from '../../domain/preferences';
import { createRandom, DEMO_VEHICLE_COUNT, generateDemoVehicles } from '../demo-vehicles';
import { LocalRepository, type KeyValueStore } from '../local-repository';
import { DemoSource } from '../sources/demo-source';

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();
  async getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  async removeItem(key: string) {
    this.data.delete(key);
  }
}

function createRepository() {
  return new LocalRepository(new MemoryStore(), new DemoSource(), createRandom(5));
}

describe('LocalRepository', () => {
  it('serves a feed batch from the demo inventory', async () => {
    const feed = await createRepository().getFeed({});
    expect(feed).toHaveLength(20);
  });

  it('keeps liked vehicles in the garage and drops them from the feed', async () => {
    const repository = createRepository();
    const [first, second, third] = await repository.getFeed({});

    await repository.recordSwipe(first.id, 'like');
    await repository.recordSwipe(second.id, 'superlike');
    await repository.recordSwipe(third.id, 'dislike');

    const liked = await repository.getLiked();
    expect(liked.map((entry) => entry.vehicle.id).sort()).toEqual([first.id, second.id].sort());

    const feed = await repository.getFeed({ limit: DEMO_VEHICLE_COUNT });
    const swiped = new Set([first.id, second.id, third.id]);
    expect(feed).toHaveLength(DEMO_VEHICLE_COUNT - 3);
    expect(feed.some((vehicle) => swiped.has(vehicle.id))).toBe(false);
  });

  it('removes and resets swipes', async () => {
    const repository = createRepository();
    const [first, second] = await repository.getFeed({});
    await repository.recordSwipe(first.id, 'like');
    await repository.recordSwipe(second.id, 'like');

    await repository.removeSwipe(first.id);
    expect((await repository.getLiked()).map((entry) => entry.vehicle.id)).toEqual([second.id]);

    await repository.resetSwipes();
    expect(await repository.getLiked()).toEqual([]);
  });

  it('stores preferences and filters the feed with them', async () => {
    const repository = createRepository();
    const preferences = { ...DEFAULT_PREFERENCES, bodyTypes: ['convertible' as const] };
    await repository.savePreferences(preferences);

    expect(await repository.getPreferences()).toEqual(preferences);
    const feed = await repository.getFeed({ limit: DEMO_VEHICLE_COUNT });
    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((vehicle) => vehicle.bodyType === 'convertible')).toBe(true);
  });
});

describe('generateDemoVehicles', () => {
  it('is deterministic and plausible', () => {
    const vehicles = generateDemoVehicles();
    expect(generateDemoVehicles()).toEqual(vehicles);
    expect(new Set(vehicles.map((vehicle) => vehicle.id)).size).toBe(vehicles.length);
    for (const vehicle of vehicles) {
      expect(vehicle.priceEur).toBeGreaterThanOrEqual(1_500);
      expect(vehicle.mileageKm).toBeGreaterThan(0);
      expect(vehicle.year).toBeLessThanOrEqual(2026);
      if (vehicle.fuel === 'electric') expect(vehicle.transmission).toBe('automatic');
    }
  });
});
