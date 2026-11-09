import { kwToPs, type Vehicle } from './vehicle';

const integer = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

export function formatPrice(eur: number): string {
  return `${integer.format(eur)} €`;
}

export function formatMileage(km: number): string {
  return `${integer.format(km)} km`;
}

export function formatPower(kw: number): string {
  return `${kw} kW (${kwToPs(kw)} PS)`;
}

export function vehicleTitle(vehicle: Pick<Vehicle, 'make' | 'model'>): string {
  return `${vehicle.make} ${vehicle.model}`;
}

export const MOBILE_DE_SOURCE_ID = 'mobilede';

/** mobile.de has no API for its watchlist ("Parkplatz"), so users park the car in the opened listing. */
export function sourceLinkLabel(vehicle: Pick<Vehicle, 'source'>): string {
  return vehicle.source === MOBILE_DE_SOURCE_ID ? 'Auf mobile.de ansehen & parken' : 'Original-Inserat ansehen';
}
