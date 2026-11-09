import { formatMileage, formatPrice, vehicleTitle } from './format';
import type { Vehicle } from './vehicle';

export interface GarageShareEntry {
  vehicle: Vehicle;
  superlike: boolean;
}

/** Plain-text list of the garage with links to the original listings, for the share sheet. */
export function formatGarageShareText(entries: readonly GarageShareEntry[]): string {
  if (entries.length === 0) return '';

  const count = entries.length === 1 ? '1 Auto' : `${entries.length} Autos`;
  const blocks = entries.map(({ vehicle, superlike }) => {
    const name = [vehicleTitle(vehicle), vehicle.variant].filter(Boolean).join(' ');
    const summary = [
      `${superlike ? '★ ' : ''}${name}`,
      String(vehicle.year),
      formatMileage(vehicle.mileageKm),
      formatPrice(vehicle.priceEur),
    ].join(' · ');
    return vehicle.sourceUrl ? `${summary}\n${vehicle.sourceUrl}` : summary;
  });

  return `Meine Carinder-Garage (${count}):\n\n${blocks.join('\n\n')}`;
}
