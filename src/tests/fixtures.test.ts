import { describe, it, expect } from 'vitest';
import { parseListingInput } from '../lib/parser/index';
import fixture1 from './fixtures/01-victorian-semi.json';
import fixture2 from './fixtures/02-modern-leasehold-flat.json';
import fixture3 from './fixtures/03-detached-family-home.json';
import fixture4 from './fixtures/04-period-conversion-flat.json';
import fixture5 from './fixtures/05-brand-new-build.json';

describe('Realistic Listing Fixtures', () => {
  it('parses Fixture 1: Victorian 3-bed semi-detached', () => {
    const res = parseListingInput(fixture1, 'paste');
    expect(res.property.propertyType).toBe('semi-detached');
    expect(res.property.bedrooms).toBe(3);
    expect(res.property.tenure).toBe('freehold');
    expect(res.property.loftStatus).toBe('boarded_with_ladder_light');
    expect(res.property.gardenOrientation).toBe('south');
    expect(res.property.chainStatus).toBe('no_onward_chain');
  });

  it('parses Fixture 2: Modern 2-bed leasehold flat', () => {
    const res = parseListingInput(fixture2, 'paste');
    expect(res.property.propertyType).toBe('flat');
    expect(res.property.tenure).toBe('leasehold');
    expect(res.property.leaseYearsRemaining).toBe(112);
    expect(res.property.hasEnSuite).toBe(true);
    expect(res.property.epcRating).toBe('B');
  });

  it('parses Fixture 3: Executive 4-bed detached with converted loft & double garage', () => {
    const res = parseListingInput(fixture3, 'paste');
    expect(res.property.propertyType).toBe('detached');
    expect(res.property.bedrooms).toBe(4);
    expect(res.property.garageType).toBe('integral');
    expect(res.property.loftStatus).toBe('converted_with_building_regs');
    expect(res.property.hasEvCharger).toBe(true);
    expect(res.property.hasSolarPanels).toBe(true);
  });

  it('parses Fixture 4: Period conversion flat needing modernisation', () => {
    const res = parseListingInput(fixture4, 'paste');
    expect(res.property.propertyType).toBe('flat');
    expect(res.property.tenure).toBe('share_of_freehold');
    expect(res.property.needsModernisation).toBe(true);
    expect(res.property.leaseYearsRemaining).toBe(999);
  });

  it('parses Fixture 5: Brand new build eco home with EPC A', () => {
    const res = parseListingInput(fixture5, 'paste');
    expect(res.property.bedrooms).toBe(3);
    expect(res.property.epcRating).toBe('A');
    expect(res.property.hasUnderfloorHeating).toBe(true);
    expect(res.property.hasSolarPanels).toBe(true);
    expect(res.property.hasEvCharger).toBe(true);
  });
});
