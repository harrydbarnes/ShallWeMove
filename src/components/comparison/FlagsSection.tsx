import React from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { detectPropertyFlags } from '../../lib/analyser/flagDetector';

interface FlagsSectionProps {
  summary: ComparisonSummary;
}

export const FlagsSection: React.FC<FlagsSectionProps> = ({ summary }) => {
  const { newProperty } = summary;

  const allFlags = detectPropertyFlags(newProperty);
  const greenFlags = allFlags.filter((f) => f.type === 'green');
  const redFlags = allFlags.filter((f) => f.type === 'red');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Green Flags (Key Highlights & Positive Signals) */}
        <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-sm">
              Green Flags & Positives ({greenFlags.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Favourable attributes that lower transaction risk, operating costs, or future upgrade expenses.
          </p>

          <div className="space-y-3">
            {greenFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    {flag.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                    {flag.category}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {flag.description}
                </p>
              </div>
            ))}

            {greenFlags.length === 0 && (
              <p className="text-slate-400 text-xs italic py-2">
                No notable green flags detected from this listing.
              </p>
            )}
          </div>
        </div>

        {/* Red Flags (Risks, Liabilities & Upfront Outlays) */}
        <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-sm">
              Red Flags & Cautionary Items ({redFlags.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Potential legal risks, mortgageability hurdles, or heavy ongoing charges requiring legal diligence.
          </p>

          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-900 dark:text-rose-200">
                    {flag.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 rounded">
                    {flag.category}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {flag.description}
                </p>
              </div>
            ))}

            {redFlags.length === 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
                🎉 No critical legal or market red flags detected for this property.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
