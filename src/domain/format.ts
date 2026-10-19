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
