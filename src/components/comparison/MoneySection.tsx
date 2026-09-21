import React, { useState } from 'react';
import {
  PoundSterling,
  Calculator,
  Truck,
  TrendingDown,
  Info,
  Sliders,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Scale,
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
  const [showFullSdltTable, setShowFullSdltTable] = useState(false);
  const [showFullCostBreakdown, setShowFullCostBreakdown] = useState(false);

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

  const totalUpfrontCashNeeded =
    sdltResult.totalSdlt + movingCosts.totalMovingCostsExcludingSdlt;

  return (
    <div className="space-y-6">
      {/* 1. THE BIG PICTURE: UPFRONT CASH & MONTHLY IMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Upfront Moving & Transaction Outlay */}
        <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PoundSterling className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Total Upfront Cash Required
              </h3>
              <p className="text-[11px] text-slate-400">
                Transaction fees, taxes & moving expenses to complete
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Estimated Total Cash Outlay
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalUpfrontCashNeeded)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              Includes {formatCurrency(sdltResult.totalSdlt)} Stamp Duty + {formatCurrency(movingCosts.totalMovingCostsExcludingSdlt)} professional & moving fees.
            </p>
          </div>

          {/* Quick Itemized List */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Stamp Duty (SDLT):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(sdltResult.totalSdlt)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Estate Agency Fee (Selling current home @ {agentFeePercent}%):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(movingCosts.estateAgentFee)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Conveyancing & Legal Fees:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(movingCosts.conveyancingSale + movingCosts.conveyancingPurchase)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Homebuyer Survey & Removals:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(movingCosts.surveyCost + movingCosts.removalCosts)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Cashflow Delta */}
        <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Running Impact
              </h3>
              <p className="text-[11px] text-slate-400">
                Mortgage payments, council tax & ongoing outgoings
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Monthly Outgoings Difference
            </span>
            <div
              className={`text-3xl font-black tracking-tight ${
                breakdown.monthlyDifference > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrencyDelta(breakdown.monthlyDifference)} / month
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              Current total: {formatCurrency(breakdown.currentMonthlyOutgoings)}/mo → Prospective: {formatCurrency(breakdown.totalNewMonthlyOutgoings)}/mo
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium mb-1">
                <span>Mortgage Interest Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium mb-1">
                <span>Mortgage Term:</span>
                <span className="font-bold text-slate-900 dark:text-white">{termYears} Years</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={termYears}
                onChange={(e) => setTermYears(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAMP DUTY LAND TAX (ENGLAND) DETAIL */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-brand-600" />
              <span>Stamp Duty Land Tax (SDLT - England)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Residential rates calculated on purchase price of {formatCurrency(newProperty.price)}
            </p>
          </div>

          {/* Tactile Buyer Type Toggle */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setBuyerType('moving_home')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                buyerType === 'moving_home'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Moving Home
            </button>
            <button
              onClick={() => setBuyerType('first_time_buyer')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                buyerType === 'first_time_buyer'
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              First-Time Buyer
            </button>
            <button
              onClick={() => setBuyerType('additional_property')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                buyerType === 'additional_property'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Additional Home (+5%)
            </button>
          </div>
        </div>

        {/* SDLT Headline Summary Bar */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total SDLT Payable</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(sdltResult.totalSdlt)}
            </div>
            <span className="text-slate-500 dark:text-slate-400">
              Effective tax rate: <strong>{sdltResult.effectiveTaxRatePercent}%</strong>
            </span>
          </div>

          {sdltResult.notes.length > 0 && (
            <div className="text-slate-600 dark:text-slate-300 max-w-sm space-y-1">
              {sdltResult.notes.map((note, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progressive Disclosure: Tier Breakdown Table */}
        <div>
          <button
            type="button"
            onClick={() => setShowFullSdltTable((prev) => !prev)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 pt-1"
          >
            <span>{showFullSdltTable ? 'Hide Tax Band Breakdown' : 'Show Tax Band Breakdown'}</span>
            {showFullSdltTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFullSdltTable && (
            <div className="mt-3 overflow-x-auto">
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
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 font-medium">{band.bandDescription}</td>
                      <td className="py-2">{band.ratePercent}%</td>
                      <td className="py-2">{formatCurrency(band.taxableAmountInBand)}</td>
                      <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(band.taxPayableInBand)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
