import type { SupabaseClient } from '@supabase/supabase-js';

import { buildFeed } from '../domain/feed';
import { DEFAULT_PREFERENCES, type Preferences } from '../domain/preferences';
import type { SwipeHistoryEntry } from '../domain/scoring';
import type { BodyType, Fuel, SwipeDirection, Transmission, Vehicle } from '../domain/vehicle';
import type { CarinderRepository, LikedVehicle } from './repository';

/** Mirrors `public.vehicles` in supabase/migrations. */
export interface VehicleRow {
  id: string;
  source: string;
  source_id: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  mileage_km: number;
  power_kw: number;
  fuel: Fuel;
  transmission: Transmission;
  body_type: BodyType;
  price_eur: number;
  zip: string | null;
  city: string | null;
  images: string[];
  source_url: string | null;
}

interface SwipeWithVehicleRow {
  direction: SwipeDirection;
  created_at: string;
  vehicle: VehicleRow | null;
}

interface PreferencesRow {
  max_price_eur: number | null;
  min_year: number | null;
  max_mileage_km: number | null;
  fuels: Fuel[];
  body_types: BodyType[];
}

/** Candidates fetched per feed request; the ranking picks the best of them. */
const CANDIDATE_POOL_SIZE = 300;
/** Recent swipes used to learn preferences. */
const HISTORY_SIZE = 500;

export function vehicleFromRow(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    source: row.source,
    sourceId: row.source_id,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    mileageKm: row.mileage_km,
    powerKw: row.power_kw,
    fuel: row.fuel,
    transmission: row.transmission,
    bodyType: row.body_type,
    priceEur: row.price_eur,
    zip: row.zip,
    city: row.city,
    images: row.images,
    sourceUrl: row.source_url,
  };
}

function toHistory(rows: SwipeWithVehicleRow[]): SwipeHistoryEntry[] {
  return rows.flatMap((row) =>
    row.vehicle
      ? [{ vehicle: vehicleFromRow(row.vehicle), direction: row.direction, createdAt: row.created_at }]
      : [],
  );
}

export class SupabaseRepository implements CarinderRepository {
  readonly mode = 'supabase';

  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async getFeed({ limit, excludeIds }: { limit?: number; excludeIds?: readonly string[] }): Promise<Vehicle[]> {
    // feed_candidates already applies the hard filters and drops swiped vehicles.
    const [candidates, history] = await Promise.all([
      this.client.rpc('feed_candidates', { p_limit: CANDIDATE_POOL_SIZE }).throwOnError(),
      this.client
        .from('swipes')
        .select('direction, created_at, vehicle:vehicles(*)')
        .order('created_at', { ascending: false })
        .limit(HISTORY_SIZE)
        .throwOnError(),
    ]);
    return buildFeed(
      (candidates.data as VehicleRow[]).map(vehicleFromRow),
      toHistory(history.data as unknown as SwipeWithVehicleRow[]),
      { limit, excludeIds },
    );
  }

  async recordSwipe(vehicleId: string, direction: SwipeDirection): Promise<void> {
    await this.client
      .from('swipes')
      .upsert({ user_id: this.userId, vehicle_id: vehicleId, direction, created_at: new Date().toISOString() })
      .throwOnError();
  }

  async removeSwipe(vehicleId: string): Promise<void> {
    await this.client.from('swipes').delete().eq('user_id', this.userId).eq('vehicle_id', vehicleId).throwOnError();
  }

  async resetSwipes(): Promise<void> {
    await this.client.from('swipes').delete().eq('user_id', this.userId).throwOnError();
  }

  async getLiked(): Promise<LikedVehicle[]> {
    const { data } = await this.client
      .from('swipes')
      .select('direction, created_at, vehicle:vehicles(*)')
      .in('direction', ['like', 'superlike'])
      .order('created_at', { ascending: false })
      .throwOnError();
    return toHistory(data as unknown as SwipeWithVehicleRow[]).map((entry) => ({
      vehicle: entry.vehicle,
      direction: entry.direction as LikedVehicle['direction'],
      likedAt: entry.createdAt,
    }));
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const { data } = await this.client.from('vehicles').select('*').eq('id', id).maybeSingle().throwOnError();
    return data ? vehicleFromRow(data as VehicleRow) : null;
  }

  async getPreferences(): Promise<Preferences> {
    const { data } = await this.client
      .from('user_preferences')
      .select('max_price_eur, min_year, max_mileage_km, fuels, body_types')
      .eq('user_id', this.userId)
      .maybeSingle()
      .throwOnError();
    if (!data) return DEFAULT_PREFERENCES;
    const row = data as PreferencesRow;
    return {
      maxPriceEur: row.max_price_eur,
      minYear: row.min_year,
      maxMileageKm: row.max_mileage_km,
      fuels: row.fuels,
      bodyTypes: row.body_types,
    };
  }

  async savePreferences(preferences: Preferences): Promise<void> {
    await this.client
      .from('user_preferences')
      .upsert({
        user_id: this.userId,
        max_price_eur: preferences.maxPriceEur,
        min_year: preferences.minYear,
        max_mileage_km: preferences.maxMileageKm,
        fuels: preferences.fuels,
        body_types: preferences.bodyTypes,
        updated_at: new Date().toISOString(),
      })
      .throwOnError();
  }
}
