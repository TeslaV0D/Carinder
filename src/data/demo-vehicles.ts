/**
 * Deterministic demo inventory. Not real listings: makes, models and power
 * ranges are plausible, prices follow a simple depreciation curve. Used by
 * demo mode and to generate `supabase/seed.sql`.
 */

import type { BodyType, Fuel, Transmission, Vehicle } from '../domain/vehicle';

interface CatalogModel {
  make: string;
  model: string;
  bodyType: BodyType;
  fuels: Fuel[];
  powerKw: [number, number];
  newPriceEur: number;
  years: [number, number];
  variants: string[];
}

const CATALOG: CatalogModel[] = [
  { make: 'Volkswagen', model: 'Golf', bodyType: 'small', fuels: ['petrol', 'diesel', 'hybrid'], powerKw: [81, 180], newPriceEur: 32_000, years: [2012, 2026], variants: ['Life', 'Style', 'GTI', 'R-Line'] },
  { make: 'Volkswagen', model: 'Passat Variant', bodyType: 'estate', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [110, 200], newPriceEur: 45_000, years: [2011, 2026], variants: ['Business', 'Elegance', 'R-Line'] },
  { make: 'Volkswagen', model: 'ID.3', bodyType: 'small', fuels: ['electric'], powerKw: [107, 240], newPriceEur: 38_000, years: [2020, 2026], variants: ['Pure', 'Pro', 'Pro S', 'GTX'] },
  { make: 'Volkswagen', model: 'Tiguan', bodyType: 'suv', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [110, 195], newPriceEur: 42_000, years: [2012, 2026], variants: ['Life', 'Elegance', 'R-Line'] },
  { make: 'Volkswagen', model: 'up!', bodyType: 'small', fuels: ['petrol'], powerKw: [44, 85], newPriceEur: 15_000, years: [2012, 2023], variants: ['move up!', 'high up!', 'GTI'] },
  { make: 'BMW', model: '3er Touring', bodyType: 'estate', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [110, 275], newPriceEur: 52_000, years: [2012, 2026], variants: ['320d', '330i', '330e', 'M340i xDrive'] },
  { make: 'BMW', model: '1er', bodyType: 'small', fuels: ['petrol', 'diesel'], powerKw: [80, 235], newPriceEur: 35_000, years: [2012, 2026], variants: ['118i', '120d', 'M135i xDrive'] },
  { make: 'BMW', model: 'X3', bodyType: 'suv', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [135, 285], newPriceEur: 62_000, years: [2012, 2026], variants: ['xDrive20d', 'xDrive30e', 'M40i'] },
  { make: 'BMW', model: 'i4', bodyType: 'coupe', fuels: ['electric'], powerKw: [210, 400], newPriceEur: 60_000, years: [2021, 2026], variants: ['eDrive35', 'eDrive40', 'M50'] },
  { make: 'BMW', model: 'Z4', bodyType: 'convertible', fuels: ['petrol'], powerKw: [145, 285], newPriceEur: 52_000, years: [2012, 2026], variants: ['sDrive20i', 'M40i'] },
  { make: 'Mercedes-Benz', model: 'C-Klasse T-Modell', bodyType: 'estate', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [120, 300], newPriceEur: 55_000, years: [2012, 2026], variants: ['C 200', 'C 220 d', 'C 300 e', 'AMG C 43'] },
  { make: 'Mercedes-Benz', model: 'A-Klasse', bodyType: 'small', fuels: ['petrol', 'diesel'], powerKw: [80, 165], newPriceEur: 36_000, years: [2013, 2026], variants: ['A 180', 'A 200', 'A 250'] },
  { make: 'Mercedes-Benz', model: 'E-Klasse', bodyType: 'sedan', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [143, 280], newPriceEur: 68_000, years: [2012, 2026], variants: ['E 220 d', 'E 300 e', 'E 450 4MATIC'] },
  { make: 'Mercedes-Benz', model: 'EQA', bodyType: 'suv', fuels: ['electric'], powerKw: [140, 215], newPriceEur: 50_000, years: [2021, 2026], variants: ['250', '300 4MATIC', '350 4MATIC'] },
  { make: 'Audi', model: 'A4 Avant', bodyType: 'estate', fuels: ['diesel', 'petrol'], powerKw: [110, 260], newPriceEur: 50_000, years: [2012, 2025], variants: ['35 TDI', '40 TFSI', '45 TFSI quattro', 'S4'] },
  { make: 'Audi', model: 'A3 Sportback', bodyType: 'small', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [81, 228], newPriceEur: 36_000, years: [2012, 2026], variants: ['30 TFSI', '35 TDI', '40 TFSI e', 'S3'] },
  { make: 'Audi', model: 'Q5', bodyType: 'suv', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [150, 270], newPriceEur: 60_000, years: [2012, 2026], variants: ['40 TDI quattro', '55 TFSI e', 'SQ5'] },
  { make: 'Audi', model: 'Q4 e-tron', bodyType: 'suv', fuels: ['electric'], powerKw: [125, 250], newPriceEur: 52_000, years: [2021, 2026], variants: ['35', '45', '55 quattro'] },
  { make: 'Audi', model: 'TT', bodyType: 'coupe', fuels: ['petrol'], powerKw: [145, 294], newPriceEur: 48_000, years: [2012, 2023], variants: ['40 TFSI', '45 TFSI quattro', 'TTS', 'TT RS'] },
  { make: 'Opel', model: 'Corsa', bodyType: 'small', fuels: ['petrol', 'electric'], powerKw: [55, 115], newPriceEur: 22_000, years: [2012, 2026], variants: ['Edition', 'GS', 'Electric'] },
  { make: 'Opel', model: 'Astra Sports Tourer', bodyType: 'estate', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [81, 165], newPriceEur: 32_000, years: [2012, 2026], variants: ['Edition', 'Elegance', 'GS'] },
  { make: 'Ford', model: 'Fiesta', bodyType: 'small', fuels: ['petrol'], powerKw: [52, 147], newPriceEur: 20_000, years: [2012, 2023], variants: ['Trend', 'Titanium', 'ST-Line', 'ST'] },
  { make: 'Ford', model: 'Focus Turnier', bodyType: 'estate', fuels: ['petrol', 'diesel', 'hybrid'], powerKw: [74, 206], newPriceEur: 30_000, years: [2012, 2025], variants: ['Trend', 'Titanium', 'ST-Line', 'ST'] },
  { make: 'Ford', model: 'Mustang', bodyType: 'coupe', fuels: ['petrol'], powerKw: [233, 338], newPriceEur: 60_000, years: [2015, 2026], variants: ['EcoBoost', 'GT', 'Mach 1'] },
  { make: 'Ford', model: 'Kuga', bodyType: 'suv', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [88, 165], newPriceEur: 38_000, years: [2013, 2026], variants: ['Titanium', 'ST-Line', 'Vignale'] },
  { make: 'Skoda', model: 'Octavia Combi', bodyType: 'estate', fuels: ['diesel', 'petrol', 'lpg'], powerKw: [81, 195], newPriceEur: 33_000, years: [2012, 2026], variants: ['Ambition', 'Style', 'RS'] },
  { make: 'Skoda', model: 'Enyaq', bodyType: 'suv', fuels: ['electric'], powerKw: [109, 250], newPriceEur: 46_000, years: [2021, 2026], variants: ['60', '85', 'RS'] },
  { make: 'Skoda', model: 'Fabia', bodyType: 'small', fuels: ['petrol', 'lpg'], powerKw: [44, 110], newPriceEur: 19_000, years: [2012, 2026], variants: ['Active', 'Ambition', 'Monte Carlo'] },
  { make: 'Seat', model: 'Leon', bodyType: 'small', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [81, 228], newPriceEur: 30_000, years: [2013, 2026], variants: ['Style', 'FR', 'Cupra'] },
  { make: 'Toyota', model: 'Corolla Touring Sports', bodyType: 'estate', fuels: ['hybrid'], powerKw: [90, 145], newPriceEur: 34_000, years: [2019, 2026], variants: ['Comfort', 'Team D', 'GR Sport'] },
  { make: 'Toyota', model: 'Yaris', bodyType: 'small', fuels: ['hybrid', 'petrol'], powerKw: [51, 96], newPriceEur: 22_000, years: [2012, 2026], variants: ['Comfort', 'Team D', 'Style'] },
  { make: 'Toyota', model: 'RAV4', bodyType: 'suv', fuels: ['hybrid', 'plugin_hybrid'], powerKw: [131, 225], newPriceEur: 45_000, years: [2016, 2026], variants: ['Comfort', 'Style', 'Adventure'] },
  { make: 'Mazda', model: 'MX-5', bodyType: 'convertible', fuels: ['petrol'], powerKw: [97, 135], newPriceEur: 33_000, years: [2012, 2026], variants: ['Prime-Line', 'Exclusive-Line', 'Homura'] },
  { make: 'Mazda', model: 'CX-5', bodyType: 'suv', fuels: ['petrol', 'diesel'], powerKw: [121, 143], newPriceEur: 38_000, years: [2012, 2026], variants: ['Prime-Line', 'Exclusive-Line', 'Takumi'] },
  { make: 'Hyundai', model: 'IONIQ 5', bodyType: 'suv', fuels: ['electric'], powerKw: [125, 239], newPriceEur: 48_000, years: [2021, 2026], variants: ['Dynamiq', 'Techniq', 'Uniq'] },
  { make: 'Hyundai', model: 'i30 Kombi', bodyType: 'estate', fuels: ['petrol', 'diesel'], powerKw: [74, 117], newPriceEur: 27_000, years: [2012, 2025], variants: ['Select', 'Trend', 'N Line'] },
  { make: 'Kia', model: 'Ceed Sportswagon', bodyType: 'estate', fuels: ['petrol', 'diesel', 'plugin_hybrid'], powerKw: [74, 150], newPriceEur: 28_000, years: [2012, 2026], variants: ['Vision', 'Spirit', 'GT Line'] },
  { make: 'Kia', model: 'EV6', bodyType: 'suv', fuels: ['electric'], powerKw: [125, 430], newPriceEur: 52_000, years: [2021, 2026], variants: ['Air', 'GT-Line', 'GT'] },
  { make: 'Tesla', model: 'Model 3', bodyType: 'sedan', fuels: ['electric'], powerKw: [208, 393], newPriceEur: 45_000, years: [2019, 2026], variants: ['Hinterradantrieb', 'Maximale Reichweite', 'Performance'] },
  { make: 'Tesla', model: 'Model Y', bodyType: 'suv', fuels: ['electric'], powerKw: [220, 393], newPriceEur: 48_000, years: [2021, 2026], variants: ['Hinterradantrieb', 'Maximale Reichweite', 'Performance'] },
  { make: 'Porsche', model: '911', bodyType: 'coupe', fuels: ['petrol'], powerKw: [283, 478], newPriceEur: 130_000, years: [2012, 2026], variants: ['Carrera', 'Carrera S', 'Carrera 4S', 'Turbo S'] },
  { make: 'Porsche', model: 'Macan', bodyType: 'suv', fuels: ['petrol', 'electric'], powerKw: [185, 470], newPriceEur: 80_000, years: [2014, 2026], variants: ['Basis', 'S', 'GTS', 'Turbo'] },
  { make: 'Volvo', model: 'V60', bodyType: 'estate', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [110, 335], newPriceEur: 52_000, years: [2012, 2026], variants: ['Core', 'Plus', 'Ultimate'] },
  { make: 'Volkswagen', model: 'Multivan', bodyType: 'van', fuels: ['diesel', 'petrol', 'plugin_hybrid'], powerKw: [110, 160], newPriceEur: 60_000, years: [2012, 2026], variants: ['Trendline', 'Comfortline', 'Highline'] },
  { make: 'Mercedes-Benz', model: 'V-Klasse', bodyType: 'van', fuels: ['diesel'], powerKw: [100, 174], newPriceEur: 65_000, years: [2014, 2026], variants: ['V 220 d', 'V 250 d', 'V 300 d'] },
  { make: 'Fiat', model: '500', bodyType: 'small', fuels: ['petrol', 'hybrid', 'electric'], powerKw: [51, 87], newPriceEur: 18_000, years: [2012, 2026], variants: ['Pop', 'Lounge', 'Dolcevita'] },
  { make: 'Renault', model: 'Clio', bodyType: 'small', fuels: ['petrol', 'diesel', 'hybrid', 'lpg'], powerKw: [49, 105], newPriceEur: 21_000, years: [2012, 2026], variants: ['Equilibre', 'Techno', 'Esprit Alpine'] },
  { make: 'Dacia', model: 'Duster', bodyType: 'suv', fuels: ['petrol', 'diesel', 'lpg'], powerKw: [74, 110], newPriceEur: 22_000, years: [2012, 2026], variants: ['Essential', 'Expression', 'Journey'] },
];

