import { describe, it, expect } from 'vitest';
import { isUkPostcode, formatUkPostcode } from '../lib/services/addressLookup';

describe('Address and Postcode Helpers', () => {
  it('correctly identifies valid UK postcodes in various formats', () => {
    expect(isUkPostcode('SW1A 2AA')).toBe(true);
    expect(isUkPostcode('sw1a2aa')).toBe(true);
    expect(isUkPostcode('OX4 1QZ')).toBe(true);
    expect(isUkPostcode('M1 1AE')).toBe(true);
    expect(isUkPostcode('B33 8TH')).toBe(true);
    expect(isUkPostcode('CR2 6XH')).toBe(true);
    expect(isUkPostcode('DN55 1PT')).toBe(true);
  });

  it('rejects general non-postcode address strings', () => {
    expect(isUkPostcode('10 Downing Street')).toBe(false);
    expect(isUkPostcode('Oxford Road, Manchester')).toBe(false);
    expect(isUkPostcode('London')).toBe(false);
    expect(isUkPostcode('')).toBe(false);
  });

  it('formats UK postcodes into standard spaced uppercase format', () => {
    expect(formatUkPostcode('sw1a2aa')).toBe('SW1A 2AA');
    expect(formatUkPostcode('ox41qz')).toBe('OX4 1QZ');
    expect(formatUkPostcode('m11ae')).toBe('M1 1AE');
    expect(formatUkPostcode('b338th')).toBe('B33 8TH');
  });
});
