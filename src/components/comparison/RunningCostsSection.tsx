import React from 'react';
import {
  Flame,
  Zap,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { ComparisonSummary } from '../../types/comparison';
import { generateAgentQuestions } from '../../lib/analyser/agentQuestions';
import { formatCurrency } from '../../lib/utils/formatters';

interface RunningCostsSectionProps {
  summary: ComparisonSummary;
}

const EPC_BARS = [
  { band: 'A', score: '92+', bg: 'bg-emerald-600', text: 'text-white' },
  { band: 'B', score: '81-91', bg: 'bg-emerald-500', text: 'text-white' },
  { band: 'C', score: '69-80', bg: 'bg-lime-500', text: 'text-slate-900' },
  { band: 'D', score: '55-68', bg: 'bg-yellow-400', text: 'text-slate-900' },
  { band: 'E', score: '39-54', bg: 'bg-amber-500', text: 'text-white' },
  { band: 'F', score: '21-38', bg: 'bg-orange-500', text: 'text-white' },
  { band: 'G', score: '1-20', bg: 'bg-rose-600', text: 'text-white' },
];

export const RunningCostsSection: React.FC<RunningCostsSectionProps> = ({ summary }) => {
  const { currentProperty, newProperty } = summary;

  const agentQuestions = generateAgentQuestions(newProperty);

  return (
    <div className="space-y-6">
      {/* 1. EPC Rating Energy Efficiency Scale */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-brand-600" />
              <span>Energy Performance Certificate (EPC)</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative energy efficiency rating based on official UK standard
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Current Home</span>
              <div className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                Band {currentProperty.epcRating}
              </div>
            </div>
            <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="text-brand-600 text-[10px] uppercase font-bold">Prospective Home</span>
              <div className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                Band {newProperty.epcRating}
              </div>
            </div>
          </div>
        </div>

        {/* Visual EPC Ladder */}
        <div className="space-y-1.5 pt-2 max-w-lg">
          {EPC_BARS.map((bar) => {
            const isCurrent = currentProperty.epcRating === bar.band;
            const isNew = newProperty.epcRating === bar.band;

            return (
              <div key={bar.band} className="flex items-center space-x-2">
                <div
                  className={`${bar.bg} ${bar.text} px-2.5 py-1 rounded font-black text-xs flex justify-between items-center transition-all`}
                  style={{
                    width: `${50 + (EPC_BARS.indexOf(bar) + 1) * 7}%`,
                  }}
                >
                  <span>{bar.band}</span>
                  <span className="text-[10px] font-normal opacity-90">{bar.score}</span>
                </div>

                {/* Markers */}
                <div className="flex items-center space-x-1.5 text-[11px] font-bold">
                  {isNew && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-300 dark:border-brand-700">
                      New Home (Band {bar.band})
                    </span>
                  )}
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Current (Band {bar.band})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Council Tax, Heating & Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Council Tax */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white">Council Tax</h4>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
            Band {newProperty.councilTaxBand}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {newProperty.councilTaxAnnual
              ? `${formatCurrency(newProperty.councilTaxAnnual)}/year (${formatCurrency(Math.round(newProperty.councilTaxAnnual / 12))}/mo)`
              : 'Local authority band rate applies'}
          </p>
          <span className="text-[10px] text-slate-400">
            Current home is Band {currentProperty.councilTaxBand}
          </span>
        </div>

        {/* Heating & Boiler */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Heating System</span>
          </h4>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {newProperty.hasNewBoiler ? 'Recently Fitted Boiler' : 'Central Heating'}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {newProperty.hasUnderfloorHeating && 'Features underfloor heating. '}
            {newProperty.hasSolarPanels && 'Equipped with solar PV panels. '}
            {!newProperty.hasUnderfloorHeating && !newProperty.hasSolarPanels && 'Standard radiator distribution.'}
          </p>
        </div>

        {/* Renovation Needs */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Wrench className="w-4 h-4 text-brand-600" />
            <span>Condition & Upgrades</span>
          </h4>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {newProperty.needsModernisation ? (
              <span className="text-amber-600 dark:text-amber-400">Modernisation Needed</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Move-In Ready Condition</span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {newProperty.needsModernisation
              ? 'Listing indicates updating is required. Factor in early renovation costs.'
              : 'No major structural modernisation flagged in listing text.'}
          </p>
        </div>
      </div>

      {/* 3. Auto-Generated Questions to Ask the Estate Agent */}
      <div className="p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Questions to Ask the Estate Agent ({agentQuestions.length})
          </h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Auto-generated based on missing, unverified, or ambiguous listing data. Use these when viewing or calling the agent.
        </p>

        <div className="space-y-2.5">
          {agentQuestions.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {q.category}
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-xs mt-1">
                "{q.question}"
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                <strong>Why ask:</strong> {q.reason}
              </p>
            </div>
          ))}

          {agentQuestions.length === 0 && (
            <p className="text-slate-400 italic py-2">
              All key specifications (tenure, lease, council tax, boiler, building regs) were fully documented in this listing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
