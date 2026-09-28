import { describe, expect, it } from 'vitest';
import { createMoveCandidate } from '../lib/candidateHandoff';
import { Property } from '../types/property';

describe('Home Move Planner candidate handoff', () => {
  it('exports only the candidate asking price and supplied property costs', () => {
    const property = {
      id: 'listing-1',
      source: 'manual',
      displayAddress: '  1 Example Road  ',
      price: 612345,
      councilTaxAnnual: 2800,
      serviceChargeAnnual: 0,
      groundRentAnnual: undefined,
      descriptionText: 'Private notes should not be exported',
    } as Property;

    expect(createMoveCandidate(property)).toEqual({
      kind: 'shall-we-move-candidate',
      version: 1,
      displayAddress: '1 Example Road',
      askingPrice: 612345,
      councilTaxAnnual: 2800,
      serviceChargeAnnual: 0,
      sample: false,
    });
  });

  it('omits invalid costs and labels sample data', () => {
    const property = {
      source: 'sample', displayAddress: 'Example', price: 500000,
      councilTaxAnnual: Number.NaN, serviceChargeAnnual: -1,
    } as Property;
    expect(createMoveCandidate(property)).toEqual({
      kind: 'shall-we-move-candidate', version: 1,
      displayAddress: 'Example', askingPrice: 500000, sample: true,
    });
  });
});
