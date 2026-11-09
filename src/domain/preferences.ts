import type { BodyType, Fuel, Vehicle } from './vehicle';

/** Hard filters: vehicles that don't match are never shown. */
export interface Preferences {
  maxPriceEur: number | null;
  minYear: number | null;
  maxMileageKm: number | null;
  /** Empty means "any fuel". */
  fuels: Fuel[];
  /** Empty means "any body type". */
  bodyTypes: BodyType[];
}

export const DEFAULT_PREFERENCES: Preferences = {
  maxPriceEur: null,
  minYear: null,
  maxMileageKm: null,
  fuels: [],
  bodyTypes: [],
};

export function matchesPreferences(vehicle: Vehicle, prefs: Preferences): boolean {
  if (prefs.maxPriceEur !== null && vehicle.priceEur > prefs.maxPriceEur) return false;
  if (prefs.minYear !== null && vehicle.year < prefs.minYear) return false;
  if (prefs.maxMileageKm !== null && vehicle.mileageKm > prefs.maxMileageKm) return false;
  if (prefs.fuels.length > 0 && !prefs.fuels.includes(vehicle.fuel)) return false;
  if (prefs.bodyTypes.length > 0 && !prefs.bodyTypes.includes(vehicle.bodyType)) return false;
  return true;
}
