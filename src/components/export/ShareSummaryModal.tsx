import React from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  Building,
  Home,
  Sparkles,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { CurrentHouseProfile } from '../../types/property';
import { getDataConfidence, homeName } from '../../lib/utils/homePresentation';
import {
  formatCurrency,
  formatCurrencyDelta,
  formatDualArea,
} from '../../lib/utils/formatters';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ComparisonSummary | null;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [copiedText, setCopiedText] = React.useState(false);

  if (!isOpen || !summary) return null;

  const { currentProperty, newProperty, fitScore, headlineMetrics } = summary;
  const confidence = getDataConfidence(newProperty);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummaryText = () => {
    const text = `
=== SHALL WE MOVE? COMPARISON SUMMARY ===
Current Home: ${currentProperty.displayAddress} (Estimated Value: ${formatCurrency((currentProperty as CurrentHouseProfile).estimatedCurrentValue || currentProperty.price)})
Prospective Home: ${homeName(newProperty)} — ${newProperty.displayAddress} (Asking Price: ${formatCurrency(newProperty.price)})

VERDICT: ${fitScore.plainEnglishVerdict}
Data confidence: ${confidence.label}. ${confidence.detail}
Fit Score: ${fitScore.overallScore}/100 (${fitScore.scoreDelta && fitScore.scoreDelta > 0 ? `+${fitScore.scoreDelta}` : fitScore.scoreDelta} vs current home)
Must Haves Met: ${fitScore.mustHavesMetCount}/${fitScore.mustHavesTotalCount}
Deal Breakers: ${fitScore.isDealBreakerHit ? `HIT (${fitScore.dealBreakersTriggered.join(', ')})` : '0 Hit (Passed)'}

HEADLINE METRICS:
- Price Delta: ${formatCurrencyDelta(headlineMetrics.priceDifferenceGbp)}
- Monthly Outgoings Delta: ${formatCurrencyDelta(headlineMetrics.monthlyCostDifferenceGbp)}/mo
- Floor Area Delta: ${formatDualArea(headlineMetrics.floorAreaDifferenceSqFt, headlineMetrics.floorAreaDifferenceSqM)}
- Price / sq ft: £${headlineMetrics.pricePerSqFtNew} (vs £${headlineMetrics.pricePerSqFtCurrent})

Generated client-side via Shall We Move?
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share & Print Comparison Summary
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Shall We Move? Verdict
              </span>
              <span className="font-black text-base text-brand-600 dark:text-brand-400">
                {fitScore.overallScore}/100
              </span>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{homeName(newProperty)}</p>
              {newProperty.nickname && <p className="text-slate-500">{newProperty.displayAddress}</p>}
              <p className="text-slate-500">vs {currentProperty.displayAddress}</p>
            </div>

            <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
              "{fitScore.plainEnglishVerdict}"
            </p>
            <p className="text-slate-600 dark:text-slate-300">Data confidence: {confidence.label}. {confidence.detail}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              <div>
                <span className="text-slate-400">Price Diff:</span>
                <p className="font-bold">{formatCurrencyDelta(headlineMetrics.priceDifferenceGbp)}</p>
              </div>
              <div>
                <span className="text-slate-400">Monthly Diff:</span>
                <p className="font-bold">{formatCurrencyDelta(headlineMetrics.monthlyCostDifferenceGbp)}/mo</p>
              </div>
              <div>
                <span className="text-slate-400">Extra Space:</span>
                <p className="font-bold">{headlineMetrics.floorAreaDifferenceSqFt} sq ft</p>
              </div>
              <div>
                <span className="text-slate-400">Must Haves:</span>
                <p className="font-bold">{fitScore.mustHavesMetCount}/{fitScore.mustHavesTotalCount} Met</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleCopySummaryText}
              className="w-full py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 rounded-xl font-semibold flex items-center justify-center space-x-2 transition"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Summary Copied to Clipboard!' : 'Copy Text Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
