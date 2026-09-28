import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PoundSterling,
  Maximize2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Home,
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
  const baseline = fitScore.baselineScore ?? 50;
  const target = fitScore.overallScore;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
        isDealBreakerHit
          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900/60 ring-1 ring-rose-500/20'
          : isUpgrade
          ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Banner: Editorial Headline & Score Journey */}
      <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Decision Verdict */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                  isDealBreakerHit
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : isUpgrade
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isDealBreakerHit ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Deal Breaker Hit</span>
                  </>
                ) : isUpgrade ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Clear Upgrade</span>
                  </>
                ) : (
                  <span>Lateral Move</span>
                )}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                Baseline: {currentProperty.displayAddress}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {fitScore.plainEnglishVerdict}
            </h2>

            {/* Deal Breaker warning banner */}
            {isDealBreakerHit && (
              <div className="p-3.5 bg-rose-100/90 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Deal-Breaker Triggered:</span>{' '}
                  {fitScore.dealBreakersTriggered.join(', ')}. This property fails a requirement you marked as strictly non-negotiable.
                </div>
              </div>
            )}

            {/* Pillar Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Must Haves */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition ${
                  fitScore.mustHavesMetCount === fitScore.mustHavesTotalCount && fitScore.mustHavesTotalCount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Must Haves: {fitScore.mustHavesMetCount}/{fitScore.mustHavesTotalCount} Met
                </span>
              </div>

              {/* Nice to Haves */}
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>
                  Nice to Haves: {fitScore.niceToHavesMetCount}/{fitScore.niceToHavesTotalCount} Met
                </span>
              </div>

              {/* Deal Breakers status */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition ${
                  isDealBreakerHit
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isDealBreakerHit ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>
                  {isDealBreakerHit
                    ? `${fitScore.dealBreakersTriggered.length} Failed Deal Breaker`
                    : '0 Deal Breakers Violated'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Visual Fit Journey Scoreboard */}
          <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex-shrink-0 w-full lg:w-72 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Fit Comparison</span>
              <span className="text-[10px]">Score / 100</span>
            </div>

            {/* Score Delta Track */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                  <Home className="w-3.5 h-3.5" />
                  <span>Current: {baseline}</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-900 dark:text-white font-bold">
                  <Building className="w-3.5 h-3.5 text-brand-600" />
                  <span>Prospective: {target}</span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden relative">
                {/* Baseline fill */}
                <div
                  className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(baseline, 100)}%` }}
                />
                {/* Target overlay */}
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
                    target >= baseline
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(target, 100)}%`, opacity: 0.85 }}
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] text-slate-400">Household fit rating</span>
                {fitScore.scoreDelta !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold ${
                      fitScore.scoreDelta > 0
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : fitScore.scoreDelta < 0
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700'
                    }`}
                  >
                    {fitScore.scoreDelta > 0 ? `+${fitScore.scoreDelta}` : fitScore.scoreDelta} pts delta
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: 4 Human Context Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/40 dark:bg-slate-850/40">
        {/* 1. Price Difference */}
        <div className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <PoundSterling className="w-3.5 h-3.5 text-slate-400" />
            <span>Price Difference</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrencyDelta(headlineMetrics.priceDifferenceGbp)}
            </span>
            <span
              className={`text-xs font-bold ${
                headlineMetrics.priceDifferenceGbp > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
              }`}
            >
              ({formatPercentage(headlineMetrics.priceDifferencePercent)})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {formatCurrency(newProperty.price)} vs {formatCurrency((currentProperty as CurrentHouseProfile).estimatedCurrentValue || currentProperty.price)} valuation
          </p>
        </div>

        {/* 2. Monthly Outgoings Delta */}
        <div className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Monthly Cost Delta</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                headlineMetrics.monthlyCostDifferenceGbp > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrencyDelta(headlineMetrics.monthlyCostDifferenceGbp)}/mo
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Net impact on mortgage, council tax & energy
          </p>
        </div>

        {/* 3. Extra Floor Area */}
        <div className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Extra Living Space</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`whitespace-nowrap text-xl font-black tracking-tight ${
                headlineMetrics.floorAreaDifferenceSqFt > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : headlineMetrics.floorAreaDifferenceSqFt < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {headlineMetrics.floorAreaDifferenceSqFt > 0 ? '+' : ''}
              {formatDualArea(headlineMetrics.floorAreaDifferenceSqFt, headlineMetrics.floorAreaDifferenceSqM, true)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(headlineMetrics.floorAreaDifferenceSqM)} sq m · {formatPercentage(headlineMetrics.floorAreaDifferencePercent)} change
          </p>
        </div>

        {/* 4. Price Per Sq Ft */}
        <div className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Value Density (£/sq ft)</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {headlineMetrics.pricePerSqFtNew > 0
                ? `£${headlineMetrics.pricePerSqFtNew}`
                : 'Unstated'}
            </span>
            {headlineMetrics.pricePerSqFtDifferenceGbp !== 0 && (
              <span
                className={`text-xs font-bold ${
                  headlineMetrics.pricePerSqFtDifferenceGbp > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                ({headlineMetrics.pricePerSqFtDifferenceGbp > 0 ? '+' : ''}£
                {headlineMetrics.pricePerSqFtDifferenceGbp}/sq ft)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Current: {headlineMetrics.pricePerSqFtCurrent > 0 ? `£${headlineMetrics.pricePerSqFtCurrent}/sq ft` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
