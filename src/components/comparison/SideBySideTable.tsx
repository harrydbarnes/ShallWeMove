import React, { useState } from 'react';
import {
  Filter,
  CheckCircle2,
  XCircle,
  Minus,
  Info,
  SlidersHorizontal,
  Home,
  Building,
} from 'lucide-react';
import { ComparisonAttribute, ComparisonSummary } from '../../types/comparison';

interface SideBySideTableProps {
  summary: ComparisonSummary;
}

export const SideBySideTable: React.FC<SideBySideTableProps> = ({ summary }) => {
  const { attributes, currentProperty, newProperty } = summary;

  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [onlyCaredAbout, setOnlyCaredAbout] = useState(false);

  // Group attributes by category
  const filtered = attributes.filter((attr) => {
    if (onlyDifferences && !attr.isDifferent) return false;
    if (onlyCaredAbout && !attr.isWanted) return false;
    return true;
  });

  const categories = Array.from(new Set(filtered.map((a) => a.category)));

  const renderBadge = (status: ComparisonAttribute['status']) => {
    switch (status) {
      case 'better':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Better</span>
          </span>
        );
      case 'worse':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            <XCircle className="w-3 h-3" />
            <span>Worse</span>
          </span>
        );
      case 'equal':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Minus className="w-3 h-3" />
            <span>Equal</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Table Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">Show only differences</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyCaredAbout}
              onChange={(e) => setOnlyCaredAbout(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">
              Show only things I care about (my wants)
            </span>
          </label>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-1/3">Property Attribute</th>
                <th className="p-4 w-1/3 bg-slate-100/50 dark:bg-slate-800/80">
                  <div className="flex items-center space-x-1.5">
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>Current Home</span>
                  </div>
                  <div className="font-normal text-[10px] text-slate-400 truncate mt-0.5">
                    {currentProperty.displayAddress}
                  </div>
                </th>
                <th className="p-4 w-1/3 bg-brand-50/50 dark:bg-brand-950/20 text-brand-900 dark:text-brand-200">
                  <div className="flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Prospective Listing</span>
                  </div>
                  <div className="font-normal text-[10px] text-brand-600 dark:text-brand-400 truncate mt-0.5">
                    {newProperty.displayAddress}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat) => {
                const catAttrs = filtered.filter((a) => a.category === cat);
                if (catAttrs.length === 0) return null;

                return (
                  <React.Fragment key={cat}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-100/70 dark:bg-slate-800/40">
                      <td
                        colSpan={3}
                        className="px-4 py-2 font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        {cat}
                      </td>
                    </tr>

                    {/* Attribute Rows */}
                    {catAttrs.map((attr) => (
                      <tr
                        key={attr.id}
                        className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                          attr.status === 'better'
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                            : attr.status === 'worse'
                            ? 'bg-rose-50/20 dark:bg-rose-950/10'
                            : ''
                        }`}
                      >
                        {/* Attribute Label */}
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center space-x-2">
                            <span>{attr.label}</span>
                            {attr.isWanted && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                In Wants
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Current Value */}
                        <td className="p-4 bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-medium">
                          {attr.currentValueDisplay}
                        </td>

                        {/* New Value & Status Badge */}
                        <td className="p-4 bg-brand-50/20 dark:bg-brand-950/10 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center justify-between">
                            <span>{attr.newValueDisplay}</span>
                            {renderBadge(attr.status)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    No attributes match your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
