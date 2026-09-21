import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Minus,
  SlidersHorizontal,
  Home,
  Building,
  Bed,
  Bath,
  Armchair,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Filter,
  Car,
  Compass,
  Zap,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { ComparisonAttribute, ComparisonSummary } from '../../types/comparison';
import { formatDualArea, formatPercentage, formatCurrency } from '../../lib/utils/formatters';

interface SideBySideTableProps {
  summary: ComparisonSummary;
}

export const SideBySideTable: React.FC<SideBySideTableProps> = ({ summary }) => {
  const { attributes, currentProperty, newProperty, headlineMetrics } = summary;

  const [showFullTable, setShowFullTable] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [onlyCaredAbout, setOnlyCaredAbout] = useState(false);

  // Group attributes by category
  const filtered = attributes.filter((attr) => {
    if (onlyDifferences && !attr.isDifferent) return false;
    if (onlyCaredAbout && !attr.isWanted) return false;
    return true;
  });

  const categories = Array.from(new Set(filtered.map((a) => a.category)));

  // Key Wins (better) and Compromises (worse)
  const keyWins = attributes.filter((a) => a.status === 'better');
  const keyCompromises = attributes.filter((a) => a.status === 'worse');

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
    <div className="space-y-6">
      {/* 1. DECISION BENTO: THE 3 CORE PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Space & Living Footprint */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Space & Footprint
                </h3>
                <span className="text-[11px] text-slate-400">Living area & room counts</span>
              </div>
            </div>

            {headlineMetrics.floorAreaDifferenceSqFt !== 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  headlineMetrics.floorAreaDifferenceSqFt > 0
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                }`}
              >
                {headlineMetrics.floorAreaDifferenceSqFt > 0 ? '+' : ''}
                {formatPercentage(headlineMetrics.floorAreaDifferencePercent)}
              </span>
            )}
          </div>

          {/* Dual Area Scale */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Current Floor Area:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDualArea(currentProperty.floorAreaSqFt, currentProperty.floorAreaSqM)}
              </span>
            </div>
            <div className="flex justify-between items-center text-brand-900 dark:text-brand-200 font-bold border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
              <span>Prospective Area:</span>
              <span className="text-brand-600 dark:text-brand-400">
                {formatDualArea(newProperty.floorAreaSqFt, newProperty.floorAreaSqM)}
              </span>
            </div>
          </div>

          {/* Room Deltas Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Bed className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">
                {currentProperty.bedrooms} → {newProperty.bedrooms}
              </div>
              <span className="text-[10px] text-slate-400">Beds</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Bath className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">
                {currentProperty.bathrooms} → {newProperty.bathrooms}
              </div>
              <span className="text-[10px] text-slate-400">Baths</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Armchair className="w-4 h-4 mx-auto text-slate-400 mb-1" />
              <div className="font-bold text-slate-900 dark:text-white">
                {currentProperty.receptions} → {newProperty.receptions}
              </div>
              <span className="text-[10px] text-slate-400">Receptions</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Outdoor, Parking & Storage */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lifestyle & Outside
              </h3>
              <span className="text-[11px] text-slate-400">Parking, garden & storage</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Parking */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Parking</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {newProperty.parkingSpaces} spaces {newProperty.hasDriveway ? '(Driveway)' : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Current: {currentProperty.parkingSpaces} spaces
              </span>
            </div>

            {/* Garden Aspect */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Garden Orientation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {newProperty.gardenOrientation.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium capitalize">
                Current: {currentProperty.gardenOrientation.replace('_', ' ')}
              </span>
            </div>

            {/* Garage / Loft */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Garage & Storage</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {newProperty.garageType.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium capitalize">
                Current: {currentProperty.garageType.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Financial & Running Efficiency */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cost & Efficiency
              </h3>
              <span className="text-[11px] text-slate-400">Tenure, EPC & value rate</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Value Per Foot */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Price / Sq Ft</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {headlineMetrics.pricePerSqFtNew > 0 ? `£${headlineMetrics.pricePerSqFtNew}` : 'Unstated'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Current: £{headlineMetrics.pricePerSqFtCurrent || 'N/A'}
              </span>
            </div>

            {/* Tenure */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {newProperty.tenure.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium capitalize">
                Current: {currentProperty.tenure.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Energy Rating & Council Tax */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">EPC & Council Tax</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  EPC {newProperty.epcRating} · Band {newProperty.councilTaxBand}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Current: {currentProperty.epcRating} · {currentProperty.councilTaxBand}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE HUMAN SUMMARY: WINS VS COMPROMISES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Wins */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-emerald-200/80 dark:border-emerald-950 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What You Gain (Upgrades)</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {keyWins.length} Improvements
            </span>
          </div>

          <div className="space-y-2">
            {keyWins.map((win) => (
              <div
                key={win.id}
                className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{win.label}</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {win.newValueDisplay} (vs {win.currentValueDisplay} now)
                  </p>
                </div>
                {win.isWanted && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex-shrink-0">
                    Your Priority
                  </span>
                )}
              </div>
            ))}

            {keyWins.length === 0 && (
              <p className="text-slate-400 text-xs italic py-2">
                No major mechanical upgrades over your current baseline.
              </p>
            )}
          </div>
        </div>

        {/* Key Compromises */}
        <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-rose-200/80 dark:border-rose-950 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>What You Compromise (Trade-offs)</span>
            </h4>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
              {keyCompromises.length} Trade-offs
            </span>
          </div>

          <div className="space-y-2">
            {keyCompromises.map((comp) => (
              <div
                key={comp.id}
                className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{comp.label}</span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                    {comp.newValueDisplay} (vs {comp.currentValueDisplay} now)
                  </p>
                </div>
                {comp.isWanted && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-bold flex-shrink-0">
                    Failed Want
                  </span>
                )}
              </div>
            ))}

            {keyCompromises.length === 0 && (
              <p className="text-slate-400 text-xs italic py-2">
                No measurable drawbacks detected compared to your current home!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. PROGRESSIVE DISCLOSURE: FULL TECHNICAL ATTRIBUTE MATRIX */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowFullTable((prev) => !prev)}
          className="w-full py-3 px-4 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>
              {showFullTable ? 'Hide Detailed Specification Matrix' : 'View Full Technical Specification Matrix (24 Attributes)'}
            </span>
          </div>
          {showFullTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullTable && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* Table Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filters:</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
                    Show only my active wants
                  </span>
                </label>
              </div>
            </div>

            {/* Granular Table */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4 w-1/3">Property Attribute</th>
                      <th className="p-4 w-1/3 bg-slate-100/40 dark:bg-slate-800/40">
                        <div className="flex items-center space-x-1.5">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          <span>Current Home</span>
                        </div>
                        <div className="font-normal text-[10px] text-slate-400 truncate mt-0.5">
                          {currentProperty.displayAddress}
                        </div>
                      </th>
                      <th className="p-4 w-1/3 bg-brand-50/30 dark:bg-brand-950/20 text-brand-900 dark:text-brand-200">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {categories.map((cat) => {
                      const catAttrs = filtered.filter((a) => a.category === cat);
                      if (catAttrs.length === 0) return null;

                      return (
                        <React.Fragment key={cat}>
                          {/* Category Header Row */}
                          <tr className="bg-slate-100/60 dark:bg-slate-800/30">
                            <td
                              colSpan={3}
                              className="px-4 py-2 font-bold text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                            >
                              {cat}
                            </td>
                          </tr>

                          {/* Attribute Rows */}
                          {catAttrs.map((attr) => (
                            <tr
                              key={attr.id}
                              className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                                attr.status === 'better'
                                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                  : attr.status === 'worse'
                                  ? 'bg-rose-50/20 dark:bg-rose-950/10'
                                  : ''
                              }`}
                            >
                              {/* Attribute Label */}
                              <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
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
                              <td className="p-3.5 bg-slate-50/40 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-medium">
                                {attr.currentValueDisplay}
                              </td>

                              {/* New Value & Status Badge */}
                              <td className="p-3.5 bg-brand-50/15 dark:bg-brand-950/10 font-bold text-slate-900 dark:text-white">
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
        )}
      </div>
    </div>
  );
};
