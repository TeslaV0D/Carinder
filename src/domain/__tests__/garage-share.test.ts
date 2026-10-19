import { generateDemoVehicles } from '../../data/demo-vehicles';
import { MOBILE_DE_SOURCE_ID, sourceLinkLabel } from '../format';
import { formatGarageShareText } from '../garage-share';
import type { Vehicle } from '../vehicle';

const [demo] = generateDemoVehicles(1);
const listing: Vehicle = {
  ...demo,
  source: MOBILE_DE_SOURCE_ID,
  make: 'BMW',
  model: '3er Touring',
  variant: '320d',
  year: 2019,
  mileageKm: 84_000,
  priceEur: 18_900,
  sourceUrl: 'https://suchen.mobile.de/fahrzeuge/details.html?id=123&source=api',
};

// Intl puts a narrow no-break space before "€"; compare on plain spaces.
const normalize = (text: string) => text.replace(/[  ]/g, ' ');

describe('formatGarageShareText', () => {
  it('lists every car with its link', () => {
    const text = normalize(formatGarageShareText([{ vehicle: listing, superlike: true }]));
    expect(text).toBe(
      'Meine Carinder-Garage (1 Auto):\n\n' +
        '★ BMW 3er Touring 320d · 2019 · 84.000 km · 18.900 €\n' +
        'https://suchen.mobile.de/fahrzeuge/details.html?id=123&source=api',
    );
  });

  it('skips the link line for cars without a listing and marks only superlikes', () => {
    const text = normalize(
      formatGarageShareText([
        { vehicle: listing, superlike: false },
        { vehicle: { ...demo, sourceUrl: null }, superlike: false },
      ]),
    );
    const blocks = text.split('\n\n');
    expect(blocks[0]).toBe('Meine Carinder-Garage (2 Autos):');
    expect(blocks[1].startsWith('BMW 3er Touring')).toBe(true);
    expect(blocks[2]).not.toContain('\n');
    expect(text).not.toContain('★');
  });

  it('returns an empty string for an empty garage', () => {
    expect(formatGarageShareText([])).toBe('');
  });
});

describe('sourceLinkLabel', () => {
  it('offers parking only for mobile.de listings', () => {
    expect(sourceLinkLabel(listing)).toBe('Auf mobile.de ansehen & parken');
    expect(sourceLinkLabel(demo)).toBe('Original-Inserat ansehen');
  });
});
