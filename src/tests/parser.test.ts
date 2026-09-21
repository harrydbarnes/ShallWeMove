import { describe, it, expect } from 'vitest';
import { parseListingInput, extractPageModelFromHtml } from '../lib/parser/index';
import fixtureVictorian from './fixtures/01-victorian-semi.json';
import fixtureLeasehold from './fixtures/02-modern-leasehold-flat.json';

describe('Rightmove Listing Parser', () => {
  it('parses window.PAGE_MODEL JSON object correctly', () => {
    const result = parseListingInput(fixtureVictorian, 'paste');

    expect(result.parseStrategy).toBe('page_model');
    expect(result.property.displayAddress).toBe('14 Church Lane, Headington, Oxford, OX3 9HQ');
    expect(result.property.price).toBe(475000);
    expect(result.property.bedrooms).toBe(3);
    expect(result.property.bathrooms).toBe(1);
    expect(result.property.propertyType).toBe('semi-detached');
    expect(result.property.tenure).toBe('freehold');
    expect(result.property.floorAreaSqFt).toBe(1050);
    expect(result.property.loftStatus).toBe('boarded_with_ladder_light');
    expect(result.property.hasDriveway).toBe(true);
    expect(result.property.gardenOrientation).toBe('south');
    expect(result.property.chainStatus).toBe('no_onward_chain');

    // Verify field extraction summary
    const addrSummary = result.summary.find((s) => s.fieldName === 'displayAddress');
    expect(addrSummary?.status).toBe('found');

    const loftSummary = result.summary.find((s) => s.fieldName === 'loftStatus');
    expect(loftSummary?.status).toBe('inferred');
    expect(loftSummary?.evidence).toBeDefined();
  });

  it('parses leasehold apartment with service charge and ground rent', () => {
    const result = parseListingInput(fixtureLeasehold, 'paste');

    expect(result.property.propertyType).toBe('flat');
    expect(result.property.tenure).toBe('leasehold');
    expect(result.property.leaseYearsRemaining).toBe(112);
    expect(result.property.epcRating).toBe('B');
    expect(result.property.hasEnSuite).toBe(true);
    expect(result.property.parkingSpaces).toBeGreaterThanOrEqual(1);
  });

  it('extracts window.PAGE_MODEL from raw HTML page source', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>Rightmove Property</title></head>
      <body>
        <script>
          window.PAGE_MODEL = ${JSON.stringify(fixtureVictorian)};
        </script>
      </body>
      </html>
    `;

    const extracted = extractPageModelFromHtml(mockHtml);
    expect(extracted).not.toBeNull();

    const result = parseListingInput(mockHtml, 'paste');
    expect(result.parseStrategy).toBe('html_regex');
    expect(result.property.price).toBe(475000);
    expect(result.property.displayAddress).toContain('Headington');
  });

  it('parses raw copied plain text with regex heuristics', () => {
    const copiedText = `
      £350,000 Guide Price
      2 bed terraced house for sale
      45 High Street, St Albans, AL1 3QZ

      Key features
      - Two double bedrooms
      - South-facing garden
      - Driveway parking for 1 car
      - Boarded loft space
      - Freehold
      - Council Tax Band: C
      - EPC Rating: C

      Property description
      A lovely 2 bedroom period terrace situated in St Albans. Features a sunny south-facing garden and off-street driveway parking. Boarded loft with ladder.
    `;

    const result = parseListingInput(copiedText, 'paste');
    expect(result.parseStrategy).toBe('text_heuristics');
    expect(result.property.price).toBe(350000);
    expect(result.property.bedrooms).toBe(2);
    expect(result.property.propertyType).toBe('terraced');
    expect(result.property.tenure).toBe('freehold');
    expect(result.property.councilTaxBand).toBe('C');
    expect(result.property.epcRating).toBe('C');
    expect(result.property.gardenOrientation).toBe('south');
    expect(result.property.hasDriveway).toBe(true);
  });

  it('parses URL hash data payload encoded by bookmarklet', () => {
    const jsonStr = JSON.stringify(fixtureVictorian);
    const hashUrl = `#data=${encodeURIComponent(jsonStr)}`;

    const result = parseListingInput(hashUrl, 'bookmarklet');
    expect(result.parseStrategy).toBe('url_hash');
    expect(result.property.price).toBe(475000);
    expect(result.property.source).toBe('bookmarklet');
  });
});
