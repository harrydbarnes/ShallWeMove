import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PoundSterling,
  Maximize2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { CurrentHouseProfile } from '../../types/property';
import {
  formatCurrency,
  formatCurrencyDelta,
  formatDualArea,
  formatPercentage,
} from '../../lib/utils/formatters';

interface VerdictPanelProps {
  summary: ComparisonSummary;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({ summary }) => {
  const { fitScore, headlineMetrics, currentProperty, newProperty } = summary;

  const isUpgrade = (fitScore.scoreDelta || 0) > 0;
  const isDealBreakerHit = fitScore.isDealBreakerHit;

  return (
    <div
      className={`rounded-2xl border transition shadow-sm overflow-hidden ${
        isDealBreakerHit
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
          : isUpgrade
          ? 'bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Banner: Fit Score & Verdict Sentence */}
      <div className="p-6 sm:p-7 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Headline Verdict */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isDealBreakerHit
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    : isUpgrade
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isDealBreakerHit ? 'Deal Breaker Triggered' : 'Verdict'}
              </span>
              <span className="text-xs text-slate-400">
                Comparing vs {currentProperty.displayAddress}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {fitScore.plainEnglishVerdict}
            </h2>

            {/* Deal Breaker warning banner */}
            {isDealBreakerHit && (
              <div className="p-3 bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Failed Deal Breaker:</strong> {fitScore.dealBreakersTriggered.join(', ')}.
                  This listing violates a requirement you marked as non-negotiable.
                </div>
              </div>
            )}

            {/* Traffic Light Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Must Haves */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
                  fitScore.mustHavesMetCount === fitScore.mustHavesTotalCount && fitScore.mustHavesTotalCount > 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Must Haves: {fitScore.mustHavesMetCount}/{fitScore.mustHavesTotalCount} Met
                </span>
              </div>

              {/* Nice to Haves */}
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>
                  Nice to Haves: {fitScore.niceToHavesMetCount}/{fitScore.niceToHavesTotalCount} Met
                </span>
              </div>

              {/* Deal Breakers status */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
                  isDealBreakerHit
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isDealBreakerHit ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>
                  {isDealBreakerHit
                    ? `${fitScore.dealBreakersTriggered.length} Deal Breaker Hit`
                    : '0 Deal Breakers Hit'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Score Gauge comparison */}
          <div className="flex items-center space-x-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
            {/* Baseline score */}
            {fitScore.baselineScore !== undefined && (
              <div className="text-center pr-3 border-r border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Current Home
                </span>
                <div className="text-xl font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                  {fitScore.baselineScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
              </div>
            )}

            {/* New listing score */}
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">
                Fit Score
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5">
                {fitScore.overallScore}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              {fitScore.scoreDelta !== undefined && (
                <div
                  className={`text-xs font-bold mt-1 flex items-center justify-center space-x-0.5 ${
                    fitScore.scoreDelta > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : fitScore.scoreDelta < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-500'
                  }`}
                >
                  {fitScore.scoreDelta > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {fitScore.scoreDelta > 0 ? `+${fitScore.scoreDelta}` : fitScore.scoreDelta} vs current
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: 4 Headline Delta Figures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
        {/* 1. Price Difference */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <PoundSterling className="w-3.5 h-3.5" />
            <span>Price Difference</span>
          </span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrencyDelta(headlineMetrics.priceDifferenceGbp)}
            </span>
            <span
              className={`text-xs font-bold ${
                headlineMetrics.priceDifferenceGbp > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              ({formatPercentage(headlineMetrics.priceDifferencePercent)})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatCurrency(newProperty.price)} vs {formatCurrency((currentProperty as CurrentHouseProfile).estimatedCurrentValue || currentProperty.price)}
          </p>
        </div>

        {/* 2. Monthly Outgoings Delta */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Cost Delta</span>
          </span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                headlineMetrics.monthlyCostDifferenceGbp > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrencyDelta(headlineMetrics.monthlyCostDifferenceGbp)}/mo
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mortgage, council tax, energy & fees
          </p>
        </div>

        {/* 3. Extra Floor Area */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Extra Living Space</span>
          </span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                headlineMetrics.floorAreaDifferenceSqFt > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : headlineMetrics.floorAreaDifferenceSqFt < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {headlineMetrics.floorAreaDifferenceSqFt > 0 ? '+' : ''}
              {formatDualArea(
                headlineMetrics.floorAreaDifferenceSqFt,
                headlineMetrics.floorAreaDifferenceSqM
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatPercentage(headlineMetrics.floorAreaDifferencePercent)} vs current floor area
          </p>
        </div>

        {/* 4. Price Per Sq Ft */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Price Per Sq Ft</span>
          </span>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {headlineMetrics.pricePerSqFtNew > 0
                ? `£${headlineMetrics.pricePerSqFtNew}`
                : 'Unstated'}
            </span>
            {headlineMetrics.pricePerSqFtDifferenceGbp !== 0 && (
              <span
                className={`text-xs font-bold ${
                  headlineMetrics.pricePerSqFtDifferenceGbp > 0
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                ({headlineMetrics.pricePerSqFtDifferenceGbp > 0 ? '+' : ''}£
                {headlineMetrics.pricePerSqFtDifferenceGbp}/sq ft)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Current: {headlineMetrics.pricePerSqFtCurrent > 0 ? `£${headlineMetrics.pricePerSqFtCurrent}/sq ft` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
