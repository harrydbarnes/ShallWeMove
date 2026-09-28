import React, { useState } from 'react';
import { Check, ClipboardCopy, ExternalLink, X } from 'lucide-react';
import { Property } from '../../types/property';
import { createMoveCandidate } from '../../lib/candidateHandoff';
import { formatCurrency } from '../../lib/utils/formatters';

const PLANNER_URL = 'https://home-move-budget.habylab.chatgpt.site';

interface Props {
  listing: Property | null;
  onClose: () => void;
}

export const PlannerHandoffModal: React.FC<Props> = ({ listing, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  if (!listing) return null;

  const candidate = createMoveCandidate(listing);
  const costs = [
    ['Council tax', candidate.councilTaxAnnual],
    ['Service charge', candidate.serviceChargeAnnual],
    ['Ground rent', candidate.groundRentAnnual],
  ] as const;

  async function copyCandidate() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(candidate));
      setCopied(true);
      setError('');
    } catch {
      setError('Clipboard access was blocked. Select and copy the candidate data below, then paste it in the planner.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="planner-handoff-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">Home Move Planner</p>
            <h2 id="planner-handoff-title" className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Review candidate details</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">These listing facts are the only details copied. No current-home or household-finance data is included.</p>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="font-semibold text-slate-950 dark:text-white">{candidate.displayAddress}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt>Asking price</dt><dd className="font-bold">{formatCurrency(candidate.askingPrice)}</dd></div>
            {costs.map(([name, value]) => <div key={name} className="flex justify-between gap-3"><dt>{name}</dt><dd className="font-semibold">{value === undefined ? 'Not supplied' : `${formatCurrency(value)} / year`}</dd></div>)}
          </dl>
        </div>
        {candidate.sample && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">This is a sample listing. Use it to try the handoff, not to make a move decision.</p>}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Missing costs stay blank for review. The planner calculates stamp duty, mortgage and moving costs from its own assumptions.</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        {error && <textarea aria-label="Candidate data to copy manually" readOnly value={JSON.stringify(candidate)} onFocus={event => event.currentTarget.select()} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs dark:border-slate-600 dark:bg-slate-800" rows={3} />}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={copyCandidate} disabled={!Number.isFinite(candidate.askingPrice) || candidate.askingPrice <= 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}{copied ? 'Candidate copied' : 'Copy candidate'}
          </button>
          <a href={PLANNER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800">Open owner-only planner <ExternalLink className="h-4 w-4" /></a>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">The linked planner is restricted to its owner. There, choose “Import candidate”, paste, review, then apply.</p>
      </section>
    </div>
  );
};
