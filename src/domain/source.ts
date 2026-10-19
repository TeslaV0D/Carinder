import type { Vehicle } from './vehicle';

/**
 * A data source for vehicle listings. Each source (demo data, mobile.de
 * Search-API, dealer CSV feed, ...) normalizes its listings into `Vehicle`.
 * Sources with credentials only ever run server side (ingest job), never in
 * the app.
 */
export interface VehicleSource {
  readonly id: string;
  fetch(query: SourceQuery, cursor?: string): Promise<SourcePage>;
}

export interface SourceQuery {
  pageSize?: number;
}

export interface SourcePage {
  vehicles: Vehicle[];
  /** Cursor for the next page, absent on the last page. */
  next?: string;
}

/** Follows the cursor until the source has no more pages. */
export async function fetchAll(source: VehicleSource, query: SourceQuery = {}): Promise<Vehicle[]> {
  const all: Vehicle[] = [];
  let cursor: string | undefined;
  do {
    const page = await source.fetch(query, cursor);
    all.push(...page.vehicles);
    cursor = page.next;
  } while (cursor !== undefined);
  return all;
}
