import { describe, expect, it } from 'vitest';
import { getSampleListings } from '../lib/parser/sampleListings';
import { getDataConfidence, homeName } from '../lib/utils/homePresentation';

describe('saved home presentation', () => {
  it('uses a user name without replacing the factual address', () => {
    const property = { ...getSampleListings()[0], nickname: 'The garden house' };
    expect(homeName(property)).toBe('The garden house');
    expect(property.displayAddress).toContain('Church Lane');
    expect(homeName({ ...property, nickname: '  ' })).toBe(property.displayAddress);
  });

  it('labels import evidence coverage without claiming to predict the move', () => {
    const property = { ...getSampleListings()[0], source: 'paste' as const };
    const confidence = getDataConfidence(property);
    expect(confidence.detail).toMatch(/listing|details|field-level/i);
    expect(confidence.detail).not.toMatch(/chance|probability/i);
    expect(getDataConfidence({ ...property, source: 'manual' }).label).toBe('User entered');
  });
});
