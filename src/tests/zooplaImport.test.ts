import { describe, expect, it } from 'vitest';
import { parseListingInput } from '../lib/parser';
import { generateBookmarkletJs } from '../lib/bookmarklet/bookmarkletCode';

const leaseholdText = `
Zoopla
£500,000
2 bed flat for sale Platinum Riverside, Bessemer Place Greenwich SE10
2 beds
2 baths
1 reception
EPC rating C
Leasehold
About this property
Approx. 748 sq ft (69.5 sq m)
Chain free
More information
Tenure: Leasehold (230 years)
Service charge: £4,090.80 per year
Ground rent: £300 per year
Council tax band: C
https://www.zoopla.co.uk/for-sale/details/73959322/
`;

describe('Zoopla import', () => {
  it('reads copied listing facts and annual leasehold charges without invented defaults', () => {
    const { property, parseStrategy } = parseListingInput(leaseholdText);
    expect(parseStrategy).toBe('zoopla');
    expect(property).toMatchObject({
      zooplaId: '73959322',
      displayAddress: 'Platinum Riverside, Bessemer Place Greenwich SE10',
      price: 500000,
      bedrooms: 2,
      bathrooms: 2,
      receptions: 1,
      tenure: 'leasehold',
      leaseYearsRemaining: 230,
      serviceChargeAnnual: 4090.8,
      groundRentAnnual: 300,
      councilTaxBand: 'C',
      epcRating: 'C',
      floorAreaSqFt: 748,
    });
  });

  it('reads bookmarklet JSON and hash transfer, leaving unstated room counts at zero', () => {
    const payload = {
      kind: 'shall-we-move-zoopla',
      url: 'https://www.zoopla.co.uk/for-sale/details/73250965/',
      heading: '3 bed semi-detached house for sale Brassie Avenue, London W3',
      text: '£800,000\n3 bed semi-detached house for sale Brassie Avenue, London W3\n3 beds\nFreehold\nAbout this property\nOff-street parking\nMore information\nCouncil tax band: E',
    };
    const fromJson = parseListingInput(JSON.stringify(payload)).property;
    const fromHash = parseListingInput(`#data=${encodeURIComponent(JSON.stringify(payload))}`).property;
    expect(fromJson).toMatchObject({ price: 800000, bedrooms: 3, bathrooms: 0, tenure: 'freehold', propertyType: 'semi-detached' });
    expect(fromHash.zooplaId).toBe('73250965');
    expect(fromHash.bathrooms).toBe(0);
  });

  it('handles the live Zoopla heading split over two lines', () => {
    const payload = {
      kind: 'shall-we-move-zoopla',
      url: 'https://www.zoopla.co.uk/for-sale/details/73959322/',
      heading: '2 bed flat for sale\nPlatinum Riverside, Bessemer Place Greenwich SE10',
      text: '£500,000\n2 bed flat for sale\nPlatinum Riverside, Bessemer Place Greenwich SE10\n2 beds\n2 baths\n1 reception\nEPC Rating: C\nLeasehold\nAbout this property\nApprox. 748 sq ft\nService Charge: £4,090.80 P/A\nGround Rent: £300 P/A\nZoopla tools\nMore information\nTenure : Leasehold (230 years)',
    };
    expect(parseListingInput(payload).property).toMatchObject({
      displayAddress: 'Platinum Riverside, Bessemer Place Greenwich SE10',
      price: 500000,
      bathrooms: 2,
      leaseYearsRemaining: 230,
    });
  });

  it('recognises Zoopla page source and keeps the bookmarklet portal aware', () => {
    const html = `<html><head><title>Zoopla</title></head><body><main><p>£500,000</p><h1>2 bed flat for sale Test Road, London SE10</h1><p>2 beds</p><p>Leasehold</p><h2>About this property</h2><p>500 sq ft</p><h2>More information</h2><p>Ground rent: £300 per year</p></main><a href="https://www.zoopla.co.uk/for-sale/details/12345678/">Listing</a></body></html>`;
    const property = parseListingInput(html).property;
    expect(property).toMatchObject({ price: 500000, bedrooms: 2, floorAreaSqFt: 500, groundRentAnnual: 300 });
    const bookmarklet = decodeURIComponent(generateBookmarkletJs());
    expect(bookmarklet).toContain('zoopla');
    expect(bookmarklet).toContain('rightmove');
    expect(() => new Function(bookmarklet.slice('javascript:'.length))).not.toThrow();
  });
});
