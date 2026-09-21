import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Quote,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';

interface WantsScorecardProps {
  summary: ComparisonSummary;
}

export const WantsScorecard: React.FC<WantsScorecardProps> = ({ summary }) => {
  const { fitScore } = summary;

  return (
    <div className="space-y-4">
      {/* Scorecard Header Summary */}
      <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Wants & Priorities Scorecard</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent item-by-item breakdown showing points awarded, missed, and matched listing evidence
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs flex-shrink-0">
          <div className="text-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="font-extrabold text-emerald-800 dark:text-emerald-300">
              {fitScore.mustHavesMetCount}/{fitScore.mustHavesTotalCount}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Must Haves Met</span>
          </div>

          <div className="text-center px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-extrabold text-slate-800 dark:text-slate-200">
              {fitScore.niceToHavesMetCount}/{fitScore.niceToHavesTotalCount}
            </div>
            <span className="text-[10px] text-slate-500">Nice to Haves Met</span>
          </div>
        </div>
      </div>

      {/* Itemized Cards */}
      <div className="space-y-2.5">
        {fitScore.evaluations.map((item) => (
          <div
            key={item.criterionId}
            className={`p-4 rounded-xl border transition ${
              item.isDealBreakerHit
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                : item.status === 'met'
                ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                : item.status === 'unknown'
                ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                : 'bg-slate-50/50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Status Icon & Title */}
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex-shrink-0">
                  {item.isDealBreakerHit ? (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  ) : item.status === 'met' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : item.status === 'unknown' ? (
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    {/* Importance badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.importance === 'deal_breaker'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : item.importance === 'must_have'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : item.importance === 'important'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.importance.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {item.detail}
                  </p>

                  {/* Evidence quote */}
                  {item.evidence && (
                    <div className="mt-2 flex items-start space-x-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
                      <Quote className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                      <span>"{item.evidence}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weight & Points */}
              <div className="text-right flex-shrink-0">
                <span
                  className={`text-xs font-bold ${
                    item.pointsEarned > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  +{item.pointsEarned} / {item.maxPoints} pts
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Weight: {item.weight}x
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
