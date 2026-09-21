import { describe, it, expect } from 'vitest';
import { calculateFitScore } from '../lib/scoring/fitScore';
import { generateAutoSuggestions } from '../lib/scoring/autoSuggestions';
import { SAMPLE_CURRENT_HOUSE } from '../lib/parser/sampleListings';
import { WantCriterion } from '../types/wants';
import fixtureVictorian from './fixtures/01-victorian-semi.json';
import fixtureApartment from './fixtures/02-modern-leasehold-flat.json';
import { parseListingInput } from '../lib/parser/index';

describe('Fit Score and Wants Evaluation Engine', () => {
  const propVictorian = parseListingInput(fixtureVictorian, 'sample').property;
  const propApartment = parseListingInput(fixtureApartment, 'sample').property;

  it('calculates weighted score accurately based on importance levels', () => {
    const wants: WantCriterion[] = [
      {
        id: 'w1',
        group: 'general',
        title: '3 Bedrooms',
        importance: 'must_have', // weight 5
        valueType: 'min_number',
        targetValue: 3,
        fieldKey: 'bedrooms',
      },
      {
        id: 'w2',
        group: 'general',
        title: 'South Facing Garden',
        importance: 'important', // weight 3
        valueType: 'enum',
        targetValue: 'south_or_west',
        fieldKey: 'gardenOrientation',
      },
      {
        id: 'w3',
        group: 'general',
        title: 'EV Charger',
        importance: 'nice_to_have', // weight 1
        valueType: 'boolean',
        targetValue: true,
        fieldKey: 'hasEvCharger',
      },
    ];

    // propVictorian: 3 beds (met: 5 pts), south garden (met: 3 pts), no ev charger (failed: 0 pts).
    // total earned: 8 / 9 = ~89%
    const score = calculateFitScore(propVictorian, wants);
    expect(score.overallScore).toBe(89);
    expect(score.isDealBreakerHit).toBe(false);
    expect(score.mustHavesMetCount).toBe(1);
    expect(score.mustHavesTotalCount).toBe(1);
  });

  it('flags deal breakers and identifies triggered deal breakers', () => {
    const wants: WantCriterion[] = [
      {
        id: 'db1',
        group: 'general',
        title: 'Must have private garden',
        importance: 'deal_breaker',
        valueType: 'boolean',
        targetValue: true,
        fieldKey: 'hasGarden',
      },
      {
        id: 'db2',
        group: 'general',
        title: 'Must have at least 3 bedrooms',
        importance: 'deal_breaker',
        valueType: 'min_number',
        targetValue: 3,
        fieldKey: 'bedrooms',
      },
    ];

    // Apartment has no garden and only 2 bedrooms -> both deal breakers hit!
    const score = calculateFitScore(propApartment, wants);
    expect(score.isDealBreakerHit).toBe(true);
    expect(score.dealBreakersTriggered.length).toBe(2);
    expect(score.plainEnglishVerdict).toContain('Deal breaker triggered');
  });

  it('generates tailored auto-suggestions from current house profile', () => {
    const suggestions = generateAutoSuggestions(SAMPLE_CURRENT_HOUSE);

    expect(suggestions.length).toBeGreaterThanOrEqual(4);

    // Current house has 2 beds -> should suggest 3 beds
    const bedSuggestion = suggestions.find((s) => s.fieldKey === 'bedrooms');
    expect(bedSuggestion).toBeDefined();
    expect(bedSuggestion?.targetValue).toBe(3);

    // Current house has 0 parking spaces -> should suggest off-street parking
    const parkingSuggestion = suggestions.find((s) => s.fieldKey === 'parkingSpaces');
    expect(parkingSuggestion).toBeDefined();

    // Current house has north garden -> should suggest sunny garden
    const gardenSuggestion = suggestions.find((s) => s.fieldKey === 'gardenOrientation');
    expect(gardenSuggestion).toBeDefined();

    // Current house has EPC D -> should suggest EPC C or above
    const epcSuggestion = suggestions.find((s) => s.fieldKey === 'epcRating');
    expect(epcSuggestion).toBeDefined();
  });

  it('computes comparative score delta against baseline current house', () => {
    const wants: WantCriterion[] = [
      {
        id: 'w1',
        group: 'general',
        title: 'At least 3 bedrooms',
        importance: 'must_have',
        valueType: 'min_number',
        targetValue: 3,
        fieldKey: 'bedrooms',
      },
      {
        id: 'w2',
        group: 'general',
        title: 'Off-street parking',
        importance: 'must_have',
        valueType: 'min_number',
        targetValue: 1,
        fieldKey: 'parkingSpaces',
      },
    ];

    // Current house has 2 beds (0 pts) and 0 parking (0 pts) -> baseline = 0
    // Victorian semi has 3 beds (5 pts) and 2 spaces (5 pts) -> 100
    const result = calculateFitScore(propVictorian, wants, SAMPLE_CURRENT_HOUSE);
    expect(result.overallScore).toBe(100);
    expect(result.baselineScore).toBe(0);
    expect(result.scoreDelta).toBe(100);
    expect(result.plainEnglishVerdict).toContain('Substantial upgrade');
  });
});
