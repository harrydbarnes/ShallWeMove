import { describe, it, expect } from 'vitest';
import { analysePropertyText } from '../lib/analyser/textAnalyser';

describe('British Property Text Analyser', () => {
  it('detects all 4 loft statuses and extracts evidence', () => {
    // 1. Not mentioned
    const res1 = analysePropertyText('A 2 bedroom flat on the second floor.');
    expect(res1.loftStatus).toBe('not_mentioned');

    // 2. Boarded
    const res2 = analysePropertyText('Includes a partially boarded loft for convenient storage.');
    expect(res2.loftStatus).toBe('boarded');
    expect(res2.loftEvidence?.toLowerCase()).toContain('boarded');

    // 3. Boarded with ladder and light
    const res3 = analysePropertyText('Access to boarded loft with pull-down ladder and electric light.');
    expect(res3.loftStatus).toBe('boarded_with_ladder_light');
    expect(res3.loftEvidence?.toLowerCase()).toContain('ladder');

    // 4. Converted with building regs
    const res4 = analysePropertyText('Second floor boasts a dormer loft conversion with full building regulations approval.');
    expect(res4.loftStatus).toBe('converted_with_building_regs');
    expect(res4.loftEvidence?.toLowerCase()).toContain('building');
  });

  it('detects garage types accurately', () => {
    const doubleRes = analysePropertyText('Features a spacious double garage and private driveway.');
    expect(doubleRes.garageType).toBe('double');

    const integralRes = analysePropertyText('Kitchen door leads directly into the integral garage.');
    expect(integralRes.garageType).toBe('integral');

    const detachedRes = analysePropertyText('At the end of the garden is a detached garage with workshop.');
    expect(detachedRes.garageType).toBe('detached');

    const singleRes = analysePropertyText('Benefits from a single garage and off street parking.');
    expect(singleRes.garageType).toBe('single');
  });

  it('detects parking capacity, driveway, and EV chargers', () => {
    const res = analysePropertyText(
      'Block-paved driveway providing off-street parking for 3 cars, fitted with a 7kW EV charging point.'
    );
    expect(res.hasDriveway).toBe(true);
    expect(res.parkingSpacesInferred).toBe(3);
    expect(res.hasEvCharger).toBe(true);
    expect(res.evChargerEvidence).toBeDefined();
  });

  it('detects garden orientations', () => {
    const swRes = analysePropertyText('Beautiful south-westerly facing rear garden with patio.');
    expect(swRes.gardenOrientation).toBe('south_west');

    const sRes = analysePropertyText('Sunny south-facing garden with extensive lawn.');
    expect(sRes.gardenOrientation).toBe('south');

    const wRes = analysePropertyText('Enclosed west-facing garden perfect for afternoon sun.');
    expect(wRes.gardenOrientation).toBe('west');
  });

  it('detects internal rooms and modern amenities', () => {
    const res = analysePropertyText(
      'Master bedroom with en-suite shower room, separate utility room, downstairs WC / cloakroom, dedicated home office, and open-plan kitchen diner with underfloor heating and a new boiler.'
    );
    expect(res.hasEnSuite).toBe(true);
    expect(res.hasUtilityRoom).toBe(true);
    expect(res.hasDownstairsWc).toBe(true);
    expect(res.hasHomeOfficeOrStudy).toBe(true);
    expect(res.hasOpenPlanKitchen).toBe(true);
    expect(res.hasUnderfloorHeating).toBe(true);
    expect(res.hasNewBoiler).toBe(true);
  });

  it('detects modernisation needs and chain-free status', () => {
    const res = analysePropertyText(
      'In need of complete modernisation and refurbishment throughout. Offered with no onward chain.'
    );
    expect(res.needsModernisation).toBe(true);
    expect(res.chainStatus).toBe('no_onward_chain');
  });
});
