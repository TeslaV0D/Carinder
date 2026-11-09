import type { SourcePage, SourceQuery, VehicleSource } from '../../domain/source';
import { DEMO_SOURCE_ID, generateDemoVehicles } from '../demo-vehicles';

const DEFAULT_PAGE_SIZE = 100;

/** Serves the generated demo inventory page by page, like a real listing API would. */
export class DemoSource implements VehicleSource {
  readonly id = DEMO_SOURCE_ID;
  private readonly vehicles = generateDemoVehicles();

  async fetch({ pageSize = DEFAULT_PAGE_SIZE }: SourceQuery, cursor?: string): Promise<SourcePage> {
    const start = cursor ? Number(cursor) : 0;
    const end = start + pageSize;
    return {
      vehicles: this.vehicles.slice(start, end),
      next: end < this.vehicles.length ? String(end) : undefined,
    };
  }
}
