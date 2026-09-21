/**
 * English Stamp Duty Land Tax (SDLT) Calculator for residential purchases.
 * Supports:
 * - Standard residential rates (moving home / replacement main residence)
 * - First-Time Buyer relief (up to statutory price ceiling)
 * - Additional property surcharge (second homes / buy-to-let, e.g. 5% surcharge as per latest UK budget)
 */

import { BuyerType, SdltBandCalculation, SdltResult } from '../../types/finance';

// Current England standard residential bands
// 0% on first £250,000 (standard threshold)
// 5% on portion between £250,001 and £925,000
// 10% on portion between £925,001 and £1,500,000
// 12% on portion above £1,500,000
export const STANDARD_BANDS = [
  { min: 0, max: 250000, rate: 0.0, description: 'Up to £250,000' },
  { min: 250000, max: 925000, rate: 0.05, description: '£250,001 to £925,000' },
  { min: 925000, max: 1500000, rate: 0.1, description: '£925,001 to £1,500,000' },
  { min: 1500000, max: Infinity, rate: 0.12, description: 'Over £1,500,000' },
];

// First-Time Buyer relief bands:
// 0% on first £425,000
// 5% on portion between £425,001 and £625,000
// If property purchase price exceeds £625,000, standard rates apply to the entire price.
export const FTB_MAX_ELIGIBLE_PRICE = 625000;
export const FTB_BANDS = [
  { min: 0, max: 425000, rate: 0.0, description: 'Up to £425,000 (0% FTB Relief)' },
  { min: 425000, max: 625000, rate: 0.05, description: '£425,001 to £625,000 (5% FTB Relief)' },
];

export const ADDITIONAL_PROPERTY_SURCHARGE_RATE = 0.05; // 5% surcharge (updated Nov 2024)

/**
 * Calculates England SDLT payable on a given residential property price.
 */
export function calculateSdlt(
  price: number,
  buyerType: BuyerType = 'moving_home',
  options?: {
    surchargeRate?: number; // default 0.05 (5%) or legacy 0.03 (3%)
  }
): SdltResult {
  if (price <= 0 || isNaN(price)) {
    return {
      propertyPrice: 0,
      buyerType,
      totalSdlt: 0,
      effectiveTaxRatePercent: 0,
      bands: [],
      firstTimeBuyerEligible: buyerType === 'first_time_buyer',
      notes: [],
    };
  }

  const notes: string[] = [];
  const bandsResult: SdltBandCalculation[] = [];
  let totalSdlt = 0;
  const surchargeRate = options?.surchargeRate ?? ADDITIONAL_PROPERTY_SURCHARGE_RATE;

  if (buyerType === 'first_time_buyer') {
    if (price <= FTB_MAX_ELIGIBLE_PRICE) {
      // Eligible for FTB relief
      for (const band of FTB_BANDS) {
        if (price > band.min) {
          const taxableAmount = Math.min(price, band.max) - band.min;
          const tax = taxableAmount * band.rate;
          totalSdlt += tax;
          bandsResult.push({
            bandDescription: band.description,
            ratePercent: band.rate * 100,
            taxableAmountInBand: taxableAmount,
            taxPayableInBand: Math.round(tax),
          });
        }
      }
      notes.push('First-Time Buyer relief applied (property price £625,000 or under).');
    } else {
      // Over £625,000 - FTB relief completely lost, standard rates apply
      notes.push(
        `Property price exceeds the £625,000 First-Time Buyer ceiling. Standard residential rates apply.`
      );
      for (const band of STANDARD_BANDS) {
        if (price > band.min) {
          const taxableAmount = Math.min(price, band.max) - band.min;
          const tax = taxableAmount * band.rate;
          totalSdlt += tax;
          bandsResult.push({
            bandDescription: band.description,
            ratePercent: band.rate * 100,
            taxableAmountInBand: taxableAmount,
            taxPayableInBand: Math.round(tax),
          });
        }
      }
    }
  } else if (buyerType === 'additional_property') {
    // Standard bands + surcharge rate on every band
    notes.push(
      `Additional property surcharge of ${(surchargeRate * 100).toFixed(0)}% applied to all bands.`
    );
    for (const band of STANDARD_BANDS) {
      if (price > band.min) {
        const taxableAmount = Math.min(price, band.max) - band.min;
        const totalBandRate = band.rate + surchargeRate;
        const tax = taxableAmount * totalBandRate;
        totalSdlt += tax;
        bandsResult.push({
          bandDescription: `${band.description} (${(totalBandRate * 100).toFixed(0)}% incl. surcharge)`,
          ratePercent: totalBandRate * 100,
          taxableAmountInBand: taxableAmount,
          taxPayableInBand: Math.round(tax),
        });
      }
    }
  } else {
    // Standard moving home
    for (const band of STANDARD_BANDS) {
      if (price > band.min) {
        const taxableAmount = Math.min(price, band.max) - band.min;
        const tax = taxableAmount * band.rate;
        totalSdlt += tax;
        bandsResult.push({
          bandDescription: band.description,
          ratePercent: band.rate * 100,
          taxableAmountInBand: taxableAmount,
          taxPayableInBand: Math.round(tax),
        });
      }
    }
  }

  totalSdlt = Math.round(totalSdlt);
  const effectiveRate = price > 0 ? (totalSdlt / price) * 100 : 0;

  return {
    propertyPrice: price,
    buyerType,
    totalSdlt,
    effectiveTaxRatePercent: Math.round(effectiveRate * 10) / 10,
    bands: bandsResult,
    firstTimeBuyerEligible: buyerType === 'first_time_buyer' && price <= FTB_MAX_ELIGIBLE_PRICE,
    notes,
  };
}
