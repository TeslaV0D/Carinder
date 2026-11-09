import { buildFeed } from '../domain/feed';
import { DEFAULT_PREFERENCES, type Preferences } from '../domain/preferences';
import type { SwipeHistoryEntry } from '../domain/scoring';
import { fetchAll, type VehicleSource } from '../domain/source';
import { isLike, type Swipe, type SwipeDirection, type Vehicle } from '../domain/vehicle';
import type { CarinderRepository, LikedVehicle } from './repository';

/** Subset of AsyncStorage, so tests can pass an in-memory store. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const SWIPES_KEY = 'carinder.demo.swipes.v1';
const PREFERENCES_KEY = 'carinder.demo.preferences.v1';

/** Demo mode: inventory from a local source, swipes and filters on the device. */
export class LocalRepository implements CarinderRepository {
  readonly mode = 'demo';
  private vehicles: Promise<Map<string, Vehicle>> | null = null;

  constructor(
    private readonly store: KeyValueStore,
    private readonly source: VehicleSource,
    private readonly random: () => number = Math.random,
  ) {}

  async getFeed({ limit, excludeIds }: { limit?: number; excludeIds?: readonly string[] }): Promise<Vehicle[]> {
    const [vehicles, history, preferences] = await Promise.all([
      this.getVehicles(),
      this.getHistory(),
      this.getPreferences(),
    ]);
    return buildFeed([...vehicles.values()], history, {
      limit,
      preferences,
      excludeIds,
      random: this.random,
    });
  }

  async recordSwipe(vehicleId: string, direction: SwipeDirection): Promise<void> {
    const swipes = (await this.readSwipes()).filter((swipe) => swipe.vehicleId !== vehicleId);
    swipes.push({ vehicleId, direction, createdAt: new Date().toISOString() });
    await this.store.setItem(SWIPES_KEY, JSON.stringify(swipes));
  }

  async removeSwipe(vehicleId: string): Promise<void> {
    const swipes = (await this.readSwipes()).filter((swipe) => swipe.vehicleId !== vehicleId);
    await this.store.setItem(SWIPES_KEY, JSON.stringify(swipes));
  }

  async resetSwipes(): Promise<void> {
    await this.store.removeItem(SWIPES_KEY);
  }

  async getLiked(): Promise<LikedVehicle[]> {
    const history = await this.getHistory();
    return history
      .filter((entry): entry is SwipeHistoryEntry & { direction: LikedVehicle['direction'] } =>
        isLike(entry.direction),
      )
      .map((entry) => ({ vehicle: entry.vehicle, direction: entry.direction, likedAt: entry.createdAt }))
      .sort((a, b) => b.likedAt.localeCompare(a.likedAt));
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return (await this.getVehicles()).get(id) ?? null;
  }

  async getPreferences(): Promise<Preferences> {
    const raw = await this.store.getItem(PREFERENCES_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFERENCES;
  }

  async savePreferences(preferences: Preferences): Promise<void> {
    await this.store.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }

  private getVehicles(): Promise<Map<string, Vehicle>> {
    this.vehicles ??= fetchAll(this.source).then(
      (vehicles) => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    );
    return this.vehicles;
  }

  private async readSwipes(): Promise<Swipe[]> {
    const raw = await this.store.getItem(SWIPES_KEY);
    return raw ? (JSON.parse(raw) as Swipe[]) : [];
  }

  private async getHistory(): Promise<SwipeHistoryEntry[]> {
    const [vehicles, swipes] = await Promise.all([this.getVehicles(), this.readSwipes()]);
    return swipes.flatMap((swipe) => {
      const vehicle = vehicles.get(swipe.vehicleId);
      return vehicle ? [{ vehicle, direction: swipe.direction, createdAt: swipe.createdAt }] : [];
    });
  }
}
