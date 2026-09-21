import React, { useState } from 'react';
import {
  PoundSterling,
  Calculator,
  Truck,
  TrendingDown,
  Info,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { BuyerType } from '../../types/finance';
import { CurrentHouseProfile } from '../../types/property';
import { calculateSdlt } from '../../lib/finance/sdltCalculator';
import { estimateMovingCosts } from '../../lib/finance/movingCosts';
import { computeFinancialBreakdown } from '../../lib/finance/mortgageCalculator';
import {
  formatCurrency,
  formatCurrencyDelta,
  formatPercentage,
} from '../../lib/utils/formatters';

interface MoneySectionProps {
  summary: ComparisonSummary;
}

export const MoneySection: React.FC<MoneySectionProps> = ({ summary }) => {
  const { currentProperty, newProperty } = summary;

  // Interactive controls
  const [buyerType, setBuyerType] = useState<BuyerType>('moving_home');
  const [interestRate, setInterestRate] = useState(4.5);
  const [termYears, setTermYears] = useState(25);
  const [agentFeePercent, setAgentFeePercent] = useState(1.2);
  const [additionalSavings, setAdditionalSavings] = useState(0);

  // Calculations
  const sdltResult = calculateSdlt(newProperty.price, buyerType);
  const movingCosts = estimateMovingCosts(
    {
      currentHouseSalePrice: (currentProperty as CurrentHouseProfile).estimatedCurrentValue || currentProperty.price,
      estateAgentRatePercent: agentFeePercent,
    },
    sdltResult.totalSdlt
  );

  const breakdown = computeFinancialBreakdown(currentProperty as any, newProperty, {
    interestRatePercent: interestRate,
    termYears,
    additionalSavingsApplied: additionalSavings,
    buyerType,
  });

  return (
    <div className="space-y-6">
      {/* 1. Stamp Duty Land Tax (England) */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PoundSterling className="w-4 h-4 text-brand-600" />
              <span>Stamp Duty Land Tax (SDLT - England)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current residential rates calculated on purchase price of {formatCurrency(newProperty.price)}
            </p>
          </div>

          {/* Buyer Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setBuyerType('moving_home')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                buyerType === 'moving_home'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Moving Home
            </button>
            <button
              onClick={() => setBuyerType('first_time_buyer')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                buyerType === 'first_time_buyer'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              First-Time Buyer
            </button>
            <button
              onClick={() => setBuyerType('additional_property')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                buyerType === 'additional_property'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Additional Home (+5%)
            </button>
          </div>
        </div>

        {/* SDLT Total Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Stamp Duty Payable:</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(sdltResult.totalSdlt)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Effective tax rate: <strong>{sdltResult.effectiveTaxRatePercent}%</strong>
            </span>
          </div>

          {sdltResult.notes.length > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
              {sdltResult.notes.map((note, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 mt-1">
                  <Info className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SDLT Tier Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2">Rate Band</th>
                <th className="py-2">Tax Rate</th>
                <th className="py-2">Taxable in Band</th>
                <th className="py-2 text-right">Tax Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sdltResult.bands.map((band, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                    {band.bandDescription}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{band.ratePercent}%</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">
                    {formatCurrency(band.taxableAmountInBand)}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(band.taxPayableInBand)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Moving Costs & Equity Release Break-even */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sale & Net Equity Release */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Calculator className="w-4 h-4 text-brand-600" />
            <span>Sale & Net Equity Released</span>
          </h4>

          <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Estimated Current House Sale Price</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(breakdown.currentHouseValue)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
              <span>Less: Outstanding Mortgage to Redeem</span>
              <span className="font-semibold">
                -{formatCurrency(breakdown.currentMortgageRemaining)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
              <div className="flex items-center space-x-1">
                <span>Less: Estate Agent Fee ({agentFeePercent}% + VAT)</span>
              </div>
              <span className="font-semibold">
                -{formatCurrency(movingCosts.estateAgentFee)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
              <span>Less: Sale Legal Conveyancing & EPC</span>
              <span className="font-semibold">
                -{formatCurrency(movingCosts.conveyancingSale + movingCosts.epcCost)}
              </span>
            </div>

            <div className="flex justify-between py-2 pt-3 font-extrabold text-sm text-emerald-700 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-700">
              <span>Net Cash Equity Released</span>
              <span>{formatCurrency(breakdown.netEquityReleased)}</span>
            </div>
          </div>
        </div>

        {/* Purchase Costs & Capital Required */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-brand-600" />
            <span>Purchase Costs & Capital Needed</span>
          </h4>

          <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>New Property Purchase Price</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(newProperty.price)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span>Stamp Duty (SDLT)</span>
              <span className="font-semibold">+{formatCurrency(sdltResult.totalSdlt)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span>Purchase Legal, Survey & Removals</span>
              <span className="font-semibold">+{formatCurrency(movingCosts.totalPurchaseCosts)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
              <span>Total Acquisition Outlay</span>
              <span>{formatCurrency(breakdown.totalAcquisitionCost)}</span>
            </div>

            <div className="flex justify-between py-2 pt-3 font-extrabold text-sm text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700">
              <span>New Mortgage Borrowing Required</span>
              <span className="text-brand-600 dark:text-brand-400">
                {formatCurrency(breakdown.newMortgageRequired)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              Implied Loan-to-Value (LTV): {breakdown.loanToValuePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* 3. Monthly Budget & Outgoings Comparison */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Monthly Budget & Running Outgoings</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Estimate ongoing monthly impact based on mortgage interest rates, council tax, and energy bills
            </p>
          </div>

          {/* Sliders: Interest Rate & Term */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Interest:</span>
              <select
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-bold"
              >
                <option value="3.5">3.5%</option>
                <option value="4.0">4.0%</option>
                <option value="4.5">4.5%</option>
                <option value="5.0">5.0%</option>
                <option value="5.5">5.5%</option>
                <option value="6.0">6.0%</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Term:</span>
              <select
                value={termYears}
                onChange={(e) => setTermYears(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-bold"
              >
                <option value="20">20 yrs</option>
                <option value="25">25 yrs</option>
                <option value="30">30 yrs</option>
                <option value="35">35 yrs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Monthly Delta Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500">Current Monthly Total:</span>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              {formatCurrency(breakdown.currentMonthlyOutgoings)}/mo
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mortgage: {formatCurrency((currentProperty as CurrentHouseProfile).monthlyCosts?.monthlyMortgageOrRent)}/mo
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900 text-xs">
            <span className="text-brand-700 dark:text-brand-300 font-medium">
              Estimated New Monthly Total:
            </span>
            <div className="text-xl font-bold text-brand-900 dark:text-white mt-1">
              {formatCurrency(breakdown.totalNewMonthlyOutgoings)}/mo
            </div>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-0.5">
              New Mortgage: {formatCurrency(breakdown.newMonthlyMortgage)}/mo
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs ${
              breakdown.monthlyDifference > 0
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <span className="font-medium">Net Monthly Change:</span>
            <div className="text-xl font-extrabold mt-1">
              {formatCurrencyDelta(breakdown.monthlyDifference)}/mo
            </div>
            <p className="text-[11px] mt-0.5 opacity-80">
              {breakdown.monthlyDifference > 0 ? 'Increase in ongoing expenses' : 'Monthly savings'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
