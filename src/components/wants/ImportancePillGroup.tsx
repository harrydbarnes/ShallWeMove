import React from 'react';
import { WantImportance } from '../../types/wants';

interface ImportancePillGroupProps {
  value: WantImportance;
  onChange: (newValue: WantImportance) => void;
  compact?: boolean;
}

interface PillOption {
  value: WantImportance;
  label: string;
  shortLabel: string;
  icon: string;
  activeClass: string;
  title: string;
}

const PILL_OPTIONS: PillOption[] = [
  {
    value: 'deal_breaker',
    label: 'Deal Breaker',
    shortLabel: 'Breaker',
    icon: '🚨',
    activeClass:
      'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/50 font-bold',
    title: 'Listing immediately flagged as failing if missing',
  },
  {
    value: 'must_have',
    label: 'Must Have',
    shortLabel: 'Must',
    icon: '⭐',
    activeClass:
      'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50 font-bold',
    title: 'Heavily weighted requirement (5x weight)',
  },
  {
    value: 'important',
    label: 'Important',
    shortLabel: 'Important',
    icon: '👍',
    activeClass:
      'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/50 font-bold',
    title: 'Significant priority (3x weight)',
  },
  {
    value: 'nice_to_have',
    label: 'Nice to Have',
    shortLabel: 'Nice',
    icon: '✨',
    activeClass:
      'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/50 font-bold',
    title: 'Bonus if available (1x weight)',
  },
  {
    value: 'dont_care',
    label: "Don't Care",
    shortLabel: 'Off',
    icon: '✕',
    activeClass:
      'bg-slate-500 text-white shadow-sm font-bold',
    title: 'Excluded from score calculations',
  },
];

export const ImportancePillGroup: React.FC<ImportancePillGroupProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Requirement importance"
      className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-inner"
    >
      {PILL_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={`flex items-center space-x-1.5 rounded-lg text-xs transition-all select-none px-2.5 py-1 ${
              isActive
                ? opt.activeClass
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60 font-medium'
            }`}
          >
            <span className="text-[12px] leading-none" aria-hidden="true">
              {opt.icon}
            </span>
            <span className={compact ? 'hidden sm:inline' : 'inline'}>
              {compact ? opt.shortLabel : opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
