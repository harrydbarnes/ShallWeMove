/**
 * UK Property Moving Costs Estimator.
 */

import { MovingCostsEstimate } from '../../types/finance';

export interface MovingCostsInput {
  currentHouseSalePrice: number;
  estateAgentRatePercent?: number; // default 1.2%
  estateAgentVatIncluded?: boolean; // default false (20% VAT added)
  conveyancingSale?: number; // default £1,200
  conveyancingPurchase?: number; // default £1,500
  surveyCost?: number; // default £750
  removalCosts?: number; // default £1,000
  mortgageArrangementFee?: number; // default £999
  epcCost?: number; // default £90
  transferAndDisbursements?: number; // default £350
}

export function estimateMovingCosts(input: MovingCostsInput, sdltAmount = 0): MovingCostsEstimate {
  const agentPercent = input.estateAgentRatePercent ?? 1.2;
  const vatRate = input.estateAgentVatIncluded ? 1.0 : 1.2;
  const rawAgentFee = (input.currentHouseSalePrice * (agentPercent / 100)) * vatRate;

  const estateAgentFee = Math.round(rawAgentFee);
  const conveyancingSale = input.conveyancingSale ?? 1200;
  const epcCost = input.epcCost ?? 90;

  const conveyancingPurchase = input.conveyancingPurchase ?? 1500;
  const surveyCost = input.surveyCost ?? 750;
  const mortgageArrangementFee = input.mortgageArrangementFee ?? 999;
  const removalCosts = input.removalCosts ?? 1000;
  const transferAndDisbursements = input.transferAndDisbursements ?? 350;

  const totalSaleCosts = estateAgentFee + conveyancingSale + epcCost;
  const totalPurchaseCosts =
    conveyancingPurchase + surveyCost + mortgageArrangementFee + removalCosts + transferAndDisbursements;

  const totalMovingCostsExcludingSdlt = totalSaleCosts + totalPurchaseCosts;
  const totalMovingCostsIncludingSdlt = totalMovingCostsExcludingSdlt + sdltAmount;

  return {
    estateAgentPercent: agentPercent,
    estateAgentVatIncluded: !!input.estateAgentVatIncluded,
    estateAgentFee,
    conveyancingSale,
    epcCost,
    conveyancingPurchase,
    surveyCost,
    mortgageArrangementFee,
    removalCosts,
    transferAndDisbursements,
    totalSaleCosts,
    totalPurchaseCosts,
    totalMovingCostsExcludingSdlt,
    totalMovingCostsIncludingSdlt,
  };
}