const CITIES: { city: string; zip: string }[] = [
  { city: 'Berlin', zip: '10115' },
  { city: 'Hamburg', zip: '20095' },
  { city: 'München', zip: '80331' },
  { city: 'Köln', zip: '50667' },
  { city: 'Frankfurt am Main', zip: '60311' },
  { city: 'Stuttgart', zip: '70173' },
  { city: 'Düsseldorf', zip: '40213' },
  { city: 'Leipzig', zip: '04109' },
  { city: 'Dortmund', zip: '44135' },
  { city: 'Bremen', zip: '28195' },
  { city: 'Dresden', zip: '01067' },
  { city: 'Hannover', zip: '30159' },
  { city: 'Nürnberg', zip: '90402' },
  { city: 'Freiburg', zip: '79098' },
];

export const DEMO_SOURCE_ID = 'demo';
export const DEMO_VEHICLE_COUNT = 300;
const REFERENCE_YEAR = 2026;

/** Small, fast seeded PRNG (mulberry32). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function between(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function transmissionFor(fuel: Fuel, model: CatalogModel, random: () => number): Transmission {
  if (fuel === 'electric' || fuel === 'hybrid' || fuel === 'plugin_hybrid') return 'automatic';
  const automaticShare = model.newPriceEur >= 45_000 ? 0.85 : 0.35;
  return random() < automaticShare ? 'automatic' : 'manual';
}

export function generateDemoVehicles(count = DEMO_VEHICLE_COUNT, seed = 42): Vehicle[] {
  const random = createRandom(seed);
  const vehicles: Vehicle[] = [];

  for (let i = 0; i < count; i++) {
    const model = pick(CATALOG, random);
    const fuel = pick(model.fuels, random);
    const year = between(model.years[0], model.years[1], random);
    const age = REFERENCE_YEAR - year;
    const yearlyKm = fuel === 'diesel' ? between(14_000, 26_000, random) : between(7_000, 16_000, random);
    const mileageKm = Math.max(10, roundTo(age * yearlyKm + between(0, 5_000, random), 100));
    const powerKw = roundTo(between(model.powerKw[0], model.powerKw[1], random), 5);
    const powerFactor = 1 + (powerKw - model.powerKw[0]) / (model.powerKw[1] * 2);
    const depreciation = 0.86 ** age * Math.max(0.35, 1 - mileageKm / 400_000);
    const priceEur = Math.max(1_500, roundTo(model.newPriceEur * powerFactor * depreciation, 100));
    const location = pick(CITIES, random);
    const sourceId = `demo-${String(i + 1).padStart(4, '0')}`;

    vehicles.push({
      id: sourceId,
      source: DEMO_SOURCE_ID,
      sourceId,
      make: model.make,
      model: model.model,
      variant: pick(model.variants, random),
      year,
      mileageKm,
      powerKw,
      fuel,
      transmission: transmissionFor(fuel, model, random),
      bodyType: model.bodyType,
      priceEur,
      zip: location.zip,
      city: location.city,
      images: [],
      sourceUrl: null,
    });
  }
  return vehicles;
}
