/**
 * Financial calculation types for UK property purchases:
 * SDLT (England), Moving Costs, Equity Release, and Monthly Running Budgets.
 */

export type BuyerType = 'moving_home' | 'first_time_buyer' | 'additional_property';

export interface SdltBandCalculation {
  bandDescription: string;
  ratePercent: number;
  taxableAmountInBand: number;
  taxPayableInBand: number;
}

export interface SdltResult {
  propertyPrice: number;
  buyerType: BuyerType;
  totalSdlt: number;
  effectiveTaxRatePercent: number;
  bands: SdltBandCalculation[];
  firstTimeBuyerEligible: boolean;
  notes: string[];
}

export interface MovingCostsEstimate {
  // Sale fees (Current House)
  estateAgentPercent: number; // typically 1.0% - 1.5%
  estateAgentVatIncluded: boolean;
  estateAgentFee: number;
  conveyancingSale: number;
  epcCost: number;

  // Purchase fees (New House)
  conveyancingPurchase: number;
  surveyCost: number; // Valuation / HomeBuyer / Full Building Survey
  mortgageArrangementFee: number;
  removalCosts: number;
  transferAndDisbursements: number;

  // Totals
  totalSaleCosts: number;
  totalPurchaseCosts: number;
  totalMovingCostsExcludingSdlt: number;
  totalMovingCostsIncludingSdlt: number;
}

export interface FinancialBreakdown {
  currentHouseValue: number;
  currentMortgageRemaining: number;
  saleCosts: number;
  netEquityReleased: number;

  newPropertyPrice: number;
  sdltAmount: number;
  purchaseCosts: number;
  totalAcquisitionCost: number; // newPropertyPrice + sdlt + purchaseCosts

  newMortgageRequired: number; // totalAcquisitionCost - netEquityReleased - additionalSavings
  additionalSavingsApplied: number;
  depositEquityUsed: number;
  loanToValuePercent: number;

  // Monthly breakdown
  interestRatePercent: number;
  mortgageTermYears: number;
  newMonthlyMortgage: number;
  newMonthlyCouncilTax: number;
  newMonthlyEnergy: number;
  newMonthlyServiceCharge: number;
  newMonthlyGroundRent: number;
  totalNewMonthlyOutgoings: number;

  currentMonthlyOutgoings: number;
  monthlyDifference: number; // positive = more expensive, negative = cheaper
}
