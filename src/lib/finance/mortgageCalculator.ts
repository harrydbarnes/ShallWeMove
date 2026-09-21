/**
 * Mortgage repayment calculator and break-even equity analyser.
 */

import { FinancialBreakdown } from '../../types/finance';
import { CurrentHouseProfile, Property } from '../../types/property';
import { calculateSdlt } from './sdltCalculator';
import { estimateMovingCosts } from './movingCosts';

export interface MortgageCalculationInput {
  loanAmount: number;
  annualInterestRatePercent: number; // e.g. 4.5%
  termYears: number; // e.g. 25
}

/**
 * Standard monthly repayment mortgage payment formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyRepayment(input: MortgageCalculationInput): number {
  const { loanAmount, annualInterestRatePercent, termYears } = input;
  if (loanAmount <= 0) return 0;
  if (annualInterestRatePercent <= 0) {
    return Math.round(loanAmount / (termYears * 12));
  }

  const monthlyRate = annualInterestRatePercent / 100 / 12;
  const totalPayments = termYears * 12;

  const payment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return Math.round(payment);
}

/**
 * Computes full financial breakdown comparing current home to prospective purchase.
 */
export function computeFinancialBreakdown(
  currentHouse: CurrentHouseProfile,
  newProperty: Property,
  options?: {
    interestRatePercent?: number; // default 4.5%
    termYears?: number; // default 25
    additionalSavingsApplied?: number; // default 0
    buyerType?: 'moving_home' | 'first_time_buyer' | 'additional_property';
  }
): FinancialBreakdown {
  const interestRate = options?.interestRatePercent ?? 4.5;
  const termYears = options?.termYears ?? 25;
  const additionalSavings = options?.additionalSavingsApplied ?? 0;
  const buyerType = options?.buyerType ?? 'moving_home';

  // 1. Current House Equity
  const currentHouseValue = currentHouse.estimatedCurrentValue || currentHouse.price || 0;
  const currentMortgageRemaining = currentHouse.outstandingMortgage || 0;

  // 2. Moving costs & SDLT
  const sdltResult = calculateSdlt(newProperty.price, buyerType);
  const movingCosts = estimateMovingCosts(
    { currentHouseSalePrice: currentHouseValue },
    sdltResult.totalSdlt
  );

  const saleCosts = movingCosts.totalSaleCosts;
  const netEquityReleased = Math.max(0, currentHouseValue - currentMortgageRemaining - saleCosts);

  // 3. New Acquisition Costs
  const purchaseCosts = movingCosts.totalPurchaseCosts;
  const totalAcquisitionCost = newProperty.price + sdltResult.totalSdlt + purchaseCosts;

  // 4. Deposit & New Mortgage Required
  const totalAvailableCash = netEquityReleased + additionalSavings;
  const depositEquityUsed = Math.min(newProperty.price, totalAvailableCash);
  const newMortgageRequired = Math.max(0, totalAcquisitionCost - totalAvailableCash);

  const loanToValuePercent =
    newProperty.price > 0 ? (newMortgageRequired / newProperty.price) * 100 : 0;

  // 5. Monthly Outgoings
  const newMonthlyMortgage = calculateMonthlyRepayment({
    loanAmount: newMortgageRequired,
    annualInterestRatePercent: interestRate,
    termYears,
  });

  // Estimated council tax (using standard UK band averages if annual is unstated)
  const councilTaxBandMonthlyMap: Record<string, number> = {
    A: 120,
    B: 140,
    C: 160,
    D: 180,
    E: 220,
    F: 260,
    G: 300,
    H: 360,
    unknown: 175,
  };

  const newMonthlyCouncilTax = newProperty.councilTaxAnnual
    ? Math.round(newProperty.councilTaxAnnual / 12)
    : councilTaxBandMonthlyMap[newProperty.councilTaxBand] || 175;

  // Estimated energy costs based on EPC
  const epcMonthlyEnergyMap: Record<string, number> = {
    A: 90,
    B: 110,
    C: 145,
    D: 190,
    E: 245,
    F: 310,
    G: 380,
    unknown: 180,
  };
  const newMonthlyEnergy = epcMonthlyEnergyMap[newProperty.epcRating] || 180;

  const newMonthlyServiceCharge = newProperty.serviceChargeAnnual
    ? Math.round(newProperty.serviceChargeAnnual / 12)
    : 0;

  const newMonthlyGroundRent = newProperty.groundRentAnnual
    ? Math.round(newProperty.groundRentAnnual / 12)
    : 0;

  const totalNewMonthlyOutgoings =
    newMonthlyMortgage +
    newMonthlyCouncilTax +
    newMonthlyEnergy +
    newMonthlyServiceCharge +
    newMonthlyGroundRent;

  // Current House Monthly Outgoings
  const currentMonthlyOutgoings =
    (currentHouse.monthlyCosts.monthlyMortgageOrRent || 0) +
    (currentHouse.monthlyCosts.monthlyCouncilTax || 0) +
    (currentHouse.monthlyCosts.monthlyEnergy || 0) +
    (currentHouse.monthlyCosts.monthlyWater || 0) +
    (currentHouse.monthlyCosts.monthlyServiceCharge || 0) +
    (currentHouse.monthlyCosts.monthlyGroundRent || 0) +
    (currentHouse.monthlyCosts.monthlyInsurance || 0);

  const monthlyDifference = totalNewMonthlyOutgoings - currentMonthlyOutgoings;

  return {
    currentHouseValue,
    currentMortgageRemaining,
    saleCosts,
    netEquityReleased,
    newPropertyPrice: newProperty.price,
    sdltAmount: sdltResult.totalSdlt,
    purchaseCosts,
    totalAcquisitionCost,
    newMortgageRequired,
    additionalSavingsApplied: additionalSavings,
    depositEquityUsed,
    loanToValuePercent: Math.round(loanToValuePercent * 10) / 10,
    interestRatePercent: interestRate,
    mortgageTermYears: termYears,
    newMonthlyMortgage,
    newMonthlyCouncilTax,
    newMonthlyEnergy,
    newMonthlyServiceCharge,
    newMonthlyGroundRent,
    totalNewMonthlyOutgoings,
    currentMonthlyOutgoings,
    monthlyDifference,
  };
}
