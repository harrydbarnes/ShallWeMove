import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUpDown,
  Filter,
  Eye,
  Trash2,
  GitCompare,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PoundSterling,
  Building,
  Pencil,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateFitScore } from '../../lib/scoring/fitScore';
import { formatCurrency, formatDualArea } from '../../lib/utils/formatters';
import { Property } from '../../types/property';
import { homeName } from '../../lib/utils/homePresentation';

interface ShortlistPageProps {
  onOpenAddListing: () => void;
  onSelectListingForComparison: (id: string) => void;
}

export const ShortlistPage: React.FC<ShortlistPageProps> = ({
  onOpenAddListing,
  onSelectListingForComparison,
}) => {
  const {
    listings,
    activeCurrentHouse,
    wants,
    deleteListing,
    updateListing,
    secondaryListingId,
    setSecondaryListingId,
  } = useApp();

  const [sortBy, setSortBy] = useState<'score' | 'price_asc' | 'price_desc' | 'beds' | 'area'>('score');
  const [filterNoDealBreakers, setFilterNoDealBreakers] = useState(false);
  const [headToHeadMode, setHeadToHeadMode] = useState(false);
  const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedPropAId, setSelectedPropAId] = useState<string>(
    listings.length > 0 ? listings[0].id : ''
  );
  const [selectedPropBId, setSelectedPropBId] = useState<string>(
    listings.length > 1 ? listings[1].id : ''
  );

  // Compute fit scores for all listings
  const scoredListings = listings.map((prop) => {
    const score = calculateFitScore(prop, wants, activeCurrentHouse);
    return { prop, score };
  });

  // Filter & Sort
  const filtered = scoredListings.filter(({ score }) => {
    if (filterNoDealBreakers && score.isDealBreakerHit) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'score') return b.score.overallScore - a.score.overallScore;
    if (sortBy === 'price_asc') return a.prop.price - b.prop.price;
    if (sortBy === 'price_desc') return b.prop.price - a.prop.price;
    if (sortBy === 'beds') return b.prop.bedrooms - a.prop.bedrooms;
    if (sortBy === 'area') return (b.prop.floorAreaSqFt || 0) - (a.prop.floorAreaSqFt || 0);
    return 0;
  });

  const propA = listings.find((l) => l.id === selectedPropAId) || listings[0];
  const propB = listings.find((l) => l.id === selectedPropBId && l.id !== propA?.id)
    || listings.find((l) => l.id !== propA?.id);
  const scoreA = propA ? calculateFitScore(propA, wants, activeCurrentHouse) : null;
  const scoreB = propB ? calculateFitScore(propB, wants, activeCurrentHouse) : null;

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Building className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Listings in Your Shortlist Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Add listings using our Bookmarklet or paste box to see them ranked by Fit Score and compare them head-to-head.
        </p>
        <button
          onClick={onOpenAddListing}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          Add Your First Listing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shortlist Header & Controls */}
      <div className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Your shortlist</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[11px] font-bold">
              {listings.length} {listings.length === 1 ? 'Home' : 'Homes'}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked against your priorities for {activeCurrentHouse.profileName || activeCurrentHouse.displayAddress}
          </p>
        </div>

        {/* View Mode Toggle: Ranked Table vs Head-to-Head */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setHeadToHeadMode(!headToHeadMode)}
            disabled={listings.length < 2}
            title={listings.length < 2 ? 'Add a second listing to compare two homes' : undefined}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
              headToHeadMode
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{headToHeadMode ? 'Back to shortlist' : 'Compare two homes'}</span>
          </button>

          <button
            onClick={onOpenAddListing}
            className="px-3.5 py-1.5 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-lg font-semibold flex items-center space-x-1 hover:bg-brand-100 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Listing</span>
          </button>
        </div>
      </div>

      {/* HEAD-TO-HEAD TWO LISTINGS MODE */}
      {headToHeadMode && (
        <div className="space-y-6">
          {/* Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Home A
              </label>
              <select
                value={propA?.id || ''}
                onChange={(e) => setSelectedPropAId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {homeName(l)} ({formatCurrency(l.price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Home B
              </label>
              <select
                value={propB?.id || ''}
                onChange={(e) => setSelectedPropBId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id} disabled={l.id === propA?.id}>
                    {homeName(l)} ({formatCurrency(l.price)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {propA && propB && scoreA && scoreB && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs">
                      <th className="p-4 w-1/3">Feature</th>
                      <th className="p-4 w-1/3 text-brand-700 dark:text-brand-300">
                        {homeName(propA)}
                      </th>
                      <th className="p-4 w-1/3 text-emerald-700 dark:text-emerald-300">
                        {homeName(propB)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Score */}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/40">
                      <td className="p-4 font-bold">Fit Score (vs Current Home)</td>
                      <td className="p-4 font-black text-lg text-brand-600 dark:text-brand-400">
                        {scoreA.overallScore}/100
                      </td>
                      <td className="p-4 font-black text-lg text-emerald-600 dark:text-emerald-400">
                        {scoreB.overallScore}/100
                      </td>
                    </tr>
                    {/* Price */}
                    <tr>
                      <td className="p-4 font-semibold">Asking Price</td>
                      <td className="p-4 font-bold">{formatCurrency(propA.price)}</td>
                      <td className="p-4 font-bold">{formatCurrency(propB.price)}</td>
                    </tr>
                    {/* Bedrooms */}
                    <tr>
                      <td className="p-4 font-semibold">Bedrooms</td>
                      <td className="p-4">{propA.bedrooms} {propA.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</td>
                      <td className="p-4">{propB.bedrooms} {propB.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</td>
                    </tr>
                    {/* Bathrooms */}
                    <tr>
                      <td className="p-4 font-semibold">Bathrooms</td>
                      <td className="p-4">{propA.bathrooms} {propA.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</td>
                      <td className="p-4">{propB.bathrooms} {propB.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</td>
                    </tr>
                    {/* Floor Area */}
                    <tr>
                      <td className="p-4 font-semibold">Floor Area</td>
                      <td className="p-4">{formatDualArea(propA.floorAreaSqFt, propA.floorAreaSqM)}</td>
                      <td className="p-4">{formatDualArea(propB.floorAreaSqFt, propB.floorAreaSqM)}</td>
                    </tr>
                    {/* Tenure */}
                    <tr>
                      <td className="p-4 font-semibold">Tenure</td>
                      <td className="p-4 capitalize">{propA.tenure.replace(/_/g, ' ')}</td>
                      <td className="p-4 capitalize">{propB.tenure.replace(/_/g, ' ')}</td>
                    </tr>
                    {/* Garden */}
                    <tr>
                      <td className="p-4 font-semibold">Garden Orientation</td>
                      <td className="p-4 capitalize">{propA.gardenOrientation.replace('_', '-')}</td>
                      <td className="p-4 capitalize">{propB.gardenOrientation.replace('_', '-')}</td>
                    </tr>
                    {/* Parking */}
                    <tr>
                      <td className="p-4 font-semibold">Parking Spaces</td>
                      <td className="p-4">{propA.parkingSpaces} {propA.parkingSpaces === 1 ? 'space' : 'spaces'}</td>
                      <td className="p-4">{propB.parkingSpaces} {propB.parkingSpaces === 1 ? 'space' : 'spaces'}</td>
                    </tr>
                    {/* Loft */}
                    <tr>
                      <td className="p-4 font-semibold">Loft Status</td>
                      <td className="p-4 capitalize">{propA.loftStatus.replace(/_/g, ' ')}</td>
                      <td className="p-4 capitalize">{propB.loftStatus.replace(/_/g, ' ')}</td>
                    </tr>
                    {/* EPC */}
                    <tr>
                      <td className="p-4 font-semibold">EPC Rating</td>
                      <td className="p-4 font-bold">Band {propA.epcRating}</td>
                      <td className="p-4 font-bold">Band {propB.epcRating}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RANKED SHORTLIST TABLE */}
      {!headToHeadMode && (
        <div className="space-y-4">
          {/* Filter / Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="score">Highest Fit Score</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="beds">Most Bedrooms</option>
                <option value="area">Largest Floor Area</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterNoDealBreakers}
                onChange={(e) => setFilterNoDealBreakers(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Exclude Deal Breaker Violations
              </span>
            </label>
          </div>

          {/* Cards / Table View */}
          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300">
                Every saved listing currently triggers a deal breaker. Clear the filter to see all homes.
                <button onClick={() => setFilterNoDealBreakers(false)} className="ml-2 font-semibold text-brand-700 underline dark:text-brand-300">Show all listings</button>
              </div>
            )}
            {filtered.map(({ prop, score }, index) => {
              return (
                <div
                  key={prop.id}
                  className={`p-5 rounded-2xl border transition shadow-sm bg-white dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    score.isDealBreakerHit
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-500'
                  }`}
                >
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{homeName(prop)}</h3>
                      <button type="button" onClick={() => { setEditingHomeId(prop.id); setEditingName(prop.nickname || ''); }} aria-label={`Rename ${homeName(prop)}`} className="rounded p-1 text-slate-400 hover:text-brand-700 dark:hover:text-brand-300"><Pencil className="h-3.5 w-3.5" /></button>
                      {prop.source === 'sample' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">Sample</span>}
                      {score.isDealBreakerHit && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          Deal Breaker Hit
                        </span>
                      )}
                    </div>

                    {editingHomeId === prop.id && (
                      <form onSubmit={(event) => { event.preventDefault(); updateListing({ ...prop, nickname: editingName.trim() || undefined, updatedAt: new Date().toISOString() }); setEditingHomeId(null); }} className="flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`home-name-${prop.id}`}>Home name</label>
                        <input id={`home-name-${prop.id}`} autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} maxLength={60} placeholder="Home name" className="min-w-40 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                        <button type="submit" className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white">Save name</button>
                        <button type="button" onClick={() => setEditingHomeId(null)} className="px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300">Cancel</button>
                      </form>
                    )}
                    {prop.nickname && <p className="text-xs text-slate-500 dark:text-slate-400">{prop.displayAddress}</p>}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(prop.price)}
                      </span>
                      <span>•</span>
                      <span>{prop.bedrooms} {prop.bedrooms === 1 ? 'bed' : 'beds'}</span>
                      <span>•</span>
                      <span>{prop.bathrooms} {prop.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
                      <span>•</span>
                      <span className="capitalize">{prop.propertyType.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{formatDualArea(prop.floorAreaSqFt, prop.floorAreaSqM, true)}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-1">
                      {score.plainEnglishVerdict}
                    </p>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex items-center space-x-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {score.overallScore}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          (score.scoreDelta || 0) > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {(score.scoreDelta || 0) > 0 ? `+${score.scoreDelta}` : score.scoreDelta} vs current
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectListingForComparison(prop.id)}
                        className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </button>

                      <button
                        onClick={() => deleteListing(prop.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        title="Delete from shortlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
