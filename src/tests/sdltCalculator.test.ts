import { describe, it, expect } from 'vitest';
import { calculateSdlt } from '../lib/finance/sdltCalculator';

describe('English Stamp Duty Land Tax (SDLT) Calculator', () => {
  describe('Standard Residential Rates (Moving Home)', () => {
    it('charges 0% up to £250,000', () => {
      const res = calculateSdlt(250000, 'moving_home');
      expect(res.totalSdlt).toBe(0);
      expect(res.effectiveTaxRatePercent).toBe(0);
    });

    it('charges 5% on portion between £250,000 and £925,000', () => {
      // £300,000 -> 5% on £50,000 = £2,500
      const res300k = calculateSdlt(300000, 'moving_home');
      expect(res300k.totalSdlt).toBe(2500);

      // £500,000 -> 5% on £250,000 = £12,500
      const res500k = calculateSdlt(500000, 'moving_home');
      expect(res500k.totalSdlt).toBe(12500);
      expect(res500k.effectiveTaxRatePercent).toBe(2.5);
    });

    it('charges 10% on portion between £925,000 and £1,500,000', () => {
      // £1,000,000: 5% on £675,000 (£33,750) + 10% on £75,000 (£7,500) = £41,250
      const res1m = calculateSdlt(1000000, 'moving_home');
      expect(res1m.totalSdlt).toBe(41250);
      expect(res1m.effectiveTaxRatePercent).toBe(4.1);
    });
  });

  describe('First-Time Buyer Relief', () => {
    it('charges £0 up to £425,000 for first-time buyers', () => {
      const res = calculateSdlt(425000, 'first_time_buyer');
      expect(res.totalSdlt).toBe(0);
      expect(res.firstTimeBuyerEligible).toBe(true);
    });

    it('charges 5% between £425,000 and £625,000', () => {
      // £500,000 -> 5% on £75,000 = £3,750 (saves £8,750 vs standard £12,500)
      const res = calculateSdlt(500000, 'first_time_buyer');
      expect(res.totalSdlt).toBe(3750);
      expect(res.firstTimeBuyerEligible).toBe(true);
    });

    it('removes relief completely above £625,000 reverting to standard rates', () => {
      // £650,000 -> Standard rates: 5% on (£650,000 - £250,000 = £400,000) = £20,000
      const res = calculateSdlt(650000, 'first_time_buyer');
      expect(res.totalSdlt).toBe(20000);
      expect(res.firstTimeBuyerEligible).toBe(false);
      expect(res.notes.some((n) => n.includes('exceeds the £625,000'))).toBe(true);
    });
  });

  describe('Additional Property Surcharge (5% rate)', () => {
    it('applies 5% surcharge to all bands', () => {
      // £300,000: 5% on first £250k (£12,500) + 10% on £50k (£5,000) = £17,500
      const res = calculateSdlt(300000, 'additional_property');
      expect(res.totalSdlt).toBe(17500);
    });
  });
});
