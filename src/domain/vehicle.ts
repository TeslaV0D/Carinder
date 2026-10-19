/**
 * Source-agnostic vehicle model. Every data source (demo data, mobile.de,
 * dealer feeds, ...) is normalized into this shape before it reaches the app.
 */

export const FUELS = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'lpg'] as const;
export type Fuel = (typeof FUELS)[number];

export const TRANSMISSIONS = ['manual', 'automatic'] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export const BODY_TYPES = ['small', 'sedan', 'estate', 'suv', 'coupe', 'convertible', 'van'] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const SWIPE_DIRECTIONS = ['like', 'dislike', 'superlike'] as const;
export type SwipeDirection = (typeof SWIPE_DIRECTIONS)[number];

export interface Vehicle {
  id: string;
  source: string;
  sourceId: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  mileageKm: number;
  powerKw: number;
  fuel: Fuel;
  transmission: Transmission;
  bodyType: BodyType;
  priceEur: number;
  zip: string | null;
  city: string | null;
  images: string[];
  sourceUrl: string | null;
}

export interface Swipe {
  vehicleId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export const FUEL_LABELS: Record<Fuel, string> = {
  petrol: 'Benzin',
  diesel: 'Diesel',
  electric: 'Elektro',
  hybrid: 'Hybrid',
  plugin_hybrid: 'Plug-in-Hybrid',
  lpg: 'Autogas',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: 'Schaltgetriebe',
  automatic: 'Automatik',
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  small: 'Kleinwagen',
  sedan: 'Limousine',
  estate: 'Kombi',
  suv: 'SUV',
  coupe: 'Coupé',
  convertible: 'Cabrio',
  van: 'Van',
};

export function kwToPs(kw: number): number {
  return Math.round(kw * 1.35962);
}

export function isLike(direction: SwipeDirection): boolean {
  return direction === 'like' || direction === 'superlike';
}
