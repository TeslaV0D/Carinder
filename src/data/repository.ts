import type { Preferences } from '../domain/preferences';
import type { SwipeDirection, Vehicle } from '../domain/vehicle';

export interface LikedVehicle {
  vehicle: Vehicle;
  direction: Extract<SwipeDirection, 'like' | 'superlike'>;
  likedAt: string;
}

/** Everything the screens need. Implemented for demo mode (on device) and Supabase. */
export interface CarinderRepository {
  readonly mode: 'demo' | 'supabase';
  /** Next batch of personalized vehicles, excluding swiped ones and `excludeIds`. */
  getFeed(options: { limit?: number; excludeIds?: readonly string[] }): Promise<Vehicle[]>;
  recordSwipe(vehicleId: string, direction: SwipeDirection): Promise<void>;
  removeSwipe(vehicleId: string): Promise<void>;
  resetSwipes(): Promise<void>;
  getLiked(): Promise<LikedVehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  getPreferences(): Promise<Preferences>;
  savePreferences(preferences: Preferences): Promise<void>;
}
