import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WantCriterion, WantImportance, WantGroup } from '../../types/wants';
import { generateAutoSuggestions } from '../../lib/scoring/autoSuggestions';

interface WantsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WantsManagerModal: React.FC<WantsManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    wants,
    updateWant,
    addWant,
    deleteWant,
    resetWantsToDefaults,
    activeCurrentHouse,
    applySuggestedWants,
  } = useApp();

  const [activeGroup, setActiveGroup] = useState<WantGroup | 'all'>('all');

  // Custom want creation state
  const [customTitle, setCustomTitle] = useState('');
  const [customImportance, setCustomImportance] = useState<WantImportance>('important');
  const [customKeywords, setCustomKeywords] = useState('');

  if (!isOpen) return null;

  const autoSuggestions = generateAutoSuggestions(activeCurrentHouse);
  const existingWantIds = new Set(wants.map((w) => w.id));
  const unappliedSuggestions = autoSuggestions.filter((s) => !existingWantIds.has(s.id));

  const handleAddCustomWant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newWant: WantCriterion = {
      id: `custom_want_${Date.now()}`,
      group: 'custom',
      title: customTitle.trim(),
      importance: customImportance,
      valueType: 'text_match',
      targetValue: customKeywords.trim() || customTitle.trim(),
      fieldKey: 'customKeywords',
    };

    addWant(newWant);
    setCustomTitle('');
    setCustomKeywords('');
  };

  const filteredWants =
    activeGroup === 'all' ? wants : wants.filter((w) => w.group === activeGroup);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Priorities & Wants Builder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your criteria, importance weights, and strict deal breakers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Selector */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 pt-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveGroup('all')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                activeGroup === 'all'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              All Wants ({wants.length})
            </button>
            <button
              onClick={() => setActiveGroup('general')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                activeGroup === 'general'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              1. General Features
            </button>
            <button
              onClick={() => setActiveGroup('current_house')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                activeGroup === 'current_house'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              2. Specific to Current House
            </button>
            <button
              onClick={() => setActiveGroup('custom')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                activeGroup === 'custom'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              3. Custom Wants
            </button>
          </div>

          <button
            onClick={resetWantsToDefaults}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center space-x-1 mb-1.5"
            title="Reset to default UK home criteria"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Auto Suggestions Banner if any unapplied */}
          {unappliedSuggestions.length > 0 && (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>
                    Suggestions Tailored to "{activeCurrentHouse.profileName || activeCurrentHouse.displayAddress}"
                  </span>
                </span>
                <button
                  onClick={() => applySuggestedWants(unappliedSuggestions)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition"
                >
                  Add All Suggestions ({unappliedSuggestions.length})
                </button>
              </div>
              <div className="space-y-1.5 mt-2">
                {unappliedSuggestions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900"
                  >
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.title}</span>
                      {s.suggestionReason && (
                        <p className="text-[11px] text-slate-400">{s.suggestionReason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => applySuggestedWants([s])}
                      className="px-2 py-0.5 text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wants List */}
          <div className="space-y-2.5">
            {filteredWants.map((want) => (
              <div
                key={want.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{want.title}</span>
                    {want.autoSuggested && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded">
                        Auto-Suggested
                      </span>
                    )}
                  </div>
                  {want.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {want.description}
                    </p>
                  )}
                  {want.suggestionReason && (
                    <p className="text-brand-600 dark:text-brand-400 text-[10px] mt-0.5">
                      Reason: {want.suggestionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <select
                    value={want.importance}
                    onChange={(e) =>
                      updateWant({
                        ...want,
                        importance: e.target.value as any,
                      })
                    }
                    className={`font-semibold py-1 px-2.5 rounded-lg text-xs border transition ${
                      want.importance === 'deal_breaker'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : want.importance === 'must_have'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : want.importance === 'important'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <option value="deal_breaker">🚨 Deal breaker</option>
                    <option value="must_have">⭐ Must have (5x)</option>
                    <option value="important">👍 Important (3x)</option>
                    <option value="nice_to_have">✨ Nice to have (1x)</option>
                    <option value="dont_care">⚪ Don't care (0x)</option>
                  </select>

                  <button
                    onClick={() => deleteWant(want.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                    title="Remove Want"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Want Form */}
          <form
            onSubmit={handleAddCustomWant}
            className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs"
          >
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Add Custom Requirement</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Requirement title (e.g. Underfloor heating, Cul-de-sac, Within 10m walk to park)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <select
                  value={customImportance}
                  onChange={(e) => setCustomImportance(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="deal_breaker">Deal breaker</option>
                  <option value="must_have">Must have</option>
                  <option value="important">Important</option>
                  <option value="nice_to_have">Nice to have</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Optional keywords to search for in listing description (comma separated, e.g. underfloor, under-floor, heated floors)"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition"
              >
                Add to Priorities
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
